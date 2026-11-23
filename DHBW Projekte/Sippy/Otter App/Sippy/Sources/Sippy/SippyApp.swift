import SwiftUI
import AppKit
import UserNotifications

/// Program entry — we manually dispatch so we can implement the
/// `--generate-icons <path>` and `--preview <path>` build-time helpers
/// without spinning up the full app.
@main
enum SippyMain {
    static func main() {
        let args = CommandLine.arguments

        // Icon-generation mode (used by the build script).
        if let idx = args.firstIndex(of: "--generate-icons"), idx + 1 < args.count {
            let outPath = args[idx + 1]
            MainActor.assumeIsolated {
                do {
                    try IconGenerator.run(outputDirectory: URL(fileURLWithPath: outPath))
                    exit(0)
                } catch {
                    FileHandle.standardError.write(Data("Icon generation failed: \(error)\n".utf8))
                    exit(1)
                }
            }
        }

        // Preview mode (used for visual QA).
        if let idx = args.firstIndex(of: "--preview"), idx + 1 < args.count {
            let outPath = args[idx + 1]
            MainActor.assumeIsolated {
                do {
                    try PreviewRenderer.run(outputDirectory: URL(fileURLWithPath: outPath))
                    exit(0)
                } catch {
                    FileHandle.standardError.write(Data("Preview render failed: \(error)\n".utf8))
                    exit(1)
                }
            }
        }

        // Regular app launch.
        SippyApp.main()
    }
}

/// Shared state container — holds the single instance of `HydrationStore`
/// and `NotificationManager` used by both the SwiftUI scenes and the AppKit
/// menu-bar controller.
@MainActor
final class AppState: ObservableObject {
    static let shared = AppState()

    let store: HydrationStore
    let notifications: NotificationManager

    private init() {
        self.store = HydrationStore()
        self.notifications = NotificationManager.shared
    }
}

/// A menu-bar app.
///
/// - The user always sees a small otter icon in the macOS menu bar.
/// - Clicking that icon (or double-clicking the Sippy.app icon on the desktop)
///   opens the animated widget as a popover.
/// - A hamburger button inside the widget opens the full dashboard in a
///   separate window.
struct SippyApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        // A separate window scene for the full dashboard. It's not shown by
        // default; it's opened via the `sippy.dashboard` id when the user
        // clicks the hamburger button in the popover.
        Window("Sippy", id: "sippy.dashboard") {
            PopoverRootView()
                .environmentObject(AppState.shared.store)
                .environmentObject(AppState.shared.notifications)
                .frame(width: 360, height: 560)
        }
        .windowResizability(.contentSize)
        .defaultSize(width: 360, height: 560)
        .commands {
            CommandGroup(replacing: .newItem) {}
            CommandGroup(replacing: .toolbar) {}
        }
    }
}

// MARK: – App delegate: owns the status item and popover

