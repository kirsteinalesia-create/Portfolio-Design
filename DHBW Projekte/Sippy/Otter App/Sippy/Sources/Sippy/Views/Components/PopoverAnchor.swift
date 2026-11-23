import SwiftUI
import AppKit

/// SwiftUI wrapper that shows the given content in a real, native `NSPopover`
/// anchored to the underlying view.
///
/// Usage:
///     WidgetView(isPopoverShown: $shown)
///         .attachedPopover(isShown: $shown, edge: .maxX) {
///             PopoverRootView()
///         }
extension View {
    func attachedPopover<PopoverContent: View>(
        isShown: Binding<Bool>,
        edge: NSRectEdge = .maxX,
        @ViewBuilder content: @escaping () -> PopoverContent
    ) -> some View {
        background(
            PopoverAnchor(
                isShown: isShown,
                preferredEdge: edge,
                content: content
            )
        )
    }
}

/// Invisible view that owns and drives the NSPopover.
private struct PopoverAnchor<Content: View>: NSViewRepresentable {
    @Binding var isShown: Bool
    let preferredEdge: NSRectEdge
    let content: () -> Content

    func makeCoordinator() -> Coordinator {
        Coordinator(binding: $isShown, content: content)
    }

    func makeNSView(context: Context) -> NSView {
        let view = NSView(frame: .zero)
        context.coordinator.anchorView = view
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {
        context.coordinator.binding = $isShown
        context.coordinator.preferredEdge = preferredEdge
        context.coordinator.updateContent(content)
        context.coordinator.applyState(isShown: isShown)
    }

    // MARK: – Coordinator

    final class Coordinator: NSObject, NSPopoverDelegate {
        var binding: Binding<Bool>
        var preferredEdge: NSRectEdge = .maxX
        weak var anchorView: NSView?
        private let popover: NSPopover
        private let hosting: NSHostingController<AnyView>

        init(binding: Binding<Bool>, content: @escaping () -> Content) {
            self.binding = binding
            let controller = NSHostingController(rootView: AnyView(content()))
            self.hosting = controller
            self.popover = NSPopover()
            super.init()
            popover.contentViewController = controller
            popover.behavior = .transient
            popover.animates = true
            popover.delegate = self
        }

        func updateContent(_ content: @escaping () -> Content) {
            hosting.rootView = AnyView(content())
        }

        func applyState(isShown: Bool) {
            guard let anchor = anchorView, anchor.window != nil else { return }
            if isShown, !popover.isShown {
                popover.show(relativeTo: anchor.bounds, of: anchor, preferredEdge: preferredEdge)
            } else if !isShown, popover.isShown {
                popover.performClose(nil)
            }
        }

        // MARK: NSPopoverDelegate

        func popoverDidClose(_ notification: Notification) {
            // Reflect the close back into the SwiftUI binding.
            if binding.wrappedValue {
                DispatchQueue.main.async { [binding] in
                    binding.wrappedValue = false
                }
            }
        }
    }
}
