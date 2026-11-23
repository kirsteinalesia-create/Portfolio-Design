import SwiftUI

/// A realistic, animated water glass — a proper drinking tumbler.
///
/// Rendering:
/// - Thin outlined glass shape with a soft rim ellipse at the top.
/// - Water inside animates smoothly with a gentle surface wave, a slightly
///   darker meniscus line and (optionally) rising bubbles.
/// - Two subtle highlight streaks on the left and right edges give the glass
///   a wet, transparent feel.
struct WaterGlass: View {
    var progress: Double
    var animateRipple: Bool = false
    var bubbles: Bool = false

    @State private var wavePhase: CGFloat = 0
    @State private var rippleAmplitude: CGFloat = 0

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let glass = GlassShape()
            let interior = GlassShape().inset(by: 2)

            ZStack {
                // ------------------------------------------------------
                // Very light "glass" tint behind everything.
                // ------------------------------------------------------
                glass
                    .fill(
                        LinearGradient(
                            colors: [
                                Palette.waterFoam.opacity(0.10),
                                Color.white.opacity(0.06),
                                Palette.waterLight.opacity(0.08)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .shadow(color: Palette.brown.opacity(0.10), radius: 6, x: 0, y: 3)

                // ------------------------------------------------------
                // Water
                // ------------------------------------------------------
                Water(
                    progress: min(max(progress, 0), 1),
                    phase: wavePhase,
                    rippleAmplitude: rippleAmplitude
                )
                .clipShape(interior)

                if bubbles {
                    BubbleField(progress: min(max(progress, 0), 1))
                        .clipShape(interior)
                        .allowsHitTesting(false)
                }

                // ------------------------------------------------------
                // Glass edges — thin outline
                // ------------------------------------------------------
                glass
                    .stroke(Palette.brown.opacity(0.55), lineWidth: 1.6)

                // Left highlight streak — glossy edge
                LeftGleam()
                    .stroke(Color.white.opacity(0.7), lineWidth: 1.8)
                    .frame(width: w * 0.20, height: h * 0.70)
                    .offset(x: -w * 0.32, y: h * 0.05)
                    .blur(radius: 0.4)
                    .blendMode(.plusLighter)
                    .clipShape(glass)

                // Right highlight streak — subtle
                RightGleam()
                    .stroke(Color.white.opacity(0.35), lineWidth: 1.2)
                    .frame(width: w * 0.10, height: h * 0.50)
                    .offset(x: w * 0.30, y: h * 0.10)
                    .blur(radius: 0.4)
                    .blendMode(.plusLighter)
                    .clipShape(glass)

                // ------------------------------------------------------
                // Rim ellipse at the top — the opening of the glass
                // ------------------------------------------------------
                Ellipse()
                    .stroke(Palette.brown.opacity(0.55), lineWidth: 1.6)
                    .frame(width: w * 0.86, height: h * 0.09)
                    .offset(y: -h * 0.455)
                Ellipse()
                    .fill(Palette.waterFoam.opacity(0.35))
                    .frame(width: w * 0.82, height: h * 0.07)
                    .offset(y: -h * 0.452)
                    .blendMode(.plusLighter)
            }
            .compositingGroup()
            .onAppear {
                withAnimation(.linear(duration: 3.5).repeatForever(autoreverses: false)) {
                    wavePhase = .pi * 2
                }
            }
            .onChange(of: animateRipple) { _, _ in
                triggerRipple()
            }
        }
    }

    private func triggerRipple() {
        withAnimation(.easeOut(duration: 0.18)) {
            rippleAmplitude = 6
        }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 220_000_000)
            withAnimation(.easeIn(duration: 0.35)) {
                rippleAmplitude = 0
            }
        }
    }
}

// MARK: – Glass shape

/// A realistic drinking tumbler: slight taper, rounded bottom corners, soft rim.
struct GlassShape: Shape {
    var inset: CGFloat = 0

    func inset(by amount: CGFloat) -> GlassShape {
        GlassShape(inset: inset + amount)
    }

