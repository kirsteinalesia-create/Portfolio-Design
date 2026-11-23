import Foundation

/// User-tunable configuration.
struct AppSettings: Codable, Equatable {
    /// Daily hydration target in ml.
    var dailyTargetML: Int
    /// Hourly hydration target in ml.
    var hourlyTargetML: Int
    /// Working-day start hour (0…23).
    var startHour: Int
    /// Working-day end hour (0…23) — exclusive; e.g. 17 means last reminder at 16:00.
    var endHour: Int
    /// Reminder interval in minutes.
    var reminderIntervalMinutes: Int
    /// Whether the app should schedule notifications.
    var notificationsEnabled: Bool
    /// Whether the app should launch at login.
    var launchAtLogin: Bool
    /// Quick-add amount presets (ml) shown in the Today view.
    var quickAddPresets: [Int]
    /// Set to true once the user completed onboarding.
    var didFinishOnboarding: Bool

    static let `default` = AppSettings(
        dailyTargetML: 1600,
        hourlyTargetML: 200,
        startHour: 9,
        endHour: 17,
        reminderIntervalMinutes: 60,
        notificationsEnabled: true,
        launchAtLogin: false,
        quickAddPresets: [50, 100, 200, 300, 500],
        didFinishOnboarding: false
    )

    /// Number of working hours in a day (bounded to 1…24).
    var workingHours: Int {
        max(1, min(24, endHour - startHour))
    }
}
