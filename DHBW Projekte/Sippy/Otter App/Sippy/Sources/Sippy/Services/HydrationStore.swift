import Foundation
import SwiftUI
import Combine

/// The single source of truth for hydration data and settings.
///
/// - Publishes changes so all views stay in sync.
/// - Persists to `UserDefaults` (JSON encoded).  Small footprint, survives
///   restarts, stays entirely on-device.
@MainActor
final class HydrationStore: ObservableObject {

    // MARK: Public state
    @Published private(set) var days: [String: HydrationDay] = [:]
    @Published var settings: AppSettings {
        didSet { persistSettings() }
    }

    // MARK: Persistence keys
    private enum Key {
        static let days     = "sippy.days.v1"
        static let settings = "sippy.settings.v1"
    }

    private let defaults: UserDefaults

    // MARK: Init
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        // Load settings first — we may need them during load.
        if let data = defaults.data(forKey: Key.settings),
           let decoded = try? JSONDecoder().decode(AppSettings.self, from: data) {
            self.settings = decoded
        } else {
            self.settings = .default
        }
        loadDays()
    }

    // MARK: – Loading / saving
    private func loadDays() {
        guard let data = defaults.data(forKey: Key.days) else { return }
        if let decoded = try? JSONDecoder().decode([HydrationDay].self, from: data) {
            self.days = Dictionary(uniqueKeysWithValues: decoded.map { ($0.id, $0) })
        }
    }

    private func persistDays() {
        let all = Array(days.values)
        if let data = try? JSONEncoder().encode(all) {
            defaults.set(data, forKey: Key.days)
        }
    }

    private func persistSettings() {
        if let data = try? JSONEncoder().encode(settings) {
            defaults.set(data, forKey: Key.settings)
        }
    }

    // MARK: – Convenience accessors
    var today: HydrationDay {
        let key = HydrationDay.key(for: Date())
        return days[key] ?? HydrationDay(date: Date())
    }

    func day(for date: Date) -> HydrationDay {
        let key = HydrationDay.key(for: date)
        return days[key] ?? HydrationDay(date: date)
    }

    // MARK: – Mutations

    /// Records a hydration amount right now.
    func addWater(_ amount: Int, at date: Date = Date()) {
        guard amount != 0 else { return }
        let key = HydrationDay.key(for: date)
        var day = days[key] ?? HydrationDay(date: date)
        day.entries.append(HydrationEntry(timestamp: date, amount: amount))
        days[key] = day
        persistDays()
    }

    /// Undoes the most recent entry of today, if any.
    @discardableResult
    func undoLastEntry() -> HydrationEntry? {
        let key = HydrationDay.key(for: Date())
        guard var day = days[key], let last = day.entries.last else { return nil }
        day.entries.removeLast()
        days[key] = day
        persistDays()
        return last
    }

    /// Removes all entries for the given day (used from the month view).
    func clearDay(_ date: Date) {
        let key = HydrationDay.key(for: date)
        guard var day = days[key] else { return }
        day.entries.removeAll()
        days[key] = day
        persistDays()
    }

    /// Full reset — used only from Settings.
    func resetAllData() {
        days.removeAll()
        persistDays()
    }

    // MARK: – Statistics

    /// Days in a given month for which we have any entries.
    func days(inMonth month: Date) -> [HydrationDay] {
        let cal = Calendar.current
        let comps = cal.dateComponents([.year, .month], from: month)
        return days.values
            .filter {
                let c = cal.dateComponents([.year, .month], from: $0.date)
                return c.year == comps.year && c.month == comps.month
            }
            .sorted { $0.date < $1.date }
    }

    /// Aggregates for the given month.
    func monthlySummary(for month: Date) -> MonthSummary {
        let all = days(inMonth: month)
        let target = settings.dailyTargetML
        let daysWithData = all.filter { $0.total > 0 }
        let average = daysWithData.isEmpty ? 0
            : daysWithData.reduce(0) { $0 + $1.total } / daysWithData.count
        let reached = all.filter { $0.total >= target }.count
        let total = all.reduce(0) { $0 + $1.total }
        return MonthSummary(
            month: month,
            average: average,
            daysWithData: daysWithData.count,
            daysReached: reached,
            totalML: total
        )
    }
}

/// Aggregated monthly statistics.
struct MonthSummary {
    let month: Date
    let average: Int
    let daysWithData: Int
    let daysReached: Int
    let totalML: Int
}
