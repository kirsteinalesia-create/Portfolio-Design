import SwiftUI

enum PopoverTab: String, CaseIterable, Identifiable {
    case today, month, settings
    var id: String { rawValue }
    var title: String {
        switch self {
        case .today:    return "Today"
        case .month:    return "Month"
        case .settings: return "Settings"
        }
    }
    var symbol: String {
        switch self {
        case .today:    return "drop.fill"
        case .month:    return "calendar"
        case .settings: return "slider.horizontal.3"
        }
    }
}

/// Small underlined tab bar in the header.  Feels lighter than a segmented control
/// and matches the editorial aesthetic.
struct SegmentedNav: View {
    @Binding var selection: PopoverTab
    var namespace: Namespace.ID

    var body: some View {
        HStack(spacing: 4) {
            ForEach(PopoverTab.allCases) { tab in
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                        selection = tab
                    }
                } label: {
                    ZStack {
                        if selection == tab {
                            RoundedRectangle(cornerRadius: 7, style: .continuous)
                                .fill(Palette.brown)
                                .matchedGeometryEffect(id: "nav.selection", in: namespace)
                        }
                        HStack(spacing: 4) {
                            Image(systemName: tab.symbol)
                                .font(.system(size: 9, weight: .semibold))
                            Text(tab.title)
                                .font(.system(size: 11, weight: .semibold, design: .default))
                                .fixedSize()
                        }
                        .foregroundStyle(selection == tab ? Palette.beige : Palette.brown.opacity(0.6))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 5)
                    }
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(tab.title)
                .accessibilityAddTraits(selection == tab ? [.isSelected] : [])
            }
        }
        .padding(3)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(Palette.beigeDeep.opacity(0.45))
        )
    }
}
