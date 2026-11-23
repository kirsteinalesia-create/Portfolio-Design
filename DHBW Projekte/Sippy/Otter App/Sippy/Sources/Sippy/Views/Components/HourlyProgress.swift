import SwiftUI

/// A row of small droplet-shaped indicators representing the user's working hours.
struct HourlyProgress: View {
    let day: HydrationDay
    let startHour: Int
    let endHour: Int
    let hourlyTarget: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                ForEach(startHour..<endHour, id: \.self) { hour in
                    HourDroplet(
                        hour: hour,
                        amount: day.amount(inHour: hour),
                        target: hourlyTarget
                    )
                }
            }
        }
    }
}

private struct HourDroplet: View {
    let hour: Int
    let amount: Int
    let target: Int

    @State private var hovered = false

    private var fill: Double {
        guard target > 0 else { return 0 }
        return min(1.0, Double(amount) / Double(target))
    }

    private var isCurrentHour: Bool {
        Calendar.current.component(.hour, from: Date()) == hour
    }

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                DropShape()
                    .fill(Palette.beigeDeep.opacity(0.5))
                    .frame(width: 18, height: 22)
                    .overlay(
                        DropShape()
                            .stroke(
                                isCurrentHour
                                    ? Palette.brown.opacity(0.55)
                                    : Palette.brown.opacity(0.20),
                                lineWidth: isCurrentHour ? 1.2 : 0.8
                            )
                    )

                DropShape()
                    .fill(
                        LinearGradient(
                            colors: [Palette.waterLight, Palette.water],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(width: 18, height: 22)
                    .mask(
                        VStack(spacing: 0) {
                            Rectangle().fill(Color.clear)
                            Rectangle().fill(Color.black)
                                .frame(height: 22 * CGFloat(fill))
                        }
                        .frame(width: 18, height: 22)
                    )
                    .animation(.easeInOut(duration: 0.35), value: fill)

                if fill >= 1.0 {
                    Image(systemName: "checkmark")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundStyle(Color.white)
                        .shadow(color: Palette.waterDeep, radius: 0.5)
                }
            }
            Text(String(format: "%02d", hour))
                .font(.system(size: 8.5, weight: .medium, design: .rounded))
                .foregroundStyle(isCurrentHour ? Palette.brown : Palette.brownMuted)
        }
        .scaleEffect(hovered ? 1.08 : 1.0)
        .animation(.spring(response: 0.28, dampingFraction: 0.7), value: hovered)
        .onHover { hovered = $0 }
        .help("\(String(format: "%02d", hour)):00 — \(amount) ml")
        .accessibilityLabel("\(String(format: "%02d", hour)):00")
        .accessibilityValue("\(amount) millilitres")
    }
}

private struct DropShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width
        let h = rect.height
        var p = Path()
        p.move(to: CGPoint(x: w/2, y: 0))
        p.addQuadCurve(
            to:      CGPoint(x: w,   y: h * 0.66),
            control: CGPoint(x: w,   y: h * 0.30)
        )
        p.addArc(
            center: CGPoint(x: w/2, y: h * 0.72),
            radius: w/2,
            startAngle: .degrees(0),
            endAngle: .degrees(180),
            clockwise: false
        )
        p.addQuadCurve(
            to:      CGPoint(x: w/2, y: 0),
            control: CGPoint(x: 0,   y: h * 0.30)
        )
        p.closeSubpath()
        return p
    }
}
