import SwiftUI

/// Root of the main window. Handles first-run onboarding and tab switching.
struct PopoverRootView: View {
    @EnvironmentObject private var store: HydrationStore
    @EnvironmentObject private var notifications: NotificationManager
    @State private var tab: PopoverTab = .today
    @Namespace private var navNS

    var body: some View {
        ZStack {
            Palette.beige.ignoresSafeArea()

            if !store.settings.didFinishOnboarding {
                OnboardingView()
                    .transition(.opacity)
            } else {
                VStack(spacing: 0) {
                    topBar
                    Divider().overlay(Palette.hairlineSoft)
                    content
                    Spacer(minLength: 0)
                }
            }
        }
        .animation(.easeInOut(duration: 0.22), value: store.settings.didFinishOnboarding)
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: tab)
    }

    // MARK: – Top bar (also acts as the window's drag region)

    private var topBar: some View {
        HStack(spacing: 10) {
            MenuBarIcon(progress: nil, size: 20)
            Text("Sippy")
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundStyle(Palette.brown)
            Spacer(minLength: 8)
            SegmentedNav(selection: $tab, namespace: navNS)
        }
        .padding(.horizontal, 16)
        .padding(.top, 14)
        .padding(.bottom, 10)
        .background(WindowDragArea())
    }

    // MARK: – Content

    @ViewBuilder
    private var content: some View {
        switch tab {
        case .today:
            TodayView().transition(.opacity)
        case .month:
            MonthView().transition(.opacity)
        case .settings:
            SettingsView().transition(.opacity)
        }
    }
}

/// Transparent view that lets the user drag the window by grabbing the top bar
/// area — needed because we use `.hiddenTitleBar`.
private struct WindowDragArea: NSViewRepresentable {
    func makeNSView(context: Context) -> DragView { DragView() }
    func updateNSView(_ nsView: DragView, context: Context) {}

    final class DragView: NSView {
        override var mouseDownCanMoveWindow: Bool { true }
    }
}
