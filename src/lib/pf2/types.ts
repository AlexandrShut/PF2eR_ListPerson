export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type Proficiency = 0 | 2 | 4 | 6 | 8;
export type Size = "tiny" | "small" | "medium" | "large" | "huge";
export type ArmorCategory = "unarmored" | "light" | "medium" | "heavy";
export type ActionCost = "1" | "2" | "3" | "reaction" | "free";
export type FeatType =
  | "ancestry"
  | "heritage"
  | "background"
  | "classfeature"
  | "class"
  | "skill"
  | "general"
  | "other";
export type SpellEntryKind = "prepared" | "spontaneous" | "innate" | "focus";
export type Tradition = "arcane" | "divine" | "occult" | "primal" | "none";
export type DamageAbility = "str" | "halfstr" | "dex" | "none";
export type Die = 4 | 6 | 8 | 10 | 12;

export interface Conditions {
  frightened: number;
  sickened: number;
  clumsy: number;
  enfeebled: number;
  drained: number;
  stupefied: number;
  stunned: number;
  slowed: number;
  doomed: number;
  dying: number;
  wounded: number;
  fatigued: boolean;
  offGuard: boolean;
  prone: boolean;
  grabbed: boolean;
  restrained: boolean;
  immobilized: boolean;
  unconscious: boolean;
  dazzled: boolean;
  blinded: boolean;
  deafened: boolean;
  paralyzed: boolean;
  fascinated: boolean;
  concealed: boolean;
  hidden: boolean;
  invisible: boolean;
  quickened: boolean;
  persistent: string;
}

export interface AuraBonuses {
  attackStatus: number;
  attackCirc: number;
  damageStatus: number;
  saveStatus: number;
  acStatus: number;
}

export interface Skill {
  id: string;
  catalogId: string | null;
  name: string;
  ability: Ability;
  proficiency: Proficiency;
  armor: boolean;
  item: number;
  circumstance: number;
  misc: number;
}

export interface Strike {
  id: string;
  name: string;
  ranged: boolean;
  ability: Ability;
  finesse: boolean;
  agile: boolean;
  propulsive: boolean;
  thrown: boolean;
  traits: string;
  proficiency: Proficiency;
  potency: number;
  die: Die;
  striking: 0 | 1 | 2 | 3;
  damageType: string;
  damageAbility: DamageAbility;
  damageBonus: number;
  extraDamage: string;
  hands: string;
  range: string;
  notes: string;
}

export interface Feat {
  id: string;
  name: string;
  level: number | null;
  type: FeatType;
  traits: string;
  actionCost: ActionCost | "";
  description: string;
}

export interface ActionEntry {
  id: string;
  name: string;
  cost: ActionCost;
  traits: string;
  frequency: string;
  trigger: string;
  requirements: string;
  description: string;
}

export interface GearItem {
  id: string;
  name: string;
  qty: number;
  bulk: number;
  light: boolean;
  invested: boolean;
  worn: boolean;
  carried: boolean;
  price: string;
  notes: string;
}

export interface Spell {
  id: string;
  name: string;
  rank: number;
  actions: string;
  traits: string;
  defense: string;
  description: string;
  heightened: string;
  prepared: boolean;
  innateMax: number;
  innateLeft: number;
}

export interface SpellSlot {
  rank: number;
  max: number;
  left: number;
}

export interface Spellcasting {
  id: string;
  name: string;
  kind: SpellEntryKind;
  tradition: Tradition;
  ability: Ability;
  proficiency: Proficiency;
  itemBonus: number;
  slots: SpellSlot[];
  spells: Spell[];
}

export interface Ritual {
  id: string;
  name: string;
  rank: number;
  cost: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  player: string;
  level: number;
  xp: number;
  heroPoints: number;
  ancestry: string;
  heritage: string;
  background: string;
  className: string;
  subclass: string;
  size: Size;
  deity: string;
  keyAbility: Ability;
  abilities: Record<Ability, number>;
  ancestryHp: number;
  classHp: number;
  hpPerLevel: number;
  hpFlat: number;
  toughness: boolean;
  damageTaken: number;
  tempHp: number;
  dead: boolean;
  resistances: string;
  weaknesses: string;
  immunities: string;
  conditions: Conditions;
  aura: AuraBonuses;

  armorName: string;
  armorCategory: ArmorCategory;
  armorBonus: number;
  armorPotency: number;
  armorDexCap: number | null;
  armorCheck: number;
  armorSpeed: number;
  armorStr: number | null;
  armorProficiency: Proficiency;
  acCircumstance: number;
  acMisc: number;

  shieldName: string;
  shieldBonus: number;
  shieldRaised: boolean;
  shieldHardness: number;
  shieldMaxHp: number;
  shieldHp: number;
  shieldBroken: number;

  fortProf: Proficiency;
  refProf: Proficiency;
  willProf: Proficiency;
  resilient: number;
  fortMisc: number;
  refMisc: number;
  willMisc: number;
  fortCirc: number;
  refCirc: number;
  willCirc: number;

  perceptionProf: Proficiency;
  perceptionItem: number;
  perceptionCirc: number;
  perceptionMisc: number;

  classDcProf: Proficiency;
  classDcMisc: number;
  classDcCirc: number;

  speedBase: number;
  speedMisc: number;
  speeds: string;

  skills: Skill[];
  strikes: Strike[];
  feats: Feat[];
  actions: ActionEntry[];
  gear: GearItem[];
  spellcasting: Spellcasting[];
  rituals: Ritual[];
  focusMax: number;
  focusLeft: number;

  languages: string;
  ethnicity: string;
  nationality: string;
  birthplace: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  appearance: string;
  attitude: string;
  beliefs: string;
  edicts: string;
  anathema: string;
  likes: string;
  dislikes: string;
  catchphrase: string;
  allies: string;
  enemies: string;
  organizations: string;
  campaign: string;
  notes: string;

  coins: { cp: number; sp: number; gp: number; pp: number };
  coinsInBulk: boolean;
  updatedAt: number;
}

export interface Part {
  label: string;
  value: number;
}

export interface Breakdown {
  total: number;
  parts: Part[];
}
