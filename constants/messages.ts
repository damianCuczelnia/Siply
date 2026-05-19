export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return 'Hej, nocny marek... 🦉';
  if (h < 10) return 'Dzień dobry! Czas na pierwsze ml ☀️';
  if (h < 12) return 'Przedpołudniowe tankowanie! ⛽';
  if (h < 14) return 'Obiadowa przerwa na wodę 🍽️';
  if (h < 17) return 'Popołudniowe nawodnienie! 💪';
  if (h < 20) return 'Wieczorne uzupełnianie płynów 🌆';
  return 'Ostatnia tura przed snem... 🌙';
}

export const ADD_REACTIONS: Record<number, string> = {
  100:  'Mały łyk — wielki krok dla nerek 🫘',
  250:  'Pełna szklanka. Klasyk 👏',
  330:  'Tyle co puszka coli — tylko zdrowiej 😏',
  500:  'Pół litra! Polska gola! ⚽',
};

export const FUNNY_TOASTS = [
  'Twoje nerki napisały "dziękuję" 🫘',
  'Zostań człowiekiem-hydroforni 💦',
  'Komórki klaszczą 👏',
  'Krok bliżej do zostania ogórkiem 🥒',
  'Woda — napój mistrzów 🏆',
  'Pijesz wodę? Jesteś inną klasą 🎩',
  'Twoje nerki tańczą 🕺',
  'Organizm mówi: nareszcieee! 😮‍💨',
  '72% wody — uzupełniasz straty! 💧',
  'Kawa nie liczy się. To się liczy! 😤',
];

export const GOAL_MET_MESSAGES = [
  'CEL OSIĄGNIĘTY! Twoje nerki tańczą 🕺🫘',
  'NAWODNIENIE KOMPLETNE! Jesteś jak ogórek z wiaderka 🥒',
  'MISJA WYKONANA! Jesteś wprost nawodnionym bohaterem 🦸',
  'DZIENNA NORMA ZDOBYTA! Zgarniasz wodne złoto 🥇💧',
];

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
