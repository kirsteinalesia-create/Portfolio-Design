import Foundation

/// All hydration entries for one calendar day plus a small amount of aggregated metadata.
struct HydrationDay: Codable, Identifiable, Equatable {
    /// Day-key formatted as `yyyy-MM-dd` (user's current time zone).
    let id: String
    /// Local start-of-day date.
    let date: Date
    var entries: [HydrationEntry]

    init(date: Date, entries: [HydrationEntry] = []) {
        self.id = HydrationDay.key(for: date)
        self.date = Calendar.current.startOfDay(for: date)
        self.entries = entries
    }

    /// Total ml drunk on this day.
    var total: Int {
        entries.reduce(0) { $0 + $1.amount }
    }

    /// ml drunk in a specific hour.
    func amount(inHour hour: Int) -> Int {
        entries.filter { $0.hour == hour }.reduce(0) { $0 + $1.amount }
    }

    /// Progress relative to a daily target, clamped 0…1.
    func progress(target: Int) -> Double {
        guard target > 0 else { return 0 }
        return min(1.0, Double(total) / Double(target))
    }

    /// Unclamped raw progress (may exceed 1.0 when target is beaten).
    func rawProgress(target: Int) -> Double {
        guard target > 0 else { return 0 }
        return Double(total) / Double(target)
    }

    static func key(for date: Date) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone.current
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }
}