/// Sets up the menu-bar icon and its popover. Handles double-clicks on the
/// Sippy.app desktop icon by (re-)opening the popover.
@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem?
    private var popover: NSPopover?
    private var iconHosting: NSView?

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Menu-bar only: no Dock icon, no app-switcher entry.
        NSApp.setActivationPolicy(.accessory)

        setupStatusItem()
        setupPopover()
        bootBackgroundWork()

        // Show the popover once so the user immediately sees where the icon
        // sits and what the widget looks like.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
            self?.showPopover()
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }

    /// Don't terminate when the dashboard window closes — we live in the menu bar.
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        false
    }

    /// Called when the user double-clicks the Sippy.app icon on the desktop
    /// or the Dock icon while the app is already running. We interpret it as
    /// "open the widget now".
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        showPopover()
        return true
    }

    // MARK: – Status item

    private func setupStatusItem() {
        let item = NSStatusBar.system.statusItem(withLength: 26)
        guard let button = item.button else { return }

        button.action = #selector(togglePopover(_:))
        button.target = self
        button.setButtonType(.momentaryChange)
        button.imagePosition = .imageOnly

        // Host a SwiftUI icon inside the button so we can reactively update
        // the progress ring around it.
        let iconView = MenuBarIconLive()
            .environmentObject(AppState.shared.store)
        let host = NSHostingView(rootView: iconView)
        host.translatesAutoresizingMaskIntoConstraints = false
        button.addSubview(host)
        NSLayoutConstraint.activate([
            host.centerXAnchor.constraint(equalTo: button.centerXAnchor),
            host.centerYAnchor.constraint(equalTo: button.centerYAnchor),
            host.widthAnchor.constraint(equalToConstant: 20),
            host.heightAnchor.constraint(equalToConstant: 20),
        ])

        self.statusItem = item
        self.iconHosting = host
    }

    // MARK: – Popover

    private func setupPopover() {
        let p = NSPopover()
        p.behavior = .transient
        p.animates = true
        // The widget card is 300×220 and needs a bit of padding for its shadow.
        p.contentSize = NSSize(width: 330, height: 250)
        p.contentViewController = NSHostingController(
            rootView: WidgetPopoverContent()
                .environmentObject(AppState.shared.store)
                .environmentObject(AppState.shared.notifications)
        )
        self.popover = p
    }

    @objc private func togglePopover(_ sender: Any?) {
        guard let popover, let button = statusItem?.button else { return }
        if popover.isShown {
            popover.performClose(sender)
        } else {
            showPopover(from: button)
        }
    }

    private func showPopover() {
        guard let button = statusItem?.button else { return }
        showPopover(from: button)
    }

    private func showPopover(from button: NSStatusBarButton) {
        guard let popover else { return }
        if popover.isShown { return }
        NSApp.activate(ignoringOtherApps: true)
        popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
        popover.contentViewController?.view.window?.makeKey()
    }

    // MARK: – Background work

    private func bootBackgroundWork() {
        let state = AppState.shared

        let actualLaunch = LaunchAtLoginManager.isEnabled
        if actualLaunch != state.store.settings.launchAtLogin {
            state.store.settings.launchAtLogin = actualLaunch
        }

        // Reschedule notifications when hydration state or settings change.
        NotificationCenter.default.addObserver(
            forName: .sippyStateChanged, object: nil, queue: .main
        ) { [weak self] _ in
            Task { @MainActor in self?.reschedule() }
        }
        NotificationCenter.default.addObserver(
            forName: .sippyAddWaterFromNotification, object: nil, queue: .main
        ) { note in
            if let amt = note.userInfo?["amount"] as? Int {
                Task { @MainActor in
                    AppState.shared.store.addWater(amt)
                    NotificationCenter.default.post(name: .sippyStateChanged, object: nil)
                }
            }
        }
        NotificationCenter.default.addObserver(
            forName: .sippyOpenPopover, object: nil, queue: .main
        ) { [weak self] _ in
            Task { @MainActor in self?.showPopover() }
        }

        if state.store.settings.notificationsEnabled {
            Task {
                await state.notifications.requestAuthorizationIfNeeded()
                await MainActor.run { self.reschedule() }
            }
        }
    }

    private func reschedule() {
        let state = AppState.shared
        let today = state.store.today
        let currentHour = Calendar.current.component(.hour, from: Date())
        state.notifications.reschedule(
            settings: state.store.settings,
            currentTotal: today.total,
            currentHourTotal: today.amount(inHour: currentHour)
        )
    }
}

// MARK: – Menu-bar icon (reactive)

/// The SwiftUI icon shown inside the status-bar button. Reads the shared
/// store so the ring stays in sync with the current progress.
struct MenuBarIconLive: View {
    @EnvironmentObject var store: HydrationStore
    var body: some View {
        MenuBarIcon(
            progress: store.today.progress(target: store.settings.dailyTargetML),
            size: 18
        )
    }
}

// MARK: – Popover content

/// The view that appears when the user clicks the menu-bar icon.
///
/// The hamburger button inside `WidgetView` toggles a `Bool` binding — we map
/// that toggle to "open the dashboard window".
private struct WidgetPopoverContent: View {
    @Environment(\.openWindow) private var openWindow

    private var hamburgerBinding: Binding<Bool> {
        Binding(
            get: { false },
            set: { newValue in
                if newValue {
                    // Make sure a Dock icon exists while the dashboard is
                    // visible so the user has a way to bring it back.
                    NSApp.setActivationPolicy(.regular)
                    NSApp.activate(ignoringOtherApps: true)
                    openWindow(id: "sippy.dashboard")
                }
            }
        )
    }

    var body: some View {
        WidgetView(isPopoverShown: hamburgerBinding)
            .padding(14) // room for the card's soft shadow
            .background(Color.clear)
    }
}
