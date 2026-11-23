import Foundation
import ServiceManagement

/// Wraps `SMAppService.mainApp` — the modern (macOS 13+) way to enable
/// "Launch at login" without a helper bundle.
enum LaunchAtLoginManager {

    static var isEnabled: Bool {
        SMAppService.mainApp.status == .enabled
    }

    /// Enables or disables launch-at-login. Errors are swallowed and reported via return value.
    @discardableResult
    static func setEnabled(_ enabled: Bool) -> Bool {
        do {
            if enabled {
                if SMAppService.mainApp.status == .enabled { return true }
                try SMAppService.mainApp.register()
            } else {
                try SMAppService.mainApp.unregister()
            }
            return true
        } catch {
            #if DEBUG
            print("LaunchAtLogin toggle failed: \(error)")
            #endif
            return false
        }
    }
}
