import SwiftUI
import AppKit

/// Renders the popover views to PNG snapshots for visual QA.
///
/// Invoke via:  Sippy --preview <output-dir>
@MainActor
enum PreviewRenderer {

    static func run(outputDirectory: URL) throws {
        try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

        // Seed a store with sample data for a nicer preview
        let store = HydrationStore(defaults: makeEphemeralDefaults())
        var settings = AppSettings.default
        settings.didFinishOnboarding = true
        store.settings = settings

        // Seed with a plausible day
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        for (hour, ml) in [(9, 200), (10, 200), (11, 150), (12, 300), (13, 200), (14, 100)] {
            let comps = DateComponents(hour: hour, minute: 15)
            if let date = cal.date(byAdding: comps, to: today) {
                store.addWater(ml, at: date)
            }
        }
        // Seed some history for MonthView
        for daysAgo in 1...20 {
            if let date = cal.date(byAdding: .day, value: -daysAgo, to: today) {
                let target = Int.random(in: 800...1900)
                var added = 0
                while added < target {
                    let chunk = [100, 150, 200, 250].randomElement()!
                    let hour = Int.random(in: 9..<17)
                    let stamp = cal.date(byAdding: DateComponents(hour: hour, minute: Int.random(in: 0..<60)), to: date)!
                    store.addWater(chunk, at: stamp)
                    added += chunk
                }
            }
        }

        let notifications = NotificationManager.shared

        try render(
            named: "onboarding.png",
            in: outputDirectory,
            size: CGSize(width: 360, height: 460)
        ) {
            AnyView(
                OnboardingRootPreview()
                    .environmentObject(HydrationStore(defaults: makeEphemeralDefaults()))
                    .environmentObject(notifications)
            )
        }

        try render(
            named: "today.png",
            in: outputDirectory,
            size: CGSize(width: 360, height: 460)
        ) {
            AnyView(
                PopoverRootView()
                    .environmentObject(store)
                    .environmentObject(notifications)
            )
        }

        // For month and settings we manually pick the tab.
        try render(
            named: "month.png",
            in: outputDirectory,
            size: CGSize(width: 360, height: 500)
        ) {
            AnyView(
                MonthViewPreviewFrame()
                    .environmentObject(store)
                    .environmentObject(notifications)
            )
        }

        try render(
            named: "settings.png",
            in: outputDirectory,
            size: CGSize(width: 360, height: 540)
        ) {
            AnyView(
                SettingsViewPreviewFrame()
                    .environmentObject(store)
                    .environmentObject(notifications)
            )
        }

        // Also render mascot states side-by-side
        try render(
            named: "mascots.png",
            in: outputDirectory,
            size: CGSize(width: 620, height: 130)
        ) {
            AnyView(
                HStack(spacing: 8) {
                    ForEach([OtterMood.sleepy, .thirsty, .content, .happy, .celebrating], id: \.stringValue) { m in
                        VStack(spacing: 4) {
                            OtterMascot(mood: m, size: 100, animated: false)
                            Text(m.stringValue)
                                .font(.system(size: 10, weight: .medium, design: .rounded))
                                .foregroundStyle(Palette.brown)
                        }
                    }
                }
                .padding(12)
                .background(Palette.beige)
            )
        }

        // Widget states — same size the desktop widget uses.
        for (name, fillFraction) in [
            ("widget-empty.png",     0.0),
            ("widget-half.png",      0.5),
            ("widget-goal.png",      1.0),
        ] {
            let widgetStore = HydrationStore(defaults: makeEphemeralDefaults())
            var s = AppSettings.default
            s.didFinishOnboarding = true
            widgetStore.settings = s
            let ml = Int(Double(s.dailyTargetML) * fillFraction)
            if ml > 0 { widgetStore.addWater(ml) }

            try render(
                named: name,
                in: outputDirectory,
                size: CGSize(width: 320, height: 240)
            ) {
                AnyView(
                    WidgetPreviewFrame()
                        .environmentObject(widgetStore)
                        .environmentObject(notifications)
                )
            }
        }

        print("Previews written to \(outputDirectory.path)")
    }

