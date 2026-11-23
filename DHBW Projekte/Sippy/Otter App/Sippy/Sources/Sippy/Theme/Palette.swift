import SwiftUI

/// Central colour palette of the app.
enum Palette {
    // MARK: – Warm neutrals
    static let beige       = Color(red: 245/255, green: 235/255, blue: 221/255) // #F5EBDD
    static let beigeSoft   = Color(red: 250/255, green: 243/255, blue: 232/255)
    static let beigeDeep   = Color(red: 235/255, green: 221/255, blue: 202/255)
    static let cream       = Color(red: 252/255, green: 247/255, blue: 240/255)

    // MARK: – Brown / text
    static let brown       = Color(red:  74/255, green:  48/255, blue:  40/255) // #4A3028
    static let brownSoft   = Color(red: 122/255, green:  90/255, blue:  76/255)
    static let brownLight  = Color(red: 168/255, green: 132/255, blue: 108/255)
    static let brownMuted  = Color(red: 175/255, green: 150/255, blue: 130/255)

    // MARK: – Pink accent
    static let pink        = Color(red: 217/255, green: 154/255, blue: 166/255) // #D99AA6
    static let pinkSoft    = Color(red: 235/255, green: 200/255, blue: 208/255)
    static let pinkCheek   = Color(red: 244/255, green: 195/255, blue: 200/255)

    // MARK: – Water
    static let water       = Color(red: 116/255, green: 185/255, blue: 232/255) // #74B9E8
    static let waterDeep   = Color(red:  84/255, green: 158/255, blue: 214/255)
    static let waterLight  = Color(red: 178/255, green: 218/255, blue: 244/255)
    static let waterFoam   = Color(red: 232/255, green: 244/255, blue: 252/255)

    // MARK: – Otter fur tones
    static let furDark     = Color(red: 108/255, green:  74/255, blue:  55/255)
    static let furMid      = Color(red: 158/255, green: 116/255, blue:  90/255)
    static let furLight    = Color(red: 196/255, green: 156/255, blue: 128/255)
    static let furBelly    = Color(red: 245/255, green: 226/255, blue: 205/255)
    static let furOutline  = Color(red:  64/255, green:  40/255, blue:  30/255)

    // MARK: – Semantic
    static let success     = Color(red: 130/255, green: 176/255, blue: 130/255)
    static let hairline    = Color(red:  74/255, green:  48/255, blue:  40/255).opacity(0.12)
    static let hairlineSoft = Color(red:  74/255, green:  48/255, blue:  40/255).opacity(0.06)
}

extension Color {
    static let sippyBeige = Palette.beige
    static let sippyBrown = Palette.brown
    static let sippyPink  = Palette.pink
    static let sippyWater = Palette.water
}
