import SwiftUI

/// Fast, tappable amount presets.
///
/// Also includes a `−` button which undoes the last entry of today.
/// This gives the user a one-click way to correct mistakes.
struct QuickAddButtons: View {
    let presets: [Int]
    var onAdd: (Int) -> Void
    var onUndo: () -> Void

    @State private var pressedAmount: Int?

    var body: some View {
        HStack(spacing: 6) {
            iconButton(systemName: "arrow.uturn.backward", action: onUndo)
                .accessibilityLabel("Undo last entry")

            ForEach(presets, id: \.self) { amount in
                Button {
                    trigger(amount: amount)
                } label: {
                    Text("\(amount)")
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundStyle(Palette.brown)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 7)
                        .frame(minWidth: 42)
                        .background(pressedAmount == amount ? Palette.pinkSoft : Palette.beigeDeep.opacity(0.55))
                        .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 9, style: .continuous)
                                .stroke(Palette.brown.opacity(0.15), lineWidth: 0.8)
                        )
                        .scaleEffect(pressedAmount == amount ? 0.94 : 1.0)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Add \(amount) millilitres")
            }
        }
    }

    private func iconButton(systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(Palette.brown.opacity(0.75))
                .frame(width: 28, height: 28)
                .background(Palette.beigeDeep.opacity(0.35))
                .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 9, style: .continuous)
                        .stroke(Palette.brown.opacity(0.15), lineWidth: 0.8)
                )
        }
        .buttonStyle(.plain)
    }

    private func trigger(amount: Int) {
        withAnimation(.easeOut(duration: 0.10)) {
            pressedAmount = amount
        }
        onAdd(amount)
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 160_000_000)
            withAnimation(.easeIn(duration: 0.18)) {
                pressedAmount = nil
            }
        }
    }
}