    func path(in rect: CGRect) -> Path {
        let r = rect.insetBy(dx: inset, dy: inset)

        // A subtle inward taper toward the bottom.
        let topInset:    CGFloat = r.width * 0.07
        let bottomInset: CGFloat = r.width * 0.11
        let bottomRadius: CGFloat = r.width * 0.14
        let topOffset: CGFloat = r.width * 0.02  // gentle rim curvature

        let topLeft     = CGPoint(x: r.minX + topInset,          y: r.minY + topOffset)
        let topRight    = CGPoint(x: r.maxX - topInset,          y: r.minY + topOffset)
        let bottomRight = CGPoint(x: r.maxX - bottomInset,       y: r.maxY - bottomRadius)
        let bottomLeft  = CGPoint(x: r.minX + bottomInset,       y: r.maxY - bottomRadius)

        var p = Path()
        p.move(to: topLeft)

        // Rim (top edge — slight upward curve)
        p.addQuadCurve(
            to: topRight,
            control: CGPoint(x: r.midX, y: r.minY - topOffset * 0.6)
        )

        // Right wall (straight, with the slight taper)
        p.addLine(to: bottomRight)

        // Bottom-right rounded corner
        p.addQuadCurve(
            to: CGPoint(x: r.maxX - bottomInset - bottomRadius * 0.6, y: r.maxY),
            control: CGPoint(x: r.maxX - bottomInset, y: r.maxY)
        )

        // Bottom edge (slightly curved for a "sitting on the table" feel)
        p.addQuadCurve(
            to: CGPoint(x: r.minX + bottomInset + bottomRadius * 0.6, y: r.maxY),
            control: CGPoint(x: r.midX, y: r.maxY + bottomRadius * 0.15)
        )

        // Bottom-left rounded corner
        p.addQuadCurve(
            to: bottomLeft,
            control: CGPoint(x: r.minX + bottomInset, y: r.maxY)
        )

        // Left wall
        p.addLine(to: topLeft)
        p.closeSubpath()
        return p
    }
}

// MARK: – Water

private struct Water: View {
    var progress: Double
    var phase: CGFloat
    var rippleAmplitude: CGFloat

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let fillHeight = h * CGFloat(progress)

            ZStack(alignment: .bottom) {
                // Main body of the water — vertical gradient
                Rectangle()
                    .fill(waterGradient)
                    .frame(width: w, height: fillHeight)

                // Wave surface (front)
                WaveSurface(
                    phase: phase,
                    amplitude: 2.4 + rippleAmplitude,
                    frequency: 1.3
                )
                .fill(waterGradient)
                .frame(width: w, height: 14)
                .offset(y: -fillHeight + 7)

                // Meniscus — slightly darker line at the top edge
                WaveSurface(
                    phase: phase,
                    amplitude: 2.4 + rippleAmplitude,
                    frequency: 1.3
                )
                .stroke(Palette.waterDeep.opacity(0.55), lineWidth: 1.1)
                .frame(width: w, height: 14)
                .offset(y: -fillHeight + 7)

                // Foam highlight (second wave, offset for depth)
                WaveSurface(
                    phase: phase + .pi / 2.5,
                    amplitude: 1.8,
                    frequency: 1.7
                )
                .stroke(Palette.waterFoam.opacity(0.9), lineWidth: 1.2)
                .frame(width: w, height: 10)
                .offset(y: -fillHeight + 3)
                .opacity(0.9)
            }
            .frame(width: w, height: h, alignment: .bottom)
            .animation(.spring(response: 0.7, dampingFraction: 0.75), value: progress)
        }
    }

    private var waterGradient: LinearGradient {
        LinearGradient(
            colors: [
                Palette.waterLight.opacity(0.85),
                Palette.water,
                Palette.waterDeep.opacity(0.95)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

private struct WaveSurface: Shape {
    var phase: CGFloat
    var amplitude: CGFloat
    var frequency: CGFloat

    var animatableData: AnimatablePair<CGFloat, CGFloat> {
        get { AnimatablePair(phase, amplitude) }
        set { phase = newValue.first; amplitude = newValue.second }
    }

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let midY = rect.midY
        path.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: midY))
        let step: CGFloat = 2
        var x = rect.minX
        while x <= rect.maxX {
            let relative = x / rect.width
            let y = midY + sin((relative * .pi * 2 * frequency) + phase) * amplitude
            path.addLine(to: CGPoint(x: x, y: y))
            x += step
        }
        path.addLine(to: CGPoint(x: rect.maxX, y: midY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

// MARK: – Glass highlights

/// The main glossy streak on the left edge — mimics the classic glass highlight.
private struct LeftGleam: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.midX + rect.width * 0.15, y: rect.minY + rect.height * 0.05))
        p.addQuadCurve(
            to:      CGPoint(x: rect.midX - rect.width * 0.05, y: rect.maxY - rect.height * 0.05),
            control: CGPoint(x: rect.midX - rect.width * 0.15, y: rect.midY)
        )
        return p
    }
}

