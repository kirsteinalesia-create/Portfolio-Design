import SwiftUI

/// The desktop widget — a small always-on-screen tile in the spirit of the
/// hand-drawn design mock: a beige card with a hamburger menu, a friendly
/// question or celebration message, two pill buttons for adjusting the
/// hydration count and, on the right, a water glass with the otter mascot.
///
/// The widget's visual state is entirely driven by `progress`:
///
/// - Below goal → the otter peeks curiously next to the glass, buttons visible.
/// - Goal reached → the buttons fade out, a celebration message appears and
///   the otter jumps into a little puddle of water beside the glass and waves.
struct WidgetView: View {
    @EnvironmentObject private var store: HydrationStore
    @Binding var isPopoverShown: Bool

    @State private var isHovered = false
    @State private var pressedAmount: Int? = nil
    @State private var rippleTrigger = false
    @State private var sparkleTrigger = false
    @State private var lastCelebrated: Bool = false

    private var day: HydrationDay { store.today }
    private var progress: Double  { day.progress(target: store.settings.dailyTargetML) }
    private var raw: Double       { day.rawProgress(target: store.settings.dailyTargetML) }
    private var isGoalReached: Bool { raw >= 1.0 }
    private var mood: OtterMood   { OtterMood.forProgress(raw) }

    var body: some View {
        card
            .onHover { isHovered = $0 }
            .contextMenu { contextMenu }
            .onReceive(NotificationCenter.default.publisher(for: .sippyStateChanged)) { _ in
                rippleTrigger.toggle()
            }
            .onChange(of: isGoalReached) { _, newValue in
                if newValue && !lastCelebrated {
                    triggerSparkles()
                }
                lastCelebrated = newValue
            }
            .onAppear { lastCelebrated = isGoalReached }
    }

    // MARK: – Card

    private var card: some View {
        ZStack(alignment: .topLeading) {
            background

            HStack(alignment: .top, spacing: 12) {
                leftColumn
                Spacer(minLength: 0)
                rightScene
            }
            .padding(.leading, 16)
            .padding(.trailing, 14)
            .padding(.top, 44)
            .padding(.bottom, 14)

            hamburgerButton
                .padding(.leading, 12)
                .padding(.top, 12)
        }
        .frame(width: 300, height: 220)
        .overlay(hoverRing)
        .scaleEffect(isHovered ? 1.005 : 1.0)
        .animation(.easeInOut(duration: 0.2), value: isHovered)
    }

