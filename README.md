# Siply

> *Nawadniaj się pięknie.*

Mobilna aplikacja do śledzenia dziennego spożycia wody oraz butelek kaucjonowanych, zbudowana w React Native i Expo. W pełni offline — bez rejestracji, bez backendu, bez chmury.

---

## Funkcje

**Nawodnienie**
- **Animowana butelka** — SVG wypełniający się wodą z efektem fali i bąbelków
- **Płynny licznik** — animowany counter ml/L, automatycznie przełącza jednostkę
- **Szybki dodaj** — +100 / +250 / +330 / +500 ml jednym tapem
- **Własna ilość** — wpisz dowolną wartość ml przez modal
- **Latający popup** — komentarz z humorem po każdym dodaniu wody
- **Cofnij** — undo ostatniego wpisu jednym tapem

**Butelki kaucjonowane**
- Zaznaczaj plastikowe (PET), szklane i puszki do oddania
- Aplikacja śledzi ile masz butelek do zwrotu i jaką kaucję możesz odzyskać
- Kwoty zgodne z polskim systemem kaucyjnym: 0.50 zł (PET/puszka), 1.00 zł (szkło)
- Przycisk „Oddaję!" rejestruje zwrot i sumuje zarobki

**Statystyki**
- Wykres słupkowy 7 dni z linią celu
- Zarobki z butelek widoczne pod każdym dniem na wykresie
- Karty: średnia, najlepszy dzień, cel tygodnia, łączne zarobki z kaucji

---

## Stack technologiczny

| Technologia | Wersja | Zastosowanie |
|---|---|---|
| React Native | 0.81 | Framework mobilny (iOS + Android) |
| Expo SDK | 54 | Toolchain, natywne API, EAS Build |
| Expo Router | 6 | Nawigacja plikowa (zakładki) |
| TypeScript | 5.9 | Statyczne typowanie |
| AsyncStorage | 2.2 | Lokalne persystowanie danych |
| react-native-svg | 15 | Wykres słupkowy + butelka SVG |
| expo-linear-gradient | 15 | Gradienty tła na każdym ekranie |
| Ionicons (Expo) | — | Ikony wektorowe w UI i navbarze |

---

## Uruchomienie

```bash
git clone https://github.com/Gromojar/Siply.git
cd Siply
npm install
npx expo start
```

Zeskanuj QR kod aplikacją **Expo Go** (iOS / Android) albo naciśnij `i` / `a` dla symulatora.

---

## Struktura projektu

```
app/
  (tabs)/
    index.tsx        ← ekran Dziś
    statistics.tsx   ← statystyki 7 dni
    settings.tsx     ← ustawienia
components/
  WaterBottle.tsx        ← animowana butelka SVG z falą i bąbelkami
  FlyingDrop.tsx         ← latający popup po dodaniu wody
  QuickAddButton.tsx     ← przycisk szybkiego dodawania
  WaterChart.tsx         ← wykres słupkowy SVG
  AnimatedCounter.tsx    ← licznik z płynną animacją
  StatCard.tsx           ← karta statystyk
hooks/
  useWaterData.ts    ← stan wody + butelek (dziś + 7 dni)
  useSettings.ts     ← ustawienia użytkownika
services/
  storage.ts         ← warstwa AsyncStorage
types/
  index.ts           ← typy TypeScript
constants/
  index.ts           ← kolory, stałe, opcje butelek
utils/
  dateUtils.ts       ← formatowanie dat
```

---

## Model danych

```json
// siply_water_records
{
  "2025-05-19": {
    "date": "2025-05-19",
    "totalMl": 1850,
    "entries": [{ "id": "...", "amount": 500, "timestamp": 1747648200000 }],
    "bottles": [{ "id": "...", "kind": "PET", "sizeL": 0.5, "depositZl": 0.5, "timestamp": 1747648200000 }]
  }
}

// siply_bottle_returns
[{ "id": "...", "count": 3, "earnedZl": 1.50, "timestamp": 1747648200000 }]

// siply_settings
{ "dailyGoalMl": 2000, "unit": "ml" }
```

---

## Autor

**Damian Chymkowski** — projekt studencki, 2025
