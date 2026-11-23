import SwiftUI

/// A very short introduction shown on first launch. Two tiny screens:
///   1. Hello / concept.
///   2. Working-hour setup.
struct OnboardingView: View {
    @EnvironmentObject private var store: HydrationStore
    @EnvironmentObject private var notifications: NotificationManager
    @State private var step: Int = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Group {
                if step == 0 { intro }
                else         { hoursStep }
            }
            .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal:   .move(edge: .leading).combined(with: .opacity)
            ))

            Spacer(minLength: 0)

            HStack {
                if step > 0 {
                    Button("Back") {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) { step -= 1 }
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(Palette.brown.opacity(0.55))
                    .font(.system(size: 11, weight: .medium))
                }
                Spacer()
                Button(action: primaryAction) {
                    HStack(spacing: 6) {
                        Text(primaryTitle)
                        Image(systemName: step == 1 ? "checkmark" : "arrow.right")
                    }
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Palette.beige)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Palette.brown)
                    .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(18)
    }

    // MARK: – Steps

    private var intro: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Spacer()
                OtterMascot(mood: .content, size: 96)
                Spacer()
            }
            Text("Hi! I'm your hydration buddy.")
                .font(Typo.title(15))
                .foregroundStyle(Palette.brown)
            Text("Sippy nudges you to drink around 200 ml of water every hour — kindly, not annoyingly. Log sips in one tap, watch the glass fill up, and I'll cheer you on.")
                .font(Typo.body(11.5))
                .foregroundStyle(Palette.brown.opacity(0.75))
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var hoursStep: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("When are you at your desk?")
                .font(Typo.title(14))
                .foregroundStyle(Palette.brown)
            Text("I'll remind you between these hours only. You can change this later in Settings.")
                .font(Typo.body(11))
                .foregroundStyle(Palette.brown.opacity(0.65))

            HStack(spacing: 10) {
                hourPicker("Start", binding: Binding(
                    get: { store.settings.startHour },
                    set: { store.settings.startHour = min($0, store.settings.endHour - 1) }
                ))
                Text("–").foregroundStyle(Palette.brown.opacity(0.4))
                hourPicker("End", binding: Binding(
                    get: { store.settings.endHour },
                    set: { store.settings.endHour = max($0, store.settings.startHour + 1) }
                ))
            }
            .padding(10)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Palette.beigeDeep.opacity(0.35))
            )

            HStack(spacing: 8) {
                Toggle("", isOn: Binding(
                    get: { store.settings.notificationsEnabled },
                    set: { store.settings.notificationsEnabled = $0 }
                ))
                .labelsHidden()
                .toggleStyle(.switch)
                .tint(Palette.water)

                VStack(alignment: .leading, spacing: 1) {
                    Text("Hourly reminders")
                        .font(.system(size: 11.5, weight: .medium))
                        .foregroundStyle(Palette.brown)
                    Text("Friendly nudges from your otter.")
                        .font(.system(size: 10))
                        .foregroundStyle(Palette.brown.opacity(0.55))
                }
                Spacer()
            }
        }
    }

    private func hourPicker(_ title: String, binding: Binding<Int>) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(title.uppercased())
                .font(Typo.caption(8.5))
                .tracking(1)
                .foregroundStyle(Palette.brown.opacity(0.55))
            Picker("", selection: binding) {
                ForEach(0..<24, id: \.self) { h in
                    Text(String(format: "%02d:00", h)).tag(h)
                }
            }
            .labelsHidden()
            .pickerStyle(.menu)
            .frame(minWidth: 90)
        }
    }

    // MARK: – Actions

    private var primaryTitle: String { step == 0 ? "Let's go" : "Start hydrating" }

    private func primaryAction() {
        if step == 0 {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) { step = 1 }
        } else {
            store.settings.didFinishOnboarding = true
            if store.settings.notificationsEnabled {
                Task {
                    await notifications.requestAuthorizationIfNeeded()
                    await MainActor.run {
                        notifications.reschedule(
                            settings: store.settings,
                            currentTotal: store.today.total,
                            currentHourTotal: 0
                        )
                    }
                }
            }
        }
    }
}
