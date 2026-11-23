import SwiftUI

/// Visual state of the otter mascot — used to switch expressions.
enum OtterMood {
    case sleepy
    case thirsty
    case content
    case happy
    case celebrating

    static func forProgress(_ progress: Double) -> OtterMood {
        switch progress {
        case ..<0.01: return .sleepy
        case ..<0.25: return .thirsty
        case ..<0.75: return .content
        case ..<1.0:  return .happy
        default:      return .celebrating
        }
    }

    /// Resource file name (in the bundle) for this mood's illustration.
    var assetName: String {
        switch self {
        case .sleepy:      return "otter-sleepy"
        case .thirsty:     return "otter-thirsty"
        case .content:     return "otter-content"
        case .happy:       return "otter-happy"
        case .celebrating: return "otter-celebrating"
        }
    }
}

/// The Sippy otter mascot.
///
/// Renders a hand-illustrated otter for each mood (loaded from the bundled
/// `otter-*.png` artwork) with gentle idle breathing, and a little cheering
/// wobble plus sparkles when celebrating. The public API — `mood`, `size`,
/// `animated` — is unchanged so every existing call site keeps working.
struct OtterMascot: View {
    var mood: OtterMood = .content
    var size: CGFloat = 120
    var animated: Bool = true

    @State private var breathe: Bool = false
    @State private var wave: Bool = false

    var body: some View {
        otterImage
            .resizable()
            .interpolation(.high)
            .aspectRatio(contentMode: .fit)
            .frame(width: size, height: size)
            .overlay(alignment: .top) {
                if mood == .celebrating {
                    sparkles
                }
            }
            .scaleEffect(x: 1.0, y: breathe ? 1.02 : 1.0, anchor: .bottom)
            .rotationEffect(.degrees(wave ? 3 : -3), anchor: .bottom)
            .onAppear {
                guard animated else { return }
                withAnimation(.easeInOut(duration: 2.6).repeatForever(autoreverses: true)) {
                    breathe = true
                }
                if mood == .celebrating {
                    withAnimation(.easeInOut(duration: 0.7).repeatForever(autoreverses: true)) {
                        wave = true
                    }
                }
            }
            .accessibilityLabel(Text(accessibilityDescription))
    }

    /// Loads the mood illustration from the package bundle. Falls back to a
    /// SF Symbol if the resource is somehow missing so the app never crashes.
    private var otterImage: Image {
        if let url = Bundle.module.url(forResource: mood.assetName, withExtension: "png"),
           let nsImage = NSImage(contentsOf: url) {
            return Image(nsImage: nsImage)
        }
        return Image(systemName: "hare.fill")
    }

    private var accessibilityDescription: String {
        switch mood {
        case .sleepy:      return "A sleepy otter, floating and waiting for the first sip."
        case .thirsty:     return "A thirsty otter with open arms, asking for water."
        case .content:     return "A content otter holding a fish."
        case .happy:       return "A happy otter waving cheerfully."
        case .celebrating: return "A celebrating otter — daily goal reached!"
        }
    }

    private var sparkles: some View {
        ZStack {
            ForEach(0..<5, id: \.self) { i in
                Circle()
                    .fill(Palette.waterLight)
                    .frame(width: size * 0.05, height: size * 0.05)
                    .offset(
                        x: CGFloat([-0.35, -0.15, 0.15, 0.35, 0.0][i]) * size,
                        y: CGFloat([-0.05, -0.28, -0.28, -0.05, -0.38][i]) * size
                    )
                    .opacity(0.85)
            }
        }
    }
}
