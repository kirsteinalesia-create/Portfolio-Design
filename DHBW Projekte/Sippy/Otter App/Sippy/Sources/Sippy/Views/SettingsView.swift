import SwiftUI

/// User-facing configuration screen.  All changes are persisted immediately.
struct SettingsView: View {
    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            SettingsContent()
                .padding(.horizontal, 18)
                .padding(.top, 12)
                .padding(.bottom, 16)
        }
        .frame(minHeight: 380, maxHeight: 480)
    }
}

/// The plain (unscrolling) settings content — kept separate so it can also be
/// snapshot-rendered for previews without an enclosing ScrollView.
struct SettingsContent: View {
    @EnvironmentObject private var store: HydrationStore
    @EnvironmentObject private var notifications: NotificationManager
    @State private var confirmReset = false

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
                section(title: "Targets") {
                    stepperRow(
                        title: "Daily target",
                        value: Binding(
                            get: { store.settings.dailyTargetML },
                            set: { store.settings.dailyTargetML = $0 }
                        ),
                        range: 400...4000,
                        step: 100,
                        suffix: " ml"
                    )
                    stepperRow(
                        title: "Hourly target",
                        value: Binding(
                            get: { store.settings.hourlyTargetML },
                            set: { store.settings.hourlyTargetML = $0 }
                        ),
                        range: 50...800,
                        step: 50,
                        suffix: " ml"
                    )
                }

                section(title: "Working hours") {
                    hourPickerRow(
                        title: "Start",
                        value: Binding(
                            get: { store.settings.startHour },
                            set: {
                                store.settings.startHour = min($0, store.settings.endHour - 1)
                                reschedule()
                            }
                        )
                    )
                    hourPickerRow(
                        title: "End",
                        value: Binding(
                            get: { store.settings.endHour },
                            set: {
                                store.settings.endHour = max($0, store.settings.startHour + 1)
                                reschedule()
                            }
                        )
                    )
                }

                section(title: "Reminders") {
                    toggleRow(
                        title: "Enable notifications",
                        subtitle: notificationSubtitle,
                        value: Binding(
                            get: { store.settings.notificationsEnabled },
                            set: { newValue in
                                store.settings.notificationsEnabled = newValue
                                if newValue {
                                    Task { await notifications.requestAuthorizationIfNeeded() }
                                }
                                reschedule()
                            }
                        )
                    )
                    stepperRow(
                        title: "Interval",
                        value: Binding(
                            get: { store.settings.reminderIntervalMinutes },
                            set: {
                                store.settings.reminderIntervalMinutes = $0
                                reschedule()
                            }
                        ),
                        range: 15...240,
                        step: 15,
                        suffix: " min"
                    )
                }

                section(title: "System") {
                    toggleRow(
                        title: "Launch at login",
                        subtitle: "Open Sippy automatically when you sign in.",
                        value: Binding(
                            get: { store.settings.launchAtLogin },
                            set: { newValue in
                                let ok = LaunchAtLoginManager.setEnabled(newValue)
                                store.settings.launchAtLogin = ok ? newValue : LaunchAtLoginManager.isEnabled
                            }
                        )
                    )
                }

                section(title: "Data") {
                    Button(role: .destructive) {
                        confirmReset = true
                    } label: {
                        HStack {
                            Image(systemName: "trash")
                            Text("Reset all data")
                        }
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Palette.brown)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(Palette.pinkSoft.opacity(0.6))
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    }
                    .buttonStyle(.plain)
                    .alert("Reset all hydration data?", isPresented: $confirmReset) {
                        Button("Cancel", role: .cancel) {}
                        Button("Reset", role: .destructive) { store.resetAllData() }
                    } message: {
                        Text("All logged water entries will be deleted. This cannot be undone.")
                    }
                }

                footer
            }
    }

    // MARK: – Sections

    private var footer: some View {
        VStack(alignment: .leading, spacing: 4) {
            Divider().overlay(Palette.hairline)
            HStack {
                Text("Sippy • v\(appVersion)")
                    .font(Typo.caption(9))
                    .foregroundStyle(Palette.brown.opacity(0.5))
                Spacer()
                Button {
                    NSApp.terminate(nil)
                } label: {
                    Text("Quit Sippy")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(Palette.brown.opacity(0.55))
                }
                .buttonStyle(.plain)
            }
            .padding(.top, 6)
        }
    }

    private var appVersion: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0"
    }

    private var notificationSubtitle: String {
        switch notifications.authorizationStatus {
        case .notDetermined: return "Ask for permission when needed."
        case .denied:        return "Denied in System Settings. Enable notifications for Sippy there."
        case .authorized, .provisional, .ephemeral: return "Friendly hourly reminders."
        @unknown default:    return ""
        }
    }

    private func reschedule() {
        let today = store.today
        let currentHour = Calendar.current.component(.hour, from: Date())
        notifications.reschedule(
            settings: store.settings,
            currentTotal: today.total,
            currentHourTotal: today.amount(inHour: currentHour)
        )
    }

    // MARK: – Reusable rows

    private func section<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased())
                .font(Typo.caption(9))
                .tracking(1.2)
                .foregroundStyle(Palette.brown.opacity(0.5))
            VStack(spacing: 0) {
                content()
            }
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Palette.beigeDeep.opacity(0.35))
            )
        }
    }

    private func stepperRow(
        title: String,
        value: Binding<Int>,
        range: ClosedRange<Int>,
        step: Int,
        suffix: String
    ) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Palette.brown)
            Spacer()
            HStack(spacing: 6) {
                stepButton(systemName: "minus") {
                    let n = max(range.lowerBound, value.wrappedValue - step)
                    value.wrappedValue = n
                }
                Text("\(value.wrappedValue)\(suffix)")
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(Palette.brown)
                    .frame(minWidth: 60)
                stepButton(systemName: "plus") {
                    let n = min(range.upperBound, value.wrappedValue + step)
                    value.wrappedValue = n
                }
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
    }

    private func stepButton(systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 9, weight: .heavy))
                .foregroundStyle(Palette.brown)
                .frame(width: 22, height: 22)
                .background(Palette.beige)
                .clipShape(Circle())
                .overlay(Circle().stroke(Palette.brown.opacity(0.18), lineWidth: 0.6))
        }
        .buttonStyle(.plain)
    }

    private func hourPickerRow(title: String, value: Binding<Int>) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Palette.brown)
            Spacer()
            Picker("", selection: value) {
                ForEach(0..<24, id: \.self) { h in
                    Text(String(format: "%02d:00", h)).tag(h)
                }
            }
            .labelsHidden()
            .pickerStyle(.menu)
            .frame(width: 100)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
    }

    private func toggleRow(title: String, subtitle: String, value: Binding<Bool>) -> some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Palette.brown)
                Text(subtitle)
                    .font(.system(size: 10.5))
                    .foregroundStyle(Palette.brown.opacity(0.55))
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer()
            Toggle("", isOn: value)
                .labelsHidden()
                .toggleStyle(.switch)
                .tint(Palette.water)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
    }
}
