import SwiftUI

/// Editorial typography scale.
enum Typo {
    static func display(_ size: CGFloat = 34) -> Font {
        .system(size: size, weight: .semibold, design: .rounded)
    }
    static func title(_ size: CGFloat = 15) -> Font {
        .system(size: size, weight: .semibold, design: .default)
    }
    static func quote(_ size: CGFloat = 13) -> Font {
        .system(size: size, weight: .medium, design: .serif).italic()
    }
    static func body(_ size: CGFloat = 12) -> Font {
        .system(size: size, weight: .regular, design: .default)
    }
    static func caption(_ size: CGFloat = 10) -> Font {
        .system(size: size, weight: .semibold, design: .default)
    }
    static func mono(_ size: CGFloat = 11) -> Font {
        .system(size: size, weight: .medium, design: .monospaced)
    }
}
