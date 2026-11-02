import type {
  Ability,
  ActionCost,
  ArmorCategory,
  Die,
  FeatType,
  Proficiency,
  Size,
  Tradition,
} from "@/lib/pf2/types";

export const ABILITIES: { id: Ability; name: string; short: string }[] = [
  { id: "str", name: "Сила", short: "Сил" },
  { id: "dex", name: "Ловкость", short: "Лов" },
  { id: "con", name: "Выносливость", short: "Вын" },
  { id: "int", name: "Интеллект", short: "Инт" },
  { id: "wis", name: "Мудрость", short: "Мдр" },
  { id: "cha", name: "Харизма", short: "Хар" },
];

export const PROFICIENCIES: { rank: Proficiency; label: string; short: string }[] = [
  { rank: 0, label: "Необученный", short: "Н" },
  { rank: 2, label: "Обученный", short: "О" },
  { rank: 4, label: "Эксперт", short: "Э" },
  { rank: 6, label: "Мастер", short: "М" },
  { rank: 8, label: "Легенда", short: "Л" },
];

export const SIZES: { id: Size; label: string }[] = [
  { id: "tiny", label: "Крошечный" },
  { id: "small", label: "Небольшой" },
  { id: "medium", label: "Средний" },
  { id: "large", label: "Крупный" },
  { id: "huge", label: "Огромный" },
];

export const FEAT_TYPES: { id: FeatType; label: string }[] = [
  { id: "ancestry", label: "Народа" },
  { id: "heritage", label: "Наследие" },
  { id: "background", label: "Происхождения" },
  { id: "classfeature", label: "Особенность класса" },
  { id: "class", label: "Классовая" },
  { id: "skill", label: "Навыка" },
  { id: "general", label: "Общая" },
  { id: "other", label: "Другое" },
];

export const ACTION_COSTS: { id: ActionCost; label: string }[] = [
  { id: "1", label: "1 действие" },
  { id: "2", label: "2 действия" },
  { id: "3", label: "3 действия" },
  { id: "reaction", label: "Реакция" },
  { id: "free", label: "Свободное" },
];

export const TRADITIONS: { id: Tradition; label: string }[] = [
  { id: "arcane", label: "Мистическая" },
  { id: "divine", label: "Сакральная" },
  { id: "occult", label: "Оккультная" },
  { id: "primal", label: "Первобытная" },
  { id: "none", label: "Без традиции" },
];

export interface SkillCatalog {
  id: string;
  name: string;
  ability: Ability;
  armor: boolean;
}

export const SKILL_CATALOG: SkillCatalog[] = [
  { id: "acrobatics", name: "Акробатика", ability: "dex", armor: true },
  { id: "arcana", name: "Мистицизм", ability: "int", armor: false },
  { id: "athletics", name: "Атлетика", ability: "str", armor: true },
  { id: "crafting", name: "Ремесло", ability: "int", armor: false },
  { id: "deception", name: "Обман", ability: "cha", armor: false },
  { id: "diplomacy", name: "Дипломатия", ability: "cha", armor: false },
  { id: "intimidation", name: "Запугивание", ability: "cha", armor: false },
  { id: "medicine", name: "Медицина", ability: "wis", armor: false },
  { id: "nature", name: "Природа", ability: "wis", armor: false },
  { id: "occultism", name: "Оккультизм", ability: "int", armor: false },
  { id: "performance", name: "Исполнение", ability: "cha", armor: false },
  { id: "religion", name: "Религия", ability: "wis", armor: false },
  { id: "society", name: "Общество", ability: "int", armor: false },
  { id: "stealth", name: "Скрытность", ability: "dex", armor: true },
  { id: "survival", name: "Выживание", ability: "wis", armor: false },
  { id: "thievery", name: "Воровство", ability: "dex", armor: true },
];

export interface AncestryPreset {
  id: string;
  name: string;
  hp: number;
  speed: number;
  size: Size;
}

export const ANCESTRIES: AncestryPreset[] = [
  { id: "dwarf", name: "Дварф", hp: 10, speed: 20, size: "medium" },
  { id: "elf", name: "Эльф", hp: 6, speed: 30, size: "medium" },
  { id: "gnome", name: "Гном", hp: 8, speed: 25, size: "small" },
  { id: "goblin", name: "Гоблин", hp: 6, speed: 25, size: "small" },
  { id: "halfling", name: "Полурослик", hp: 6, speed: 25, size: "small" },
  { id: "human", name: "Человек", hp: 8, speed: 25, size: "medium" },
  { id: "leshy", name: "Леший", hp: 8, speed: 25, size: "small" },
  { id: "orc", name: "Орк", hp: 10, speed: 25, size: "medium" },
];

