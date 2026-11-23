import SwiftUI

/// A calendar-style monthly overview.  Each day shows the date and a small
/// circular progress indicator representing % of daily goal.
struct MonthView: View {
    @EnvironmentObject private var store: HydrationStore
    @State private var displayedMonth: Date = Calendar.current.startOfDay(for: Date())
    @State private var hoveredDay: HydrationDay?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            header
            summary
            Divider().overlay(Palette.hairline)
            weekdayHeader
            calendarGrid
            if let hovered = hoveredDay {
                Divider().overlay(Palette.hairline)
                hoverDetail(for: hovered)
            }
        }
        .padding(.horizontal, 18)
        .padding(.top, 12)
        .padding(.bottom, 16)
    }

    // MARK: – Header

    private var header: some View {
        HStack {
            Button(action: { shift(months: -1) }) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Palette.brown.opacity(0.65))
                    .frame(width: 24, height: 24)
                    .background(Palette.beigeDeep.opacity(0.4))
                    .clipShape(Circle())
            }
            .buttonStyle(.plain)

            Spacer()

            Text(monthTitle)
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundStyle(Palette.brown)

            Spacer()

            Button(action: { shift(months: 1) }) {
                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Palette.brown.opacity(0.65))
                    .frame(width: 24, height: 24)
                    .background(Palette.beigeDeep.opacity(0.4))
                    .clipShape(Circle())
            }
            .buttonStyle(.plain)
            .disabled(isCurrentMonth)
            .opacity(isCurrentMonth ? 0.35 : 1)
        }
    }

    private var summary: some View {
        let s = store.monthlySummary(for: displayedMonth)
        return HStack(spacing: 12) {
            statBlock(title: "Average",     value: s.average == 0 ? "—" : "\(s.average) ml")
            statBlock(title: "Goal reached", value: s.daysWithData == 0 ? "—" : "\(s.daysReached)/\(s.daysWithData)")
            statBlock(title: "Total",       value: s.totalML == 0 ? "—" : formatTotal(s.totalML))
        }
    }

    private func statBlock(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(title.uppercased())
                .font(Typo.caption(9))
                .tracking(1.1)
                .foregroundStyle(Palette.brown.opacity(0.5))
            Text(value)
                .font(.system(size: 13, weight: .semibold, design: .rounded))
                .foregroundStyle(Palette.brown)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: – Grid

    private var weekdayHeader: some View {
        HStack(spacing: 0) {
            ForEach(weekdaySymbols, id: \.self) { s in
                Text(s.uppercased())
                    .font(Typo.caption(8.5))
                    .tracking(0.9)
                    .foregroundStyle(Palette.brown.opacity(0.5))
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private var calendarGrid: some View {
        let days = calendarDays()
        let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)
        return LazyVGrid(columns: columns, spacing: 6) {
            ForEach(days) { slot in
                CalendarCell(
                    slot: slot,
                    target: store.settings.dailyTargetML,
                    isToday: slot.isToday,
                    isHovered: hoveredDay?.id == slot.day?.id
                )
                .onHover { hovering in
                    if hovering, let d = slot.day {
                        hoveredDay = d
                    } else if hoveredDay?.id == slot.day?.id, !hovering {
                        hoveredDay = nil
                    }
                }
            }
        }
    }

    private func hoverDetail(for day: HydrationDay) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(dayTitle(day.date))
                    .font(.system(size: 11.5, weight: .semibold, design: .rounded))
                    .foregroundStyle(Palette.brown)
                Spacer()
                Text("\(day.total) / \(store.settings.dailyTargetML) ml")
                    .font(.system(size: 11, weight: .medium, design: .rounded))
                    .foregroundStyle(Palette.brown.opacity(0.7))
            }
            let hoursWithData = (store.settings.startHour..<store.settings.endHour)
                .filter { day.amount(inHour: $0) > 0 }
            if hoursWithData.isEmpty {
                Text("No entries recorded.")
                    .font(.system(size: 10.5))
                    .foregroundStyle(Palette.brown.opacity(0.55))
            } else {
                HStack(spacing: 8) {
                    ForEach(hoursWithData, id: \.self) { h in
                        Text("\(String(format: "%02d", h)):00 · \(day.amount(inHour: h))")
                            .font(Typo.mono(9.5))
                            .foregroundStyle(Palette.brown.opacity(0.7))
                    }
                }
            }
        }
    }

    // MARK: – Helpers

    private var monthTitle: String {
        let f = DateFormatter()
        f.dateFormat = "LLLL yyyy"
        return f.string(from: displayedMonth)
    }

    private var weekdaySymbols: [String] {
        let f = DateFormatter()
        f.calendar = Calendar.current
        let symbols = f.veryShortStandaloneWeekdaySymbols ?? ["S","M","T","W","T","F","S"]
        // Rotate to match the calendar's first weekday
        let firstWeekday = Calendar.current.firstWeekday - 1
        return Array(symbols[firstWeekday...] + symbols[..<firstWeekday])
    }

    private var isCurrentMonth: Bool {
        let cal = Calendar.current
        let a = cal.dateComponents([.year, .month], from: displayedMonth)
        let b = cal.dateComponents([.year, .month], from: Date())
        return a.year == b.year && a.month == b.month
    }

    private func shift(months: Int) {
        if let d = Calendar.current.date(byAdding: .month, value: months, to: displayedMonth) {
            withAnimation(.easeInOut(duration: 0.25)) {
                displayedMonth = d
            }
        }
    }

    private func calendarDays() -> [CalendarSlot] {
        let cal = Calendar.current
        guard
            let interval = cal.dateInterval(of: .month, for: displayedMonth),
            let range = cal.range(of: .day, in: .month, for: displayedMonth)
        else { return [] }

        let firstOfMonth = interval.start
        let firstWeekday = cal.component(.weekday, from: firstOfMonth) // 1…7
        let leading = (firstWeekday - cal.firstWeekday + 7) % 7

        var slots: [CalendarSlot] = []
        for _ in 0..<leading {
            slots.append(CalendarSlot(id: UUID().uuidString, date: nil, day: nil, isToday: false))
        }
        for dayOffset in 0..<range.count {
            let date = cal.date(byAdding: .day, value: dayOffset, to: firstOfMonth)!
            let day = store.day(for: date)
            let isToday = cal.isDateInToday(date)
            slots.append(CalendarSlot(id: "\(dayOffset)-\(day.id)", date: date, day: day, isToday: isToday))
        }
        // Pad tail to complete grid rows of 7
        while slots.count % 7 != 0 {
            slots.append(CalendarSlot(id: UUID().uuidString, date: nil, day: nil, isToday: false))
        }
        return slots
    }

    private func formatTotal(_ ml: Int) -> String {
        if ml >= 10_000 {
            let liters = Double(ml) / 1000
            return String(format: "%.1f L", liters)
        }
        return "\(ml) ml"
    }

    private func dayTitle(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "EEEE, d MMMM"
        return f.string(from: date)
    }
}

