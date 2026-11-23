import SwiftUI
import AppKit

/// Renders the Sippy AppIcon at all standard macOS sizes.
///
/// Invoked from the build script:  Sippy --generate-icons <path>
/// The path receives an `Icon.iconset` directory that can be fed to `iconutil`.
@MainActor
enum IconGenerator {

    static func run(outputDirectory: URL) throws {
        try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
        let iconset = outputDirectory.appendingPathComponent("Icon.iconset")
        try? FileManager.default.removeItem(at: iconset)
        try FileManager.default.createDirectory(at: iconset, withIntermediateDirectories: true)

        let entries: [(base: Int, scale: Int)] = [
            (16, 1), (16, 2),
            (32, 1), (32, 2),
            (128, 1), (128, 2),
            (256, 1), (256, 2),
            (512, 1), (512, 2)
        ]

        for e in entries {
            let pixel = e.base * e.scale
            let filename: String
            if e.scale == 1 {
                filename = "icon_\(e.base)x\(e.base).png"
            } else {
                filename = "icon_\(e.base)x\(e.base)@\(e.scale)x.png"
            }
            let url = iconset.appendingPathComponent(filename)
            let image = renderAppIcon(pixelSize: pixel)
            try writePNG(image: image, to: url)
            print("  wrote \(filename)")
        }
        print("Iconset ready at \(iconset.path)")
    }

    // MARK: – Render

    @MainActor
    static func renderAppIcon(pixelSize: Int) -> NSImage {
        let size = CGFloat(pixelSize)
        let view = AppIconContent()
            .frame(width: size, height: size)
        let renderer = ImageRenderer(content: view)
        renderer.scale = 1.0
        if let cg = renderer.cgImage {
            return NSImage(cgImage: cg, size: NSSize(width: size, height: size))
        }
        return NSImage(size: NSSize(width: size, height: size))
    }

    static func writePNG(image: NSImage, to url: URL) throws {
        guard let tiff = image.tiffRepresentation,
              let rep = NSBitmapImageRep(data: tiff),
              let data = rep.representation(using: .png, properties: [:])
        else {
            throw NSError(domain: "IconGenerator", code: 1)
        }
        try data.write(to: url)
    }
}

/// A larger, more expressive icon composition used for the .app AppIcon.
struct AppIconContent: View {
    var body: some View {
        GeometryReader { geo in
            let s = min(geo.size.width, geo.size.height)
            ZStack {
                // Squircle backdrop
                RoundedRectangle(cornerRadius: s * 0.22, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Palette.beigeSoft, Palette.beige, Palette.beigeDeep],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: s * 0.22, style: .continuous)
                            .stroke(Palette.brown.opacity(0.10), lineWidth: max(0.5, s * 0.006))
                    )
                    .shadow(color: Palette.brown.opacity(0.14), radius: s * 0.018, x: 0, y: s * 0.006)

                // Subtle pink "swash" behind mascot
                Ellipse()
                    .fill(Palette.pinkSoft.opacity(0.55))
                    .frame(width: s * 0.68, height: s * 0.22)
                    .offset(y: s * 0.28)
                    .blur(radius: s * 0.02)

                // Otter mascot – happy expression
                OtterMascot(mood: .happy, size: s * 0.74, animated: false)
                    .offset(x: -s * 0.02, y: -s * 0.03)

                // Prominent water drop
                WaterDropGlyph()
                    .frame(width: s * 0.24, height: s * 0.30)
                    .shadow(color: Palette.waterDeep.opacity(0.45), radius: s * 0.012)
                    .offset(x: s * 0.28, y: s * 0.28)
            }
        }
    }
}