export interface ClassPreset {
  id: string;
  name: string;
  hp: number;
  key: Ability;
  perception: Proficiency;
  fort: Proficiency;
  ref: Proficiency;
  will: Proficiency;
  armor: Record<ArmorCategory, Proficiency>;
  classDc: Proficiency;
  note: string;
}

const T = 2 as Proficiency;
const E = 4 as Proficiency;
const U = 0 as Proficiency;

export const CLASSES: ClassPreset[] = [
  {
    id: "alchemist",
    name: "Алхимик",
    hp: 8,
    key: "int",
    perception: T,
    fort: E,
    ref: E,
    will: T,
    armor: { unarmored: T, light: T, medium: U, heavy: U },
    classDc: T,
    note: "Ремесло. Стартовые ранги — для 1 уровня, дальше повышайте сами.",
  },
  {
    id: "barbarian",
    name: "Варвар",
    hp: 12,
    key: "str",
    perception: E,
    fort: E,
    ref: T,
    will: E,
    armor: { unarmored: T, light: T, medium: T, heavy: U },
    classDc: T,
    note: "Атлетика и ещё навыки. Простое и воинское оружие — обучен.",
  },
  {
    id: "bard",
    name: "Бард",
    hp: 8,
    key: "cha",
    perception: E,
    fort: T,
    ref: T,
    will: E,
    armor: { unarmored: T, light: T, medium: U, heavy: U },
    classDc: T,
    note: "Оккультная традиция. Оккультизм и ещё навыки.",
  },
  {
    id: "champion",
    name: "Поборник",
    hp: 10,
    key: "str",
    perception: T,
    fort: E,
    ref: T,
    will: E,
    armor: { unarmored: T, light: T, medium: T, heavy: T },
    classDc: T,
    note: "Религия. Все доспехи и воинское оружие. Ключ можно сменить на Ловкость.",
  },
  {
    id: "cleric",
    name: "Жрец",
    hp: 8,
    key: "wis",
    perception: T,
    fort: T,
    ref: T,
    will: E,
    armor: { unarmored: T, light: U, medium: U, heavy: U },
    classDc: T,
    note: "Сакральная традиция. Военный жрец: стойкость — эксперт, лёгкие и средние доспехи.",
  },
  {
    id: "druid",
    name: "Друид",
    hp: 8,
    key: "wis",
    perception: T,
    fort: E,
    ref: T,
    will: E,
    armor: { unarmored: T, light: T, medium: T, heavy: U },
    classDc: T,
    note: "Первобытная традиция. Природа. Металлический доспех обычно под анафемой.",
  },
  {
    id: "fighter",
    name: "Воин",
    hp: 10,
    key: "str",
    perception: E,
    fort: E,
    ref: E,
    will: T,
    armor: { unarmored: T, light: T, medium: T, heavy: T },
    classDc: T,
    note: "Эксперт в простом и воинском оружии уже на 1 уровне. Акробатика или Атлетика.",
  },
  {
    id: "monk",
    name: "Монах",
    hp: 10,
    key: "str",
    perception: T,
    fort: E,
    ref: E,
    will: E,
    armor: { unarmored: E, light: U, medium: U, heavy: U },
    classDc: T,
    note: "Эксперт без доспеха и в безоружных ударах. Ключ — Сила или Ловкость.",
  },
  {
    id: "ranger",
    name: "Следопыт",
    hp: 10,
    key: "dex",
    perception: E,
    fort: E,
    ref: E,
    will: T,
    armor: { unarmored: T, light: T, medium: T, heavy: U },
    classDc: T,
    note: "Природа. Простое и воинское оружие — обучен. Ключ — Ловкость или Сила.",
  },
  {
    id: "rogue",
    name: "Плут",
    hp: 8,
    key: "dex",
    perception: E,
    fort: T,
    ref: E,
    will: E,
    armor: { unarmored: T, light: T, medium: U, heavy: U },
    classDc: T,
    note: "Скрытность и много дополнительных навыков. Простое оружие и короткие клинки.",
  },
  {
    id: "sorcerer",
    name: "Чародей",
    hp: 6,
    key: "cha",
    perception: T,
    fort: T,
    ref: T,
    will: E,
    armor: { unarmored: T, light: U, medium: U, heavy: U },
    classDc: T,
    note: "Традиция кровной линии. Обучен в ней и в простом оружии.",
  },
  {
    id: "witch",
    name: "Ведьма",
    hp: 6,
    key: "int",
    perception: T,
    fort: T,
    ref: T,
    will: E,
    armor: { unarmored: T, light: U, medium: U, heavy: U },
    classDc: T,
    note: "Традицию задаёт покровитель. Обучена в ней и в простом оружии.",
  },
  {
    id: "wizard",
    name: "Волшебник",
    hp: 6,
    key: "int",
    perception: T,
    fort: T,
    ref: T,
    will: E,
    armor: { unarmored: T, light: U, medium: U, heavy: U },
    classDc: T,
    note: "Мистическая традиция. Мистицизм. Простое оружие.",
  },
];