    private var background: some View {
        RoundedRectangle(cornerRadius: 28, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [Palette.beigeSoft, Palette.beige, Palette.beigeDeep.opacity(0.9)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(Palette.brown.opacity(0.08), lineWidth: 0.8)
            )
            .shadow(color: Palette.brown.opacity(0.22), radius: 16, x: 0, y: 10)
            .shadow(color: Palette.brown.opacity(0.06), radius: 2,  x: 0, y: 1)
    }

    private var hoverRing: some View {
        RoundedRectangle(cornerRadius: 28, style: .continuous)
            .stroke(Palette.pink.opacity(isHovered ? 0.45 : 0.0), lineWidth: 1.2)
    }

    // MARK: – Hamburger

    private var hamburgerButton: some View {
        Button {
            isPopoverShown.toggle()
        } label: {
            VStack(spacing: 3) {
                ForEach(0..<3) { _ in
                    Capsule()
                        .fill(Palette.brown.opacity(0.85))
                        .frame(width: 14, height: 1.8)
                }
            }
            .padding(6)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Open Sippy dashboard")
    }

    // MARK: – Left column: message + buttons

    private var leftColumn: some View {
        VStack(alignment: .leading, spacing: 12) {
            messageText
                .transition(.asymmetric(
                    insertion: .opacity.combined(with: .offset(y: 4)),
                    removal:   .opacity.combined(with: .offset(y: -4))
                ))
                .id(messageKey)  // ensures cross-fade when text changes

            if !isGoalReached {
                VStack(alignment: .leading, spacing: 7) {
                    pillButton(label: "+200 ml", amount:  200, style: .primary)
                    pillButton(label: "−200 ml", amount: -200, style: .secondary)
                }
                .transition(.asymmetric(
                    insertion: .opacity.combined(with: .scale(scale: 0.92, anchor: .topLeading)),
                    removal:   .opacity.combined(with: .scale(scale: 0.88, anchor: .topLeading))
                ))
            }
        }
        .frame(width: 138, alignment: .leading)
        .animation(.spring(response: 0.45, dampingFraction: 0.82), value: isGoalReached)
        .animation(.spring(response: 0.5,  dampingFraction: 0.8),  value: messageKey)
    }

    private var messageText: some View {
        Text(currentMessage)
            .font(.system(size: 16, weight: .semibold, design: .rounded))
            .foregroundStyle(Palette.brown)
            .lineLimit(3)
            .fixedSize(horizontal: false, vertical: true)
            .multilineTextAlignment(.leading)
    }

    private var messageKey: String {
        switch raw {
        case ..<0.01:  return "start"
        case ..<0.25:  return "thirsty"
        case ..<0.5:   return "keep"
        case ..<0.75:  return "halfway"
        case ..<1.0:   return "almost"
        default:       return "done"
        }
    }

    private var currentMessage: String {
        switch messageKey {
        case "start":    return "How much did\nyou drink?"
        case "thirsty":  return "Time for\na first sip!"
        case "keep":     return "Keep sipping,\nyou got this."
        case "halfway":  return "Halfway there —\nnice work!"
        case "almost":   return "Almost there,\none more sip!"
        default:         return "Yeyy, you did\na great job!"
        }
    }

    // MARK: – Pill button

    private enum PillStyle { case primary, secondary }

    private func pillButton(label: String, amount: Int, style: PillStyle) -> some View {
        Button {
            handleAmount(amount)
        } label: {
            Text(label)
                .font(.system(size: 13, weight: .semibold, design: .rounded))
                .foregroundStyle(style == .primary ? Palette.brown : Color.white.opacity(0.95))
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .frame(minWidth: 96, alignment: .center)
                .background(
                    Capsule(style: .continuous)
                        .fill(fillGradient(for: style))
                )
                .overlay(
                    Capsule(style: .continuous)
                        .stroke(strokeColor(for: style), lineWidth: 0.7)
                )
                .shadow(color: shadowColor(for: style), radius: 3, x: 0, y: 1.5)
                .scaleEffect(pressedAmount == amount ? 0.94 : 1.0)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(amount > 0
                            ? "Add \(amount) millilitres"
                            : "Remove \(-amount) millilitres")
        .animation(.spring(response: 0.28, dampingFraction: 0.7), value: pressedAmount)
    }

    private func fillGradient(for style: PillStyle) -> LinearGradient {
        switch style {
        case .primary:
            return LinearGradient(
                colors: [Palette.waterLight, Palette.water.opacity(0.75)],
                startPoint: .top, endPoint: .bottom
            )
        case .secondary:
            return LinearGradient(
                colors: [Palette.water, Palette.waterDeep],
                startPoint: .top, endPoint: .bottom
            )
        }
    }

    private func strokeColor(for style: PillStyle) -> Color {
        switch style {
        case .primary:   return Palette.water.opacity(0.55)
        case .secondary: return Palette.waterDeep.opacity(0.75)
        }
    }

    private func shadowColor(for style: PillStyle) -> Color {
        switch style {
        case .primary:   return Palette.water.opacity(0.35)
        case .secondary: return Palette.waterDeep.opacity(0.45)
        }
    }

    // MARK: – Right side: glass + otter scene

    private var rightScene: some View {
        ZStack(alignment: .bottomLeading) {
            // Puddle appears when the otter is swimming.
            if isGoalReached {
                Puddle()
                    .frame(width: 88, height: 22)
                    .offset(x: -28, y: 4)
                    .transition(.opacity.combined(with: .scale(scale: 0.7, anchor: .bottom)))
            }

            // Otter — moves position depending on state.
            OtterMascot(
                mood: isGoalReached ? .celebrating : mood,
                size: isGoalReached ? 66 : 54,
                animated: true
            )
            .offset(
                x: isGoalReached ? -34 : -6,
                y: isGoalReached ? -2  : 14
            )
            .zIndex(2)

            // The glass.
            WaterGlass(
                progress: min(1.05, raw),
                animateRipple: rippleTrigger,
                bubbles: raw > 0.15
            )
            .frame(width: 62, height: 118)
            .offset(x: 34, y: -6)
            .zIndex(1)

            // Sparkles at goal reached.
            if isGoalReached {
                SparkleBurst(trigger: sparkleTrigger)
                    .frame(width: 120, height: 120)
                    .offset(x: 6, y: -70)
                    .allowsHitTesting(false)
                    .zIndex(3)
            }
        }
        .frame(width: 110, height: 130, alignment: .bottomLeading)
        .animation(.spring(response: 0.55, dampingFraction: 0.75), value: isGoalReached)
    }

    // MARK: – Actions

    private func handleAmount(_ amount: Int) {
        withAnimation(.easeOut(duration: 0.08)) { pressedAmount = amount }

        if amount > 0 {
            store.addWater(amount)
        } else {
            _ = subtract(-amount)
        }

        rippleTrigger.toggle()
        NotificationCenter.default.post(name: .sippyStateChanged, object: nil)

        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 160_000_000)
            withAnimation(.easeIn(duration: 0.18)) { pressedAmount = nil }
        }
    }

    /// Removes `amount` ml from today's total. If the last entry is exactly
    /// this size, it's just undone. Otherwise we insert a negative entry so
    /// the running total is honest.
    private func subtract(_ amount: Int) -> Bool {
        let day = store.today
        if let last = day.entries.last, last.amount == amount {
            _ = store.undoLastEntry()
        } else {
            store.addWater(-amount)
        }
        return true
    }

    private func triggerSparkles() {
        sparkleTrigger.toggle()
    }

    // MARK: – Context menu

    @ViewBuilder
    private var contextMenu: some View {
        Button("Open dashboard") { isPopoverShown = true }
        Divider()
        Button("Add 200 ml") { handleAmount(200) }
        Button("Add 100 ml") { handleAmount(100) }
        Divider()
        Button("Undo last entry") {
            _ = store.undoLastEntry()
            NotificationCenter.default.post(name: .sippyStateChanged, object: nil)
        }
        Divider()
        Button("Quit Sippy") { NSApp.terminate(nil) }
    }
}

// MARK: – Puddle under the otter

/// A little water puddle that ripples underneath the swimming otter.
private struct Puddle: View {
    @State private var phase: CGFloat = 0
    @State private var ringScale: CGFloat = 0.6
    @State private var ringOpacity: Double = 0.0

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height

