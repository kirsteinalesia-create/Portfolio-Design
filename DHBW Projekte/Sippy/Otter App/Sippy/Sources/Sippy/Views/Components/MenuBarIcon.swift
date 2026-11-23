import SwiftUI
import AppKit

/// The icon shown in the macOS menu bar — the illustrated otter head with an
/// optional hydration progress ring and a little water drop.
struct MenuBarIcon: View {
    var progress: Double? = nil
    var size: CGFloat = 18

    var body: some View {
        ZStack {
            if let progress {
                Circle()
                    .stroke(Palette.brown.opacity(0.20), lineWidth: 1.4)
                    .frame(width: size, height: size)
                Circle()
                    .trim(from: 0, to: max(0.001, min(1.0, progress)))
                    .stroke(Palette.water, style: StrokeStyle(lineWidth: 1.6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .frame(width: size, height: size)
                    .animation(.easeOut(duration: 0.4), value: progress)
            }

            otterHead
                .resizable()
                .interpolation(.high)
                .aspectRatio(contentMode: .fit)
                .frame(width: size * 0.84, height: size * 0.84)

            WaterDropGlyph()
                .frame(width: size * 0.28, height: size * 0.34)
                .offset(x: size * 0.30, y: -size * 0.30)
        }
        .frame(width: size, height: size)
        .accessibilityLabel("Sippy")
    }

    /// The illustrated otter head (bundled artwork), with a vector fallback.
    private var otterHead: Image {
        if let url = Bundle.module.url(forResource: "otter-head", withExtension: "png"),
           let nsImage = NSImage(contentsOf: url) {
            return Image(nsImage: nsImage)
        }
        return Image(systemName: "hare.fill")
    }
}

struct OtterHeadGlyph: View {
    var body: some View {
        Canvas { ctx, size in
            let s = min(size.width, size.height)
            let cx = size.width / 2
            let cy = size.height / 2 + s * 0.02

            let head = Path(ellipseIn: CGRect(
                x: cx - s * 0.45, y: cy - s * 0.42,
                width: s * 0.90, height: s * 0.86
            ))
            ctx.fill(head, with: .color(Palette.furMid))
            ctx.stroke(head, with: .color(Palette.furOutline), lineWidth: max(0.6, s * 0.05))

            let mask = Path(ellipseIn: CGRect(
                x: cx - s * 0.30, y: cy - s * 0.15,
                width: s * 0.60, height: s * 0.42
            ))
            ctx.fill(mask, with: .color(Palette.furBelly))

            for xs: CGFloat in [-1, 1] {
                let er = s * 0.14
                let ex = cx + xs * s * 0.28
                let ey = cy - s * 0.38
                let ear = Path(ellipseIn: CGRect(x: ex - er/2, y: ey - er/2, width: er, height: er))
                ctx.fill(ear, with: .color(Palette.furDark))
                ctx.stroke(ear, with: .color(Palette.furOutline), lineWidth: max(0.5, s * 0.035))
            }

            let eyeR = s * 0.055
            for xs: CGFloat in [-1, 1] {
                let ex = cx + xs * s * 0.16
                let ey = cy - s * 0.02
                let eye = Path(ellipseIn: CGRect(
                    x: ex - eyeR, y: ey - eyeR,
                    width: eyeR * 2, height: eyeR * 2
                ))
                ctx.fill(eye, with: .color(Palette.furOutline))
            }

            let nw = s * 0.09
            let nh = s * 0.07
            let nose = Path { p in
                let nx = cx
                let ny = cy + s * 0.14
                p.move(to: CGPoint(x: nx - nw/2, y: ny))
                p.addQuadCurve(
                    to:      CGPoint(x: nx + nw/2, y: ny),
                    control: CGPoint(x: nx,        y: ny - nh * 0.4)
                )
                p.addQuadCurve(
                    to:      CGPoint(x: nx,        y: ny + nh),
                    control: CGPoint(x: nx + nw/2, y: ny + nh * 0.6)
                )
                p.addQuadCurve(
                    to:      CGPoint(x: nx - nw/2, y: ny),
                    control: CGPoint(x: nx - nw/2, y: ny + nh * 0.6)
                )
                p.closeSubpath()
            }
            ctx.fill(nose, with: .color(Palette.furOutline))
        }
    }
}

struct WaterDropGlyph: View {
    var body: some View {
        Canvas { ctx, size in
            let w = size.width
            let h = size.height
            let path = Path { p in
                p.move(to: CGPoint(x: w/2, y: 0))
                p.addQuadCurve(
                    to:      CGPoint(x: w,   y: h * 0.75),
                    control: CGPoint(x: w,   y: h * 0.35)
                )
                p.addQuadCurve(
                    to:      CGPoint(x: 0,   y: h * 0.75),
                    control: CGPoint(x: w/2, y: h)
                )
                p.addQuadCurve(
                    to:      CGPoint(x: w/2, y: 0),
                    control: CGPoint(x: 0,   y: h * 0.35)
                )
                p.closeSubpath()
            }
            ctx.fill(path, with: .color(Palette.water))
            ctx.stroke(path, with: .color(Palette.waterDeep), lineWidth: max(0.5, min(w, h) * 0.06))
        }
    }
}