export interface ArmorPreset {
  id: string;
  name: string;
  category: ArmorCategory;
  bonus: number;
  dex: number | null;
  check: number;
  speed: number;
  str: number | null;
  group: string;
}

export const ARMORS: ArmorPreset[] = [
  { id: "none", name: "Без доспеха", category: "unarmored", bonus: 0, dex: null, check: 0, speed: 0, str: null, group: "—" },
  { id: "explorer", name: "Одежда путешественника", category: "unarmored", bonus: 0, dex: null, check: 0, speed: 0, str: null, group: "ткань" },
  { id: "padded", name: "Стёганый", category: "light", bonus: 1, dex: 3, check: 0, speed: 0, str: 0, group: "ткань" },
  { id: "leather", name: "Кожаный", category: "light", bonus: 1, dex: 4, check: 0, speed: 0, str: 0, group: "кожа" },
  { id: "studded", name: "Клёпаная кожа", category: "light", bonus: 2, dex: 3, check: 1, speed: 0, str: 1, group: "кожа" },
  { id: "chainshirt", name: "Кольчужная рубаха", category: "light", bonus: 2, dex: 3, check: 1, speed: 0, str: 1, group: "кольчуга" },
  { id: "hide", name: "Шкурный", category: "medium", bonus: 3, dex: 2, check: 2, speed: 5, str: 2, group: "кожа" },
  { id: "scale", name: "Чешуйчатый", category: "medium", bonus: 3, dex: 2, check: 2, speed: 5, str: 2, group: "составной" },
  { id: "chainmail", name: "Кольчуга", category: "medium", bonus: 4, dex: 1, check: 2, speed: 5, str: 3, group: "кольчуга" },
  { id: "breastplate", name: "Нагрудник", category: "medium", bonus: 4, dex: 1, check: 2, speed: 5, str: 3, group: "латы" },
  { id: "splint", name: "Ламеллярный", category: "heavy", bonus: 5, dex: 1, check: 3, speed: 10, str: 3, group: "составной" },
  { id: "halfplate", name: "Полулаты", category: "heavy", bonus: 5, dex: 1, check: 3, speed: 10, str: 3, group: "латы" },
  { id: "fullplate", name: "Полные латы", category: "heavy", bonus: 6, dex: 0, check: 3, speed: 10, str: 4, group: "латы" },
];

export const ARMOR_CATEGORIES: { id: ArmorCategory; label: string }[] = [
  { id: "unarmored", label: "Без доспеха" },
  { id: "light", label: "Лёгкий" },
  { id: "medium", label: "Средний" },
  { id: "heavy", label: "Тяжёлый" },
];

export interface ShieldPreset {
  id: string;
  name: string;
  bonus: number;
  hardness: number;
  hp: number;
  bt: number;
}

export const SHIELDS: ShieldPreset[] = [
  { id: "none", name: "Нет щита", bonus: 0, hardness: 0, hp: 0, bt: 0 },
  { id: "buckler", name: "Баклер", bonus: 1, hardness: 3, hp: 6, bt: 3 },
  { id: "wooden", name: "Деревянный щит", bonus: 2, hardness: 3, hp: 12, bt: 6 },
  { id: "steel", name: "Стальной щит", bonus: 2, hardness: 5, hp: 20, bt: 10 },
  { id: "tower", name: "Башенный щит", bonus: 2, hardness: 5, hp: 20, bt: 10 },
];

export interface WeaponPreset {
  name: string;
  die: Die;
  damage: string;
  traits: string;
  finesse?: boolean;
  agile?: boolean;
  propulsive?: boolean;
  thrown?: boolean;
  ranged?: boolean;
  ability?: Ability;
  damageAbility?: "str" | "halfstr" | "dex" | "none";
  hands: string;
  range?: string;
}