            ZStack {
                // Main puddle body.
                Ellipse()
                    .fill(
                        RadialGradient(
                            colors: [Palette.waterLight, Palette.water, Palette.waterDeep.opacity(0.85)],
                            center: .center,
                            startRadius: 2,
                            endRadius: w * 0.55
                        )
                    )
                    .overlay(
                        Ellipse()
                            .stroke(Palette.waterFoam.opacity(0.9), lineWidth: 1)
                            .blur(radius: 0.4)
                    )
                    .shadow(color: Palette.waterDeep.opacity(0.25), radius: 4, x: 0, y: 2)

                // Rippling ring.
                Ellipse()
                    .stroke(Palette.waterFoam.opacity(ringOpacity), lineWidth: 1.3)
                    .frame(width: w * ringScale, height: h * ringScale)

                // Tiny splash droplets.
                ForEach(0..<3, id: \.self) { i in
                    let angle = Double(i) * 2.4 + Double(phase)
                    Circle()
                        .fill(Palette.waterFoam.opacity(0.9))
                        .frame(width: 3, height: 3)
                        .offset(
                            x: cos(angle) * w * 0.35,
                            y: sin(angle * 1.4) * h * 0.15 - h * 0.4
                        )
                        .opacity(0.6)
                }
            }
            .onAppear {
                withAnimation(.linear(duration: 4).repeatForever(autoreverses: false)) {
                    phase = .pi * 2
                }
                animateRing()
            }
        }
    }

    private func animateRing() {
        Task { @MainActor in
            while !Task.isCancelled {
                ringScale = 0.4
                ringOpacity = 0.85
                withAnimation(.easeOut(duration: 1.4)) {
                    ringScale = 1.15
                    ringOpacity = 0.0
                }
                try? await Task.sleep(nanoseconds: 1_500_000_000)
            }
        }
    }
}

// MARK: – Sparkle burst

/// A one-shot sparkle animation retriggered when `trigger` toggles.
private struct SparkleBurst: View {
    var trigger: Bool

    @State private var animate = false

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height

            ZStack {
                ForEach(0..<7, id: \.self) { i in
                    let angle = Double(i) / 7 * .pi * 2
                    let dist = animate ? w * 0.42 : 0
                    Sparkle()
                        .fill(i.isMultiple(of: 2) ? Palette.waterLight : Palette.pinkSoft)
                        .frame(width: 10, height: 10)
                        .offset(
                            x: cos(angle) * dist,
                            y: sin(angle) * dist
                        )
                        .scaleEffect(animate ? 0.0 : 1.0)
                        .opacity(animate ? 0.0 : 1.0)
                }
            }
            .frame(width: w, height: h)
        }
        .onAppear { fire() }
        .onChange(of: trigger) { _, _ in fire() }
    }

    private func fire() {
        animate = false
        withAnimation(.easeOut(duration: 0.9)) {
            animate = true
        }
    }
}

/// Four-pointed sparkle shape.
private struct Sparkle: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let cx = rect.midX
        let cy = rect.midY
        let rx = rect.width / 2
        let ry = rect.height / 2
        let ix = rx * 0.25
        let iy = ry * 0.25

        p.move(to: CGPoint(x: cx,      y: cy - ry))
        p.addLine(to: CGPoint(x: cx + ix, y: cy - iy))
        p.addLine(to: CGPoint(x: cx + rx, y: cy))
        p.addLine(to: CGPoint(x: cx + ix, y: cy + iy))
        p.addLine(to: CGPoint(x: cx,      y: cy + ry))
        p.addLine(to: CGPoint(x: cx - ix, y: cy + iy))
        p.addLine(to: CGPoint(x: cx - rx, y: cy))
        p.addLine(to: CGPoint(x: cx - ix, y: cy - iy))
        p.closeSubpath()
        return p
    }
}
