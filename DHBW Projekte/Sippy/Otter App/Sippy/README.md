# Sippy 🦦

A native macOS menu-bar water tracker with a cute otter mascot.

Built in Swift 6 / SwiftUI, targeting macOS 14+.

## What it is

Sippy lives in the macOS menu bar. Click the icon and a compact popover opens
with your hydration dashboard: a friendly otter mascot, an animated water
glass that fills up as you drink, quick-add amount buttons, and a row of
droplet indicators showing your progress through the working day.

The design goal is *editorial-quality* — warm beige surfaces, dark brown
typography, dusty pink accents, and a clear water blue as the main contrast.
The otter is drawn entirely in vector shapes so it stays crisp at every size
from the 16 px menu-bar glyph to the 1024 px app icon.

Every hour Sippy schedules a friendly, context-aware reminder — the message
adapts to how much you've already drunk in the current hour and whether
you've reached your daily goal.

## Features

- **Menu-bar first**: `MenuBarExtra` (`.window` style) with a compact popover;
  the app runs as an `LSUIElement` accessory, no dock icon.
- **Today dashboard**: mascot copy, water glass with wave/ripple animation,
  daily total, progress bar, quick-add row (`50/100/200/300/500 ml`) with
  undo, and a droplet strip for each hour of the working day.
- **Month overview**: calendar grid with per-day circular progress rings,
  running averages, goal-reached count, month total.
- **Settings**: daily & hourly targets, working-hour bounds, reminder
  interval, notification toggle, launch-at-login (via `SMAppService`),
  full data reset with confirmation.
- **Adaptive notifications**: the same 60-minute cadence uses different copy
  depending on progress ("keep it up" if you've already sipped, "you nailed
  it" once the daily goal is reached, an inviting nudge otherwise).
- **Onboarding**: two-screen first-run intro that sets working hours and
  requests notification permission.
- **Custom otter mascot**: five moods (`sleepy`, `thirsty`, `content`, `happy`,
  `celebrating`) with idle breathing and occasional blinks.
- **Local-only persistence**: JSON-encoded model in `UserDefaults`. No
  network, no accounts.

## Project layout

```
Sippy/
├── Package.swift               ← Swift Package (executable target)
├── build-app.sh                ← build script → produces build/Sippy.app
└── Sources/Sippy/
    ├── SippyApp.swift          ← @main + AppDelegate + MenuBarExtra scene
    ├── Models/
    │   ├── AppSettings.swift
    │   ├── HydrationDay.swift
    │   └── HydrationEntry.swift
    ├── Services/
    │   ├── HydrationStore.swift        ← ObservableObject persistence layer
    │   ├── NotificationManager.swift   ← UN scheduling + delegate
    │   ├── LaunchAtLoginManager.swift  ← SMAppService wrapper
    │   ├── IconGenerator.swift         ← --generate-icons CLI mode
    │   └── PreviewRenderer.swift       ← --preview CLI mode (visual QA)
    ├── Theme/
    │   ├── Palette.swift               ← named colours
    │   └── Typography.swift            ← font scale
    └── Views/
        ├── PopoverRootView.swift       ← nav shell + onboarding switch
        ├── TodayView.swift
        ├── MonthView.swift
        ├── SettingsView.swift          ← SettingsView + SettingsContent
        ├── OnboardingView.swift
        └── Components/
            ├── OtterMascot.swift       ← full-body vector otter
            ├── MenuBarIcon.swift       ← 18 pt menu-bar glyph + water drop
            ├── WaterGlass.swift        ← animated wave-fill container
            ├── HourlyProgress.swift    ← droplet-shaped hour indicators
            ├── QuickAddButtons.swift   ← preset amounts + undo
            └── SegmentedNav.swift      ← underlined pill nav bar
```

## Build & run

```bash
cd Sippy
./build-app.sh            # produces build/Sippy.app
open build/Sippy.app      # opens with an ad-hoc signature
```

The build script:

1. Runs `swift build -c release`.
2. Copies the binary into `Sippy.app/Contents/MacOS/`.
3. Renders every AppIcon size by invoking the binary with `--generate-icons`
   (re-uses the SwiftUI mascot vectors) and packages them into an `.icns`.
4. Writes `Info.plist` with `LSUIElement = true`.
5. Ad-hoc signs the bundle so it can launch without Gatekeeper prompts.

### Developer helpers

```bash
# Regenerate AppIcon at any time
.build/release/Sippy --generate-icons /tmp/iconset

# Render popover mockups for visual QA (writes PNGs)
.build/debug/Sippy --preview /tmp/sippy-preview
```

## Architecture

- **Data flow**: `HydrationStore` is an `@MainActor` `ObservableObject` that
  owns every mutation and persists to `UserDefaults` after each change. All
  views observe it through `@EnvironmentObject`.
- **Notification scheduling**: `NotificationManager` always cancels the
  previous request and schedules exactly one upcoming reminder. This lets the
  next message adapt to freshly-recorded progress.
- **Persistence**: two keys — `sippy.days.v1` (array of `HydrationDay`) and
  `sippy.settings.v1` (`AppSettings`). Version suffixes leave room for
  migrations.
- **Rendering**: The mascot, menu-bar glyph, and water glass are all drawn
  through SwiftUI `Canvas`/`Shape` — no bitmap assets. AppIcon PNGs are
  produced by rendering the same `AppIconContent` view through
  `ImageRenderer`.

## Personal-data & privacy

Nothing leaves the machine. There is no network code anywhere in the project.
All hydration data lives in the Sippy `UserDefaults` domain, which is
`~/Library/Preferences/com.sippy.SippyApp.plist`.

Reset any time via **Settings → Data → Reset all data**.

## Minimum system requirements

- macOS 14 (Sonoma) or later
- Apple silicon or Intel (`.app` is thin arm64 as built — regenerate for
  Intel with `swift build -c release --arch x86_64`)
