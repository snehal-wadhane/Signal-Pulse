# Signal Pulse — Workplace Wellness Monitor

A privacy-first Chrome extension (Manifest V3) that tracks your browsing patterns to surface focus scores, deep work sessions, and wellness insights — all without sending any data off your device.

## Features

- **Focus Score** — real-time 0–100 score based on your browsing behaviour
- **Deep Work Tracking** — detects uninterrupted productive sessions
- **Work Pattern Analysis** — classifies time into Work / Communication / Distraction
- **Focus Mode** — Pomodoro-style timer with distraction blocking
- **Smart Nudges** — browser notifications when fragmentation spikes
- **Weekly Report** — visual breakdown of your week
- **AI Dashboard** — AI-powered behavioural insights
- **Manager Insights** — aggregated, privacy-safe team view
- **Export** — download your data as JSON
- **Streak Tracking** — consecutive days hitting your deep-work goal

All data is stored locally via `chrome.storage` — nothing leaves your browser.

## File Structure

```
signal-pulse-COMPLETE/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker: tracking, nudges, alarms
├── ai-engine.js           # Pattern detection & scoring logic
├── popup.html / popup.js / popup.css   # Main popup UI
├── report.html / report.js / report.css  # Weekly report page
├── ai-dashboard.html / ai-dashboard.js  # AI insights dashboard
├── manager-insights.html / manager-insights.js  # Manager view
├── tasks.html / tasks.js  # Task manager
├── blocked.html           # Distraction-blocked page
└── icons/                 # Extension icons (16, 48, 128 px)
```

## Installation (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this folder
5. Pin the Signal Pulse icon from the extensions toolbar

## Usage

- Click the extension icon to open the popup dashboard
- Hit **Start Focus Mode** to begin a timed focus session
- Visit **Weekly Report** for a deeper breakdown
- Use **AI Dashboard** for behavioural pattern insights
- **Export Data** saves a local JSON snapshot of your history

## Permissions

| Permission | Reason |
|---|---|
| `tabs` | Detect active tab changes |
| `idle` | Detect when the user goes idle |
| `storage` | Persist tracking data locally |
| `notifications` | Send smart nudge alerts |
| `alarms` | Schedule periodic analysis |
| `webNavigation` | Track navigation events |

## Privacy

All processing and storage happens entirely on-device. No analytics, no external requests, no accounts required.

## License

MIT