/// A shorter, softer streak on the right edge.
private struct RightGleam: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.midX, y: rect.minY + rect.height * 0.1))
        p.addQuadCurve(
            to:      CGPoint(x: rect.midX + rect.width * 0.05, y: rect.maxY - rect.height * 0.2),
            control: CGPoint(x: rect.midX + rect.width * 0.15, y: rect.midY)
        )
        return p
    }
}

// MARK: – Bubbles

/// A field of small bubbles slowly rising through the water. Purely decorative.
///
/// The bubbles are driven by a single `TimelineView` clock so we don't have
/// dozens of individual animations running.
private struct BubbleField: View {
    var progress: Double

    /// Deterministic bubble layout so bubbles don't jitter across re-renders.
    private let seeds: [BubbleSeed] = (0..<7).map { i in
        BubbleSeed(
            xFraction: [0.20, 0.55, 0.32, 0.75, 0.15, 0.60, 0.42][i % 7],
            size:      [3.5,  2.6,  4.2,  2.2, 3.0,  3.6,  2.4 ][i % 7],
            speed:     [3.0,  4.4,  3.6,  5.0, 4.0,  3.2,  4.8 ][i % 7],
            offset:    Double(i) * 0.31
        )
    }

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let fillHeight = h * CGFloat(progress)

            TimelineView(.animation(minimumInterval: 1.0 / 60.0, paused: false)) { context in
                let t = context.date.timeIntervalSinceReferenceDate

                Canvas { ctx, _ in
                    for seed in seeds {
                        let cyclePos = ((t / seed.speed) + seed.offset)
                            .truncatingRemainder(dividingBy: 1.0)
                        let bubbleY = h - CGFloat(cyclePos) * fillHeight
                        let drift = sin((t * 1.6) + seed.offset * 6) * (seed.size * 0.6)
                        let bx = w * seed.xFraction + drift

                        let fadeIn  = min(1.0, cyclePos * 6)
                        let fadeOut = min(1.0, (1.0 - cyclePos) * 6)
                        let alpha   = 0.55 * fadeIn * fadeOut

                        let rect = CGRect(
                            x: bx - seed.size / 2,
                            y: bubbleY - seed.size / 2,
                            width: seed.size,
                            height: seed.size
                        )
                        ctx.fill(
                            Path(ellipseIn: rect),
                            with: .color(Palette.waterFoam.opacity(alpha))
                        )
                        let hi = rect.insetBy(dx: seed.size * 0.28, dy: seed.size * 0.28)
                            .offsetBy(dx: -seed.size * 0.10, dy: -seed.size * 0.10)
                        ctx.fill(
                            Path(ellipseIn: hi),
                            with: .color(Color.white.opacity(alpha * 0.9))
                        )
                    }
                }
            }
        }
    }

    private struct BubbleSeed {
        let xFraction: CGFloat
        let size: CGFloat
        let speed: Double
        let offset: Double
    }
}
