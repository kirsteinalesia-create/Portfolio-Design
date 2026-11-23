import Foundation
import UserNotifications
import AppKit

/// Handles hourly reminders. The manager is deliberately conservative:
/// it schedules **one** upcoming notification at a time based on the current
/// state of the day so the message can adapt to actual progress.
@MainActor
final class NotificationManager: NSObject, ObservableObject {

    static let shared = NotificationManager()

    @Published private(set) var authorizationStatus: UNAuthorizationStatus = .notDetermined
    @Published private(set) var lastError: String?

    /// True when the process runs inside a proper `.app` bundle. When false
    /// (e.g. during preview rendering) all UN calls become no-ops so the
    /// framework never tries to talk to a non-existent bundle proxy.
    private let hasBundle: Bool = {
        (Bundle.main.bundleIdentifier?.isEmpty == false)
    }()

    private lazy var center: UNUserNotificationCenter? = {
        guard hasBundle else { return nil }
        return UNUserNotificationCenter.current()
    }()
    private let categoryIdentifier = "SIPPY_HOURLY_REMINDER"
    private let scheduledIdentifier = "sippy.reminder.next"

    // MARK: Message rotation
    private let progressMessages: [String] = [
        "Water break! Your otter is waiting 🦦",
        "Hydration time — 200 ml please 💧",
        "Little sip, big win. Time for water!",
        "Your otter says: hydration time!",
        "Quick sip? The glass is getting lonely 💧",
        "Splash break — grab some water 🦦",
        "Refill moment. You've got this."
    ]

    private let acknowledgingMessages: [String] = [
        "Nice start! Keep the sips coming 💧",
        "You're on track — one more cup 🦦",
        "Great pace! Another 200 ml?",
        "Lovely. Your otter is proud."
    ]

    private let completionMessages: [String] = [
        "You did it! Daily goal reached 🎉",
        "1600 ml done — otter is dancing 🦦✨",
        "Fully hydrated. Nice work today!"
    ]

    // MARK: – Setup

    override private init() {
        super.init()
        guard let center else { return }
        center.delegate = self
        registerCategory()
        refreshAuthorizationStatus()
    }

    private func registerCategory() {
        guard let center else { return }
        let sip = UNNotificationAction(
            identifier: "SIPPY_ADD_200",
            title: "Add 200 ml",
            options: []
        )
        let skip = UNNotificationAction(
            identifier: "SIPPY_SKIP",
            title: "Skip",
            options: [.destructive]
        )
        let category = UNNotificationCategory(
            identifier: categoryIdentifier,
            actions: [sip, skip],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )
        center.setNotificationCategories([category])
    }

    func refreshAuthorizationStatus() {
        guard let center else { return }
        center.getNotificationSettings { [weak self] settings in
            Task { @MainActor in
                self?.authorizationStatus = settings.authorizationStatus
            }
        }
    }

    /// Requests permission if not yet determined.  Returns true if authorised.
    @discardableResult
    func requestAuthorizationIfNeeded() async -> Bool {
        guard let center else { return false }
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
            await MainActor.run { self.refreshAuthorizationStatus() }
            return granted
        } catch {
            await MainActor.run { self.lastError = error.localizedDescription }
            return false
        }
    }

    // MARK: – Scheduling

    /// Cancels any pending reminder.
    func cancelAll() {
        center?.removePendingNotificationRequests(withIdentifiers: [scheduledIdentifier])
    }

    /// Recomputes and schedules the next hourly reminder given current settings and progress.
    /// Called after every mutation of state.
    func reschedule(settings: AppSettings, currentTotal: Int, currentHourTotal: Int) {
        guard let center else { return }
        cancelAll()
        guard settings.notificationsEnabled else { return }
        guard authorizationStatus == .authorized || authorizationStatus == .provisional else { return }
        guard let fireDate = nextFireDate(from: Date(), settings: settings) else { return }

        let content = makeContent(
            settings: settings,
            currentTotal: currentTotal,
            currentHourTotal: currentHourTotal
        )

        let comps = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: fireDate
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
        let request = UNNotificationRequest(
            identifier: scheduledIdentifier,
            content: content,
            trigger: trigger
        )
        center.add(request) { [weak self] error in
            if let error {
                Task { @MainActor in self?.lastError = error.localizedDescription }
            }
        }
    }

    /// Computes the next fire date honouring working-hour bounds and interval.
    private func nextFireDate(from now: Date, settings: AppSettings) -> Date? {
        let cal = Calendar.current
        let interval = TimeInterval(max(15, settings.reminderIntervalMinutes) * 60)
        var candidate = now.addingTimeInterval(interval)

        // Clamp candidate into working window; if past end today, jump to start of tomorrow.
        var comps = cal.dateComponents([.year, .month, .day, .hour, .minute], from: candidate)
        let hour = comps.hour ?? 0

        if hour >= settings.endHour {
            // Move to start of next day
            guard var next = cal.date(byAdding: .day, value: 1, to: candidate) else { return nil }
            var nextComps = cal.dateComponents([.year, .month, .day], from: next)
            nextComps.hour = settings.startHour
            nextComps.minute = 0
            next = cal.date(from: nextComps) ?? next
            candidate = next
        } else if hour < settings.startHour {
            comps.hour = settings.startHour
            comps.minute = 0
            candidate = cal.date(from: comps) ?? candidate
        }
        return candidate
    }

    private func makeContent(settings: AppSettings, currentTotal: Int, currentHourTotal: Int) -> UNNotificationContent {
        let content = UNMutableNotificationContent()
        content.categoryIdentifier = categoryIdentifier
        content.sound = .default

        if currentTotal >= settings.dailyTargetML {
            content.title = "Sippy"
            content.body = completionMessages.randomElement() ?? "Daily goal reached!"
        } else if currentHourTotal >= settings.hourlyTargetML {
            content.title = "Nicely done"
            content.body = "You've already had \(currentHourTotal) ml this hour. Keep it up 💧"
        } else if currentHourTotal > 0 {
            content.title = "Halfway there"
            content.body = acknowledgingMessages.randomElement() ?? "Keep going!"
        } else {
            content.title = "Sippy"
            content.body = progressMessages.randomElement() ?? "Time for water 💧"
        }
        return content
    }
}

// MARK: – Delegate

extension NotificationManager: UNUserNotificationCenterDelegate {

    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show as banner even when app is foreground (menu bar app).
        completionHandler([.banner, .sound])
    }

    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let action = response.actionIdentifier
        Task { @MainActor in
            switch action {
            case "SIPPY_ADD_200":
                NotificationCenter.default.post(
                    name: .sippyAddWaterFromNotification,
                    object: nil,
                    userInfo: ["amount": 200]
                )
            case UNNotificationDefaultActionIdentifier:
                NotificationCenter.default.post(name: .sippyOpenPopover, object: nil)
            default:
                break
            }
            completionHandler()
        }
    }
}

extension Notification.Name {
    static let sippyAddWaterFromNotification = Notification.Name("sippy.addWaterFromNotification")
    static let sippyOpenPopover              = Notification.Name("sippy.openPopover")
}
