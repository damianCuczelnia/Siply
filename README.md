# Siply

> *Nawadniaj się pięknie.*

Mobilna aplikacja do śledzenia dziennego spożycia wody, zbudowana w React Native i Expo. Prosta, piękna i w pełni offline — bez rejestracji, bez backendu, bez chmury.

---

## Funkcje

- **Animowany pierścień** — SVG arc wypełniający się powoli z efektem bulgotania bąbelków
- **Płynny licznik** — animowany counter ml/L, automatycznie przełącza jednostkę
- **Szybki dodaj** — +100 / +250 / +330 / +500 ml jednym tapem
- **Własna ilość** — wpisz dowolną wartość ml przez modal
- **Latający popup** — komentarz z humorem po każdym dodaniu wody
- **Cofnij** — undo ostatniego wpisu jednym tapem
- **Wykres 7 dni** — słupki SVG z linią celu i podsumowaniem tygodnia
- **Ustawienia** — cel dzienny, presety 1.5–3 L, dynamiczny hint
- **Pełna polszczyzna** — daty, dni tygodnia, komunikaty po polsku

---

## Stack technologiczny

| Technologia | Wersja | Zastosowanie |
|---|---|---|
| React Native | 0.81 | Framework mobilny (iOS + Android) |
| Expo SDK | 54 | Toolchain, natywne API, EAS Build |
| Expo Router | 6 | Nawigacja plikowa (zakładki) |
| TypeScript | 5.9 | Statyczne typowanie |
| AsyncStorage | 2.2 | Lokalne persystowanie danych |
| react-native-svg | 15 | Wykres słupkowy + pierścień postępu |
| expo-linear-gradient | 15 | Gradienty tła na każdym ekranie |
| Ionicons (Expo) | — | Ikony wektorowe w UI i navbarze |

---

## Uruchomienie

```bash
# Sklonuj repozytorium
git clone https://github.com/Gromojar/Siply.git
cd Siply

# Zainstaluj zależności
npm install

# Uruchom serwer Expo
npx expo start
```

Następnie zeskanuj QR kod aplikacją **Expo Go** (iOS / Android) albo naciśnij `i` dla symulatora iOS / `a` dla emulatora Android.

---

## Struktura projektu

```
app/
  (tabs)/
    index.tsx        ← ekran Dziś
    statistics.tsx   ← statystyki 7 dni
    settings.tsx     ← ustawienia
components/
  CircularProgress.tsx   ← animowany pierścień SVG z bąbelkami
  FlyingDrop.tsx         ← latający popup po dodaniu wody
  QuickAddButton.tsx     ← przycisk szybkiego dodawania
  WaterChart.tsx         ← wykres słupkowy SVG
  AnimatedCounter.tsx    ← licznik z płynną animacją
  StatCard.tsx           ← karta statystyk
hooks/
  useWaterData.ts    ← stan wody (dziś + 7 dni)
  useSettings.ts     ← ustawienia użytkownika
services/
  storage.ts         ← warstwa AsyncStorage
types/
  index.ts           ← typy TypeScript
constants/
  index.ts           ← kolory, stałe, klucze
  messages.ts        ← śmieszne wstawki po polsku
utils/
  dateUtils.ts       ← formatowanie dat po polsku
```

---

## Model danych

Wszystkie dane przechowywane są **lokalnie na urządzeniu** w `AsyncStorage`.

```json
// klucz: "siply_water_records"
{
  "2025-05-19": {
    "date": "2025-05-19",
    "totalMl": 1850,
    "entries": [
      { "id": "entry_...", "amount": 500, "timestamp": 1747648200000 }
    ]
  }
}

// klucz: "siply_settings"
{ "dailyGoalMl": 2000, "unit": "ml" }
```

---

## Autor

**Damian Chymkowski** — projekt studencki, 2025

Zbudowany w React Native i Expo. Bo nawodnienie jest ważne.
