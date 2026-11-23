import SwiftUI

/// The main dashboard: mascot copy, water glass, total, quick-add row, hourly track.
struct TodayView: View {
    @EnvironmentObject private var store: HydrationStore
    @State private var rippleTrigger: Bool = false
    @State private var lastCelebratedDayId: String? = nil
    @State private var celebrationPulse: Bool = false

    private var day: HydrationDay { store.today }
    private var progress: Double  { day.progress(target: store.settings.dailyTargetML) }
    private var raw: Double       { day.rawProgress(target: store.settings.dailyTargetML) }
    private var mood: OtterMood   { OtterMood.forProgress(raw) }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            header
            heroRow
            totalRow
            Divider().overlay(Palette.hairline)
            currentHourSection
            Divider().overlay(Palette.hairline)
            hourlySection
        }
        .padding(.horizontal, 18)
        .padding(.top, 14)
        .padding(.bottom, 16)
        .onAppear(perform: checkForCelebration)
        .onChange(of: raw) { _, _ in checkForCelebration() }
    }

    // MARK: – Sub-sections

    private var header: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(todayLabel.uppercased())
                .font(Typo.caption(9.5))
                .tracking(1.2)
                .foregroundStyle(Palette.brown.opacity(0.45))
            Text(greeting)
                .font(Typo.quote(13))
                .foregroundStyle(Palette.brown.opacity(0.78))
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var todayLabel: String {
        let f = DateFormatter()
        f.dateFormat = "EEEE · d MMMM"
        return f.string(from: Date())
    }

    private var heroRow: some View {
        HStack(alignment: .center, spacing: 16) {
            OtterMascot(mood: mood, size: 104)
                .frame(width: 104, height: 104)
                .scaleEffect(celebrationPulse ? 1.08 : 1.0)

            Spacer()

            WaterGlass(progress: min(1.0, raw), animateRipple: rippleTrigger)
                .frame(width: 78, height: 118)

            Spacer(minLength: 0)
        }
    }

    private var totalRow: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(alignment: .lastTextBaseline, spacing: 6) {
                Text("\(day.total)")
                    .font(Typo.display(30))
                    .foregroundStyle(Palette.brown)
                    .contentTransition(.numericText(value: Double(day.total)))
                Text("/ \(store.settings.dailyTargetML) ml")
                    .font(.system(size: 12, weight: .medium, design: .rounded))
                    .foregroundStyle(Palette.brown.opacity(0.55))
                Spacer()
                if raw >= 1.0 {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.seal.fill")
                            .foregroundStyle(Palette.success)
                        Text("Goal reached")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(Palette.success)
                    }
                }
            }
            progressBar
        }
    }

    private var progressBar: some View {
        GeometryReader { geo in
            let w = geo.size.width
            ZStack(alignment: .leading) {
                Capsule().fill(Palette.beigeDeep.opacity(0.55))
                Capsule()
                    .fill(
                        LinearGradient(
                            colors: [Palette.waterLight, Palette.water, Palette.waterDeep],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
                    .frame(width: max(4, w * CGFloat(min(1.0, raw))))
                    .animation(.spring(response: 0.6, dampingFraction: 0.78), value: raw)
            }
        }
        .frame(height: 6)
    }

    private var currentHourSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("THIS HOUR")
                    .font(Typo.caption())
                    .tracking(1.1)
                    .foregroundStyle(Palette.brown.opacity(0.55))
                Spacer()
                Text("\(day.amount(inHour: Calendar.current.component(.hour, from: Date()))) / \(store.settings.hourlyTargetML) ml")
                    .font(.system(size: 10.5, weight: .medium, design: .rounded))
                    .foregroundStyle(Palette.brown.opacity(0.65))
            }
            QuickAddButtons(
                presets: store.settings.quickAddPresets,
                onAdd: { amt in
                    store.addWater(amt)
                    rippleTrigger.toggle()
                    NotificationCenter.default.post(name: .sippyStateChanged, object: nil)
                },
                onUndo: {
                    _ = store.undoLastEntry()
                    NotificationCenter.default.post(name: .sippyStateChanged, object: nil)
                }
            )
        }
    }

    private var hourlySection: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("\(store.settings.workingHours) HOURS")
                    .font(Typo.caption())
                    .tracking(1.1)
                    .foregroundStyle(Palette.brown.opacity(0.55))
                Spacer()
            }
            HourlyProgress(
                day: day,
                startHour: store.settings.startHour,
                endHour: store.settings.endHour,
                hourlyTarget: store.settings.hourlyTargetML
            )
        }
    }

    // MARK: – Helpers

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let mainPart: String
        switch hour {
        case 5..<11:  mainPart = "Good morning"
        case 11..<14: mainPart = "Hello"
        case 14..<18: mainPart = "Good afternoon"
        case 18..<22: mainPart = "Good evening"
        default:      mainPart = "Still up?"
        }

        let mood = OtterMood.forProgress(raw)
        let tail: String
        switch mood {
        case .sleepy:      tail = "let's start with a sip."
        case .thirsty:     tail = "the otter is a little thirsty."
        case .content:     tail = "you're doing great."
        case .happy:       tail = "almost there!"
        case .celebrating: tail = "you nailed today's goal 🎉"
        }
        return "\(mainPart) — \(tail)"
    }

    private func checkForCelebration() {
        guard raw >= 1.0, lastCelebratedDayId != day.id else { return }
        lastCelebratedDayId = day.id
        withAnimation(.spring(response: 0.35, dampingFraction: 0.55)) {
            celebrationPulse = true
        }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 400_000_000)
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) {
                celebrationPulse = false
            }
        }
    }
}

extension Notification.Name {
    static let sippyStateChanged = Notification.Name("sippy.stateChanged")
}