export const WEAPONS: WeaponPreset[] = [
  { name: "Кулак", die: 4, damage: "дробящий", traits: "безоружное, быстрое, фехтовальное, несмертельное", finesse: true, agile: true, hands: "1" },
  { name: "Кинжал", die: 4, damage: "колющий", traits: "быстрое, фехтовальное, метательное 10 фт., универсальное Р", finesse: true, agile: true, thrown: true, hands: "1", range: "10 фт." },
  { name: "Короткий меч", die: 6, damage: "колющий", traits: "быстрое, фехтовальное, универсальное Р", finesse: true, agile: true, hands: "1" },
  { name: "Рапира", die: 6, damage: "колющий", traits: "смертельное d8, фехтовальное", finesse: true, hands: "1" },
  { name: "Дубинка", die: 6, damage: "дробящий", traits: "метательное 10 фт.", thrown: true, hands: "1", range: "10 фт." },
  { name: "Булава", die: 8, damage: "дробящий", traits: "толчок", hands: "1" },
  { name: "Боевой топор", die: 8, damage: "рубящий", traits: "размах", hands: "1" },
  { name: "Длинный меч", die: 8, damage: "рубящий", traits: "", hands: "1" },
  { name: "Копьё", die: 6, damage: "колющий", traits: "метательное 20 фт.", thrown: true, hands: "1", range: "20 фт." },
  { name: "Посох", die: 4, damage: "дробящий", traits: "двуручное d8", hands: "1" },
  { name: "Двуручный меч", die: 12, damage: "рубящий", traits: "двуручное", hands: "2" },
  { name: "Алебарда", die: 10, damage: "рубящий", traits: "досягаемость, двуручное", hands: "2" },
  { name: "Длинное копьё", die: 8, damage: "колющий", traits: "досягаемость", hands: "2" },
  { name: "Короткий лук", die: 6, damage: "колющий", traits: "смертельное d10", ranged: true, ability: "dex", damageAbility: "none", hands: "1+", range: "60 фт." },
  { name: "Длинный лук", die: 8, damage: "колющий", traits: "залп 30 фт., смертельное d10", ranged: true, ability: "dex", damageAbility: "none", hands: "2", range: "100 фт." },
  { name: "Арбалет", die: 8, damage: "колющий", traits: "перезарядка 1", ranged: true, ability: "dex", damageAbility: "none", hands: "2", range: "120 фт." },
  { name: "Праща", die: 6, damage: "дробящий", traits: "метательное", ranged: true, propulsive: true, ability: "dex", damageAbility: "halfstr", hands: "1", range: "50 фт." },
];

export const CASTER_SLOTS: number[][] = [
  [],
  [2],
  [3],
  [3, 2],
  [3, 3],
  [3, 3, 2],
  [3, 3, 3],
  [3, 3, 3, 2],
  [3, 3, 3, 3],
  [3, 3, 3, 3, 2],
  [3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 2],
  [3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 2],
  [3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 2],
  [3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 2],
  [3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
];

export function fullCasterSlots(level: number): { rank: number; max: number }[] {
  const row = CASTER_SLOTS[Math.min(20, Math.max(0, level))] ?? [];
  return row.map((max, index) => ({ rank: index + 1, max }));
}

export function levelReminders(level: number): string[] {
  const items = ["ПЗ растут сами: класс + Выносливость"];
  if (level === 1) items.push("черта народа, черта происхождения, особенности класса");
  if ([1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].includes(level)) items.push("классовая черта");
  if ([2, 4, 6, 8, 10, 12, 14, 16, 18, 20].includes(level)) items.push("черта навыка");
  if ([3, 7, 11, 15, 19].includes(level)) items.push("общая черта");
  if ([3, 5, 7, 9, 11, 13, 15, 17, 19].includes(level)) items.push("повышение навыка");
  if ([5, 9, 13, 17].includes(level)) items.push("черта народа");
  if ([5, 10, 15, 20].includes(level)) items.push("четыре повышения характеристик");
  return items;
}

export function abilityName(id: Ability): string {
  return ABILITIES.find((ability) => ability.id === id)?.name ?? id;
}

export function abilityShort(id: Ability): string {
  return ABILITIES.find((ability) => ability.id === id)?.short ?? id;
}

export function profLabel(rank: Proficiency): string {
  return PROFICIENCIES.find((item) => item.rank === rank)?.label ?? "Необученный";
}

export function profShort(rank: Proficiency): string {
  return PROFICIENCIES.find((item) => item.rank === rank)?.short ?? "Н";
}

export function nextProf(rank: Proficiency): Proficiency {
  if (rank === 0) return 2;
  if (rank === 2) return 4;
  if (rank === 4) return 6;
  if (rank === 6) return 8;
  return 0;
}
