# 💧 Siply

> **Track your hydration beautifully.**

Siply is a modern, minimalist water tracking app built with React Native and Expo. It helps you stay hydrated by letting you quickly log your water intake throughout the day, visualize your weekly progress, and reach your daily hydration goals.

---

## Screenshots

> _Run the app with `npx expo start` and scan the QR code to see it in action._

| Today | Statistics | Settings |
|-------|-----------|---------|
| ![Today Screen](./assets/screenshots/today.png) | ![Stats Screen](./assets/screenshots/stats.png) | ![Settings Screen](./assets/screenshots/settings.png) |

---

## Features

- **Today screen** — big, beautiful circular progress ring showing how much you've drunk vs. your goal
- **Quick add buttons** — add 100 ml, 250 ml, 330 ml or 500 ml with one tap
- **Custom amount** — enter any amount in ml via a clean modal dialog
- **Undo last entry** — made a mistake? Remove the last log with one tap
- **Today's log** — see all drinks added today with timestamps
- **Statistics screen** — weekly bar chart, average intake, best day, goals met counter
- **Settings screen** — set your daily goal, choose from presets (1.5L–3L), reset all data
- **Persistent storage** — data survives app restarts, stored locally with AsyncStorage
- **Works fully offline** — no account, no backend, no internet required

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| React Native 0.79 | Cross-platform mobile framework |
| Expo SDK 53 | Development toolchain & native APIs |
| Expo Router 4 | File-based navigation |
| TypeScript 5.8 | Type safety |
| AsyncStorage 2.1 | Local persistent storage |
| expo-linear-gradient | Background and UI gradients |
| react-native-svg | Custom bar chart in statistics |
| react-native-reanimated 3 | Smooth button press animations |
| @expo/vector-icons | Ionicons for tab bar and UI |

---

## Installation

Make sure you have Node.js (v18+) and Expo CLI installed.

```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Clone the project
git clone https://github.com/damianCuczelnia/Siply.git
cd Siply

# Install dependencies
npm install
```

---

## Running the App

```bash
# Start the development server
npx expo start

# Then choose:
#   i → open in iOS Simulator (macOS only)
#   a → open in Android Emulator
#   Scan QR code with Expo Go app on your phone
```

### Running on a physical device
1. Install **Expo Go** from the App Store / Google Play
2. Run `npx expo start`
3. Scan the QR code

---

## Project Structure

```
Siply/
├── app/                        # Expo Router screens (file-based routing)
│   ├── _layout.tsx             # Root layout — status bar, splash screen
│   └── (tabs)/
│       ├── _layout.tsx         # Tab bar configuration (icons, styles)
│       ├── index.tsx           # Today screen (main screen)
│       ├── statistics.tsx      # Statistics & charts screen
│       └── settings.tsx        # Settings screen
│
├── components/                 # Reusable UI components
│   ├── CircularProgress.tsx    # SVG circular progress ring
│   ├── QuickAddButton.tsx      # Animated quick-add button
│   ├── WaterChart.tsx          # 7-day bar chart (built with SVG)
│   └── StatCard.tsx            # Statistics summary card
│
├── hooks/                      # React hooks (business logic)
│   ├── useWaterData.ts         # Water entries state + add/undo actions
│   └── useSettings.ts          # App settings state + update action
│
├── services/                   # Data layer
│   └── storage.ts              # AsyncStorage read/write operations
│
├── types/                      # TypeScript types
│   └── index.ts                # DayRecord, WaterEntry, AppSettings, etc.
│
├── constants/                  # App-wide constants
│   └── index.ts                # Colors, quick add options, storage keys
│
├── utils/                      # Utility functions
│   └── dateUtils.ts            # Date formatting, key generation
│
├── assets/
│   └── images/                 # App icons and splash screen
│
├── app.json                    # Expo configuration
├── babel.config.js             # Babel with Reanimated plugin
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

---

## Data Storage

All data is stored **locally on the device** using `@react-native-async-storage/async-storage`.

### Data Structure

#### Water records (`siply_water_records`)

```json
{
  "2025-01-15": {
    "date": "2025-01-15",
    "entries": [
      { "id": "entry_1705312800000_abc1234", "amount": 250, "timestamp": 1705312800000 },
      { "id": "entry_1705316400000_xyz5678", "amount": 500, "timestamp": 1705316400000 }
    ],
    "totalMl": 750
  },
  "2025-01-16": { ... }
}
```

#### Settings (`siply_settings`)

```json
{
  "dailyGoalMl": 2000,
  "unit": "ml"
}
```

### Design decisions
- **Key = date string** (`YYYY-MM-DD`) — simple, human-readable, easy to query by day
- **totalMl is denormalized** — stored alongside entries so reading the total doesn't require summing the array every time
- **No user authentication** — fully private, stored only on the device

---

## Possible Future Extensions

- [ ] Reminder notifications (via `expo-notifications`)
- [ ] Custom drink types (coffee, juice, tea) with different hydration multipliers
- [ ] Weight-based daily goal recommendation
- [ ] Dark mode support
- [ ] iCloud / Google Drive backup
- [ ] Widgets (via `expo-widget-kit`)
- [ ] Apple Health / Google Fit integration
- [ ] Streak tracking and achievements
- [ ] Monthly calendar view

---

## Author

**Damian Chymkowski**  
Student project — built with React Native, Expo, and TypeScript.

---

## License

This project is open source and available under the [MIT License](LICENSE).
