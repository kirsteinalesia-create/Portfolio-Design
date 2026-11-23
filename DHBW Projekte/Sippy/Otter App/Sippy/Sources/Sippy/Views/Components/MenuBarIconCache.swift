import SwiftUI
import AppKit

/// Cache for the rendered menu-bar icon.
///
/// `MenuBarExtra` label rendering with a live SwiftUI `Canvas` can be flaky
/// on some macOS versions — the icon area may end up empty.  We work around
/// this by rendering the icon once to an `NSImage` and passing it through
/// `Image(nsImage:)` which macOS handles consistently.
@MainActor
enum MenuBarIconCache {

    /// A dictionary keyed by the rounded progress value (integer 0…100), so
    /// we only rebuild the image when the ring visibly changes.
    private static var cache: [Int: NSImage] = [:]
    private static let side: CGFloat = 18

    static func image(progress: Double?) -> NSImage {
        let key = keyFor(progress: progress)
        if let cached = cache[key] {
            return cached
        }
        let image = render(progress: progress)
        cache[key] = image
        return image
    }

    private static func keyFor(progress: Double?) -> Int {
        guard let progress else { return -1 }
        return Int((max(0, min(1.0, progress)) * 100).rounded())
    }

    private static func render(progress: Double?) -> NSImage {
        let view = MenuBarIcon(progress: progress, size: side)
            .frame(width: side, height: side)
        let renderer = ImageRenderer(content: view)
        // Retina rendering for crisp menu-bar display.
        renderer.scale = NSScreen.main?.backingScaleFactor ?? 2.0
        guard let cg = renderer.cgImage else {
            return NSImage(size: NSSize(width: side, height: side))
        }
        let image = NSImage(cgImage: cg, size: NSSize(width: side, height: side))
        // Important: NOT a template — we want the colours to stay.
        image.isTemplate = false
        return image
    }
}
