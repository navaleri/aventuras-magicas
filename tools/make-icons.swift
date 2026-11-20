// Genera los iconos PNG de la app (emoji 🗺️ sobre degradado).
// Uso: swift tools/make-icons.swift www/icons
import AppKit

let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "www/icons"

func icon(size: Int, emojiScale: CGFloat, rounded: Bool, name: String) {
    let s = CGFloat(size)
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
                               bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    let rect = NSRect(x: 0, y: 0, width: s, height: s)
    let path = rounded ? NSBezierPath(roundedRect: rect, xRadius: s * 0.22, yRadius: s * 0.22) : NSBezierPath(rect: rect)
    let grad = NSGradient(starting: NSColor(red: 1.0, green: 0.79, blue: 0.24, alpha: 1),
                          ending: NSColor(red: 0.49, green: 0.36, blue: 1.0, alpha: 1))!
    grad.draw(in: path, angle: -60)
    let emoji = "🗺️" as NSString
    let font = NSFont.systemFont(ofSize: s * emojiScale)
    let attrs: [NSAttributedString.Key: Any] = [.font: font]
    let size2 = emoji.size(withAttributes: attrs)
    emoji.draw(at: NSPoint(x: (s - size2.width) / 2, y: (s - size2.height) / 2), withAttributes: attrs)
    NSGraphicsContext.restoreGraphicsState()
    let data = rep.representation(using: .png, properties: [:])!
    try! data.write(to: URL(fileURLWithPath: "\(out)/\(name)"))
}

icon(size: 192, emojiScale: 0.62, rounded: true, name: "icon-192.png")
icon(size: 512, emojiScale: 0.62, rounded: true, name: "icon-512.png")
icon(size: 512, emojiScale: 0.45, rounded: false, name: "icon-maskable-512.png") // zona segura para Android
icon(size: 180, emojiScale: 0.55, rounded: false, name: "apple-touch-icon.png")    // iOS redondea solo
print("Iconos creados en \(out)")