/// One slot in the month grid — may be empty (leading/trailing padding).
struct CalendarSlot: Identifiable {
    let id: String
    let date: Date?
    let day: HydrationDay?
    let isToday: Bool
}

/// A single day cell in the month grid.
private struct CalendarCell: View {
    let slot: CalendarSlot
    let target: Int
    let isToday: Bool
    let isHovered: Bool

    private var progress: Double {
        guard let day = slot.day, target > 0 else { return 0 }
        return min(1.0, Double(day.total) / Double(target))
    }

    private var raw: Double {
        guard let day = slot.day, target > 0 else { return 0 }
        return Double(day.total) / Double(target)
    }

    var body: some View {
        ZStack {
            if slot.date == nil {
                Color.clear
            } else {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(isHovered ? Palette.beigeDeep.opacity(0.9) : Palette.beigeDeep.opacity(0.45))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .stroke(
                                isToday ? Palette.brown : Palette.brown.opacity(0.05),
                                lineWidth: isToday ? 1.2 : 0.6
                            )
                    )
                VStack(spacing: 2) {
                    Text("\(dayNumber)")
                        .font(.system(size: 10, weight: .semibold, design: .rounded))
                        .foregroundStyle(Palette.brown.opacity(0.85))
                    ZStack {
                        Circle()
                            .stroke(Palette.brown.opacity(0.12), lineWidth: 1.4)
                            .frame(width: 18, height: 18)
                        Circle()
                            .trim(from: 0, to: max(0.001, progress))
                            .stroke(
                                LinearGradient(
                                    colors: [Palette.water, Palette.waterDeep],
                                    startPoint: .top,
                                    endPoint: .bottom
                                ),
                                style: StrokeStyle(lineWidth: 1.8, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))
                            .frame(width: 18, height: 18)
                        if raw >= 1.0 {
                            Image(systemName: "checkmark")
                                .font(.system(size: 7, weight: .heavy))
                                .foregroundStyle(Palette.brown)
                        } else if slot.day?.total ?? 0 > 0 {
                            Text("\(Int(progress * 100))")
                                .font(.system(size: 7, weight: .heavy, design: .rounded))
                                .foregroundStyle(Palette.brown.opacity(0.7))
                        }
                    }
                }
                .padding(3)
            }
        }
        .frame(height: 44)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(slot.date.map { accessibilityLabel(for: $0) } ?? "")
    }

    private var dayNumber: Int {
        guard let date = slot.date else { return 0 }
        return Calendar.current.component(.day, from: date)
    }

    private func accessibilityLabel(for date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "d MMMM"
        let d = slot.day
        let total = d?.total ?? 0
        return "\(f.string(from: date)): \(total) millilitres, \(Int(progress * 100)) percent of goal"
    }
}