    // MARK: – Helpers

    private static func render<V: View>(
        named name: String,
        in dir: URL,
        size: CGSize,
        @ViewBuilder content: () -> V
    ) throws {
        let view = content().frame(width: size.width, height: size.height)
        let renderer = ImageRenderer(content: view)
        renderer.scale = 2.0
        guard let cg = renderer.cgImage else { return }
        let image = NSImage(cgImage: cg, size: size)
        try writePNG(image: image, to: dir.appendingPathComponent(name))
        print("  wrote \(name)")
    }

    private static func writePNG(image: NSImage, to url: URL) throws {
        guard let tiff = image.tiffRepresentation,
              let rep = NSBitmapImageRep(data: tiff),
              let data = rep.representation(using: .png, properties: [:])
        else { throw NSError(domain: "Preview", code: 1) }
        try data.write(to: url)
    }

    private static func makeEphemeralDefaults() -> UserDefaults {
        let d = UserDefaults(suiteName: "sippy.preview.\(UUID().uuidString)")!
        return d
    }
}

// MARK: – Preview scaffolding

extension OtterMood {
    fileprivate var stringValue: String {
        switch self {
        case .sleepy:      return "sleepy"
        case .thirsty:     return "thirsty"
        case .content:     return "content"
        case .happy:       return "happy"
        case .celebrating: return "celebrating"
        }
    }
}

/// Renders just the onboarding branch of the popover for QA.
private struct OnboardingRootPreview: View {
    var body: some View {
        ZStack {
            Palette.beige
            OnboardingView()
        }
        .frame(width: 360, height: 460)
    }
}

/// Renders the desktop widget on a translucent background for QA.
private struct WidgetPreviewFrame: View {
    @State private var showPopover = false
    var body: some View {
        ZStack {
            // A soft background to make the beige card readable.
            LinearGradient(
                colors: [Color(red: 0.16, green: 0.22, blue: 0.35),
                         Color(red: 0.95, green: 0.55, blue: 0.35)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            WidgetView(isPopoverShown: $showPopover)
        }
    }
}

/// Popover shell that force-selects the Month tab.
private struct MonthViewPreviewFrame: View {
    @EnvironmentObject var store: HydrationStore
    @EnvironmentObject var notifications: NotificationManager
    var body: some View {
        ZStack {
            Palette.beige
            VStack(spacing: 0) {
                header
                Divider().overlay(Palette.hairlineSoft)
                MonthView()
            }
        }
    }
    private var header: some View {
        HStack {
            HStack(spacing: 8) {
                MenuBarIcon(progress: nil, size: 22)
                Text("Sippy").font(.system(size: 13, weight: .semibold, design: .rounded)).foregroundStyle(Palette.brown)
            }
            Spacer()
            Text("MONTH")
                .font(Typo.caption(10)).tracking(1.2)
                .foregroundStyle(Palette.brown.opacity(0.55))
        }
        .padding(.horizontal, 14).padding(.vertical, 10)
    }
}

/// Popover shell that force-selects the Settings tab.
private struct SettingsViewPreviewFrame: View {
    @EnvironmentObject var store: HydrationStore
    @EnvironmentObject var notifications: NotificationManager
    var body: some View {
        ZStack {
            Palette.beige
            VStack(spacing: 0) {
                header
                Divider().overlay(Palette.hairlineSoft)
                SettingsContent()
                    .padding(.horizontal, 18)
                    .padding(.top, 12)
                    .padding(.bottom, 16)
            }
        }
    }
    private var header: some View {
        HStack {
            HStack(spacing: 8) {
                MenuBarIcon(progress: nil, size: 22)
                Text("Sippy").font(.system(size: 13, weight: .semibold, design: .rounded)).foregroundStyle(Palette.brown)
            }
            Spacer()
            Text("SETTINGS")
                .font(Typo.caption(10)).tracking(1.2)
                .foregroundStyle(Palette.brown.opacity(0.55))
        }
        .padding(.horizontal, 14).padding(.vertical, 10)
    }
}
