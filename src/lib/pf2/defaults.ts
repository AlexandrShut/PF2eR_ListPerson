import { ANCESTRIES, ARMORS, CLASSES, SKILL_CATALOG, WEAPONS } from "@/lib/pf2/data";
import type {
  Ability,
  ActionEntry,
  Character,
  Conditions,
  Feat,
  GearItem,
  Proficiency,
  Ritual,
  Skill,
  Spell,
  Spellcasting,
  Strike,
} from "@/lib/pf2/types";

export const SAMPLE_ID = "sample-ilva";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

export function emptyConditions(): Conditions {
  return {
    frightened: 0,
    sickened: 0,
    clumsy: 0,
    enfeebled: 0,
    drained: 0,
    stupefied: 0,
    stunned: 0,
    slowed: 0,
    doomed: 0,
    dying: 0,
    wounded: 0,
    fatigued: false,
    offGuard: false,
    prone: false,
    grabbed: false,
    restrained: false,
    immobilized: false,
    unconscious: false,
    dazzled: false,
    blinded: false,
    deafened: false,
    paralyzed: false,
    fascinated: false,
    concealed: false,
    hidden: false,
    invisible: false,
    quickened: false,
    persistent: "",
  };
}

export function makeSkill(catalogId: string, proficiency: Proficiency = 0): Skill {
  const catalog = SKILL_CATALOG.find((item) => item.id === catalogId) ?? SKILL_CATALOG[0];
  return {
    id: uid(),
    catalogId: catalog.id,
    name: catalog.name,
    ability: catalog.ability,
    proficiency,
    armor: catalog.armor,
    item: 0,
    circumstance: 0,
    misc: 0,
  };
}

export function makeLore(name = "Знание"): Skill {
  return {
    id: uid(),
    catalogId: null,
    name,
    ability: "int",
    proficiency: 2,
    armor: false,
    item: 0,
    circumstance: 0,
    misc: 0,
  };
}

export function defaultSkills(): Skill[] {
  return SKILL_CATALOG.map((skill) => makeSkill(skill.id, 0));
}

export function makeStrike(partial: Partial<Strike> = {}): Strike {
  return {
    id: uid(),
    name: "Удар",
    ranged: false,
    ability: "str",
    finesse: false,
    agile: false,
    propulsive: false,
    thrown: false,
    traits: "",
    proficiency: 2,
    potency: 0,
    die: 8,
    striking: 0,
    damageType: "рубящий",
    damageAbility: "str",
    damageBonus: 0,
    extraDamage: "",
    hands: "1",
    range: "",
    notes: "",
    ...partial,
  };
}

export function strikeFromWeapon(index: number, proficiency: Proficiency): Strike {
  const weapon = WEAPONS[index] ?? WEAPONS[0];
  return makeStrike({
    name: weapon.name,
    ranged: Boolean(weapon.ranged),
    ability: weapon.ability ?? (weapon.ranged ? "dex" : "str"),
    finesse: Boolean(weapon.finesse),
    agile: Boolean(weapon.agile),
    propulsive: Boolean(weapon.propulsive),
    thrown: Boolean(weapon.thrown),
    traits: weapon.traits,
    proficiency,
    die: weapon.die,
    damageType: weapon.damage,
    damageAbility: weapon.damageAbility ?? (weapon.ranged ? "none" : "str"),
    hands: weapon.hands,
    range: weapon.range ?? "",
  });
}

export function makeFeat(partial: Partial<Feat> = {}): Feat {
  return {
    id: uid(),
    name: "",
    level: 1,
    type: "class",
    traits: "",
    actionCost: "",
    description: "",
    ...partial,
  };
}

export function makeAction(partial: Partial<ActionEntry> = {}): ActionEntry {
  return {
    id: uid(),
    name: "",
    cost: "1",
    traits: "",
    frequency: "",
    trigger: "",
    requirements: "",
    description: "",
    ...partial,
  };
}

export function makeGear(partial: Partial<GearItem> = {}): GearItem {
  return {
    id: uid(),
    name: "",
    qty: 1,
    bulk: 1,
    light: false,
    invested: false,
    worn: false,
    carried: true,
    price: "",
    notes: "",
    ...partial,
  };
}

export function makeSpell(partial: Partial<Spell> = {}): Spell {
  return {
    id: uid(),
    name: "",
    rank: 1,
    actions: "2",
    traits: "",
    defense: "",
    description: "",
    heightened: "",
    prepared: true,
    innateMax: 0,
    innateLeft: 0,
    ...partial,
  };
}

export function makeSpellcasting(partial: Partial<Spellcasting> = {}): Spellcasting {
  return {
    id: uid(),
    name: "Заклинания",
    kind: "prepared",
    tradition: "arcane",
    ability: "int",
    proficiency: 2,
    itemBonus: 0,
    slots: [],
    spells: [],
    ...partial,
  };
}

export function makeRitual(partial: Partial<Ritual> = {}): Ritual {
  return {
    id: uid(),
    name: "",
    rank: 1,
    cost: "",
    description: "",
    ...partial,
  };
}

export function blankCharacter(): Character {
  const human = ANCESTRIES.find((item) => item.id === "human")!;
  return {
    id: uid(),
    name: "Новый герой",
    player: "",
    level: 1,
    xp: 0,
    heroPoints: 1,
    ancestry: human.name,
    heritage: "",
    background: "",
    className: "",
    subclass: "",
    size: human.size,
    deity: "",
    keyAbility: "str",
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    ancestryHp: human.hp,
    classHp: 8,
    hpPerLevel: 0,
    hpFlat: 0,
    toughness: false,
    damageTaken: 0,
    tempHp: 0,
    dead: false,
    resistances: "",
    weaknesses: "",
    immunities: "",
    conditions: emptyConditions(),
    aura: { attackStatus: 0, attackCirc: 0, damageStatus: 0, saveStatus: 0, acStatus: 0 },
    armorName: "Без доспеха",
    armorCategory: "unarmored",
    armorBonus: 0,
    armorPotency: 0,
    armorDexCap: null,
    armorCheck: 0,
    armorSpeed: 0,
    armorStr: null,
    armorProficiency: 2,
    acCircumstance: 0,
    acMisc: 0,
    shieldName: "",
    shieldBonus: 0,
    shieldRaised: false,
    shieldHardness: 0,
    shieldMaxHp: 0,
    shieldHp: 0,
    shieldBroken: 0,
    fortProf: 2,
    refProf: 2,
    willProf: 2,
    resilient: 0,
    fortMisc: 0,
    refMisc: 0,
    willMisc: 0,
    fortCirc: 0,
    refCirc: 0,
    willCirc: 0,
    perceptionProf: 2,
    perceptionItem: 0,
    perceptionCirc: 0,
    perceptionMisc: 0,
    classDcProf: 2,
    classDcMisc: 0,
    classDcCirc: 0,
    speedBase: human.speed,
    speedMisc: 0,
    speeds: "",
    skills: defaultSkills(),
    strikes: [strikeFromWeapon(0, 2)],
    feats: [],
    actions: [],
    gear: [],
    spellcasting: [],
    rituals: [],
    focusMax: 0,
    focusLeft: 0,
    languages: "всеобщий",
    ethnicity: "",
    nationality: "",
    birthplace: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    appearance: "",
    attitude: "",
    beliefs: "",
    edicts: "",
    anathema: "",
    likes: "",
    dislikes: "",
    catchphrase: "",
    allies: "",
    enemies: "",
    organizations: "",
    campaign: "",
    notes: "",
    coins: { cp: 0, sp: 0, gp: 15, pp: 0 },
    coinsInBulk: false,
    updatedAt: Date.now(),
  };
}

function withSkill(skills: Skill[], catalogId: string, proficiency: Proficiency): Skill[] {
  return skills.map((skill) => (skill.catalogId === catalogId ? { ...skill, proficiency } : skill));
}

export function makeSample(): Character {
  const base = blankCharacter();
  const elf = ANCESTRIES.find((item) => item.id === "elf")!;
  const ranger = CLASSES.find((item) => item.id === "ranger")!;
  const leather = ARMORS.find((item) => item.id === "leather")!;
  let skills = defaultSkills();
  skills = withSkill(skills, "acrobatics", 2);
  skills = withSkill(skills, "athletics", 2);
  skills = withSkill(skills, "stealth", 4);
  skills = withSkill(skills, "survival", 4);
  skills = withSkill(skills, "nature", 2);
  skills = withSkill(skills, "medicine", 2);
  skills = [
    ...skills,
    { ...makeLore("Знание (леса)"), proficiency: 2 },
  ];

  const sword = makeStrike({
    name: "Длинный меч +1 разящий",
    ability: "str",
    traits: "универсальное на случай нужды — в базе меч без дескриптора",
    proficiency: 2,
    potency: 1,
    die: 8,
    striking: 1,
    damageType: "рубящий",
    damageAbility: "str",
    hands: "1",
    notes: "Основное оружие ближнего боя.",
  });
  const bow = makeStrike({
    name: "Короткий лук +1",
    ranged: true,
    ability: "dex",
    traits: "смертельное d10",
    proficiency: 2,
    potency: 1,
    die: 6,
    striking: 0,
    damageType: "колющий",
    damageAbility: "none",
    hands: "1+",
    range: "60 фт.",
    notes: "Дальность 60 футов. Смертельный эффект d10 — отдельный бросок при крите.",
  });

  return {
    ...base,
    id: SAMPLE_ID,
    name: "Илва Чернодрев",
    player: "",
    level: 5,
    xp: 240,
    heroPoints: 1,
    ancestry: elf.name,
    heritage: "Лесное наследие",
    background: "Охотник",
    className: ranger.name,
    subclass: "Кромка: точность",
    size: elf.size,
    deity: "",
    keyAbility: "dex",
    abilities: { str: 14, dex: 18, con: 12, int: 12, wis: 16, cha: 10 },
    ancestryHp: elf.hp,
    classHp: ranger.hp,
    perceptionProf: ranger.perception,
    fortProf: ranger.fort,
    refProf: ranger.ref,
    willProf: ranger.will,
    classDcProf: ranger.classDc,
    armorName: leather.name,
    armorCategory: leather.category,
    armorBonus: leather.bonus,
    armorDexCap: leather.dex,
    armorCheck: leather.check,
    armorSpeed: leather.speed,
    armorStr: leather.str,
    armorProficiency: ranger.armor.light,
    speedBase: elf.speed,
    speeds: "лазание — нет, плавание — нет",
    skills,
    strikes: [sword, bow],
    feats: [
      makeFeat({
        name: "Добыча",
        level: 1,
        type: "classfeature",
        actionCost: "1",
        traits: "следопыт",
        description:
          "Одно действие: выбираете существо, которое видите или по следам которого идёте. Пока оно добыча, вы лучше его выслеживаете, а кромка охотника даёт бонус против него. Смена добычи — тем же действием.",
      }),
      makeFeat({
        name: "Кромка охотника — точность",
        level: 1,
        type: "classfeature",
        traits: "следопыт",
        description:
          "Первый удар по текущей добыче за ход, если он успешен, наносит дополнительный урон точности: 1d8 на этом уровне. Урон точности приходит один раз за раунд и не умножается при крите.",
      }),
      makeFeat({
        name: "Эльфийский взгляд",
        level: 1,
        type: "ancestry",
        traits: "эльф",
        description:
          "Чутьё на детали: бонус обстоятельства к проверкам, чтобы заметить спрятанное или необычное в природе и среди толпы. Впишите точный бонус из своей книги, если берёте официальную черту.",
      }),
      makeFeat({
        name: "Разведчик троп",
        level: 1,
        type: "background",
        traits: "происхождение",
        description:
          "Вы читаете стоянку и следы. Один раз за сцену можно задать ведущему конкретный вопрос о том, кто недавно прошёл этим путём, и получить честный намёк без полного раскрытия тайны.",
      }),
      makeFeat({
        name: "Дальний выстрел",
        level: 2,
        type: "class",
        traits: "следопыт",
        description:
          "Штраф залпа у луков снижается, а шаги дистанции за пределом первой не так сильно портят удар. Отметьте в атаке лука, если ведёте залповое оружие.",
      }),
      makeFeat({
        name: "Тихий шаг",
        level: 2,
        type: "skill",
        traits: "скрытность",
        description:
          "Вы учитесь прятаться там, где укрытие так себе: можно попытаться Спрятаться, имея лишь меньшее укрытие или будучи скрытым, а не полностью за препятствием. Ведущий всё ещё вправе повысить СЛ.",
      }),
      makeFeat({
        name: "Крепкое здоровье",
        level: 3,
        type: "general",
        traits: "общая",
        description:
          "Тело держит удар лучше. На листе включена «крепость»: +1 пункт здоровья за каждый уровень. Выключите, если черта другая.",
      }),
      makeFeat({
        name: "Природная медицина",
        level: 4,
        type: "skill",
        traits: "природа",
        description:
          "Можно Лечить раны и оказывать первую помощь через Природу вместо Медицины — травы, мох, знание зверя. В проверке просто бросайте Природу.",
      }),
    ],
    actions: [
      makeAction({
        name: "Охота на добычу",
        cost: "1",
        traits: "следопыт, концентрация",
        frequency: "",
        requirements: "Вы видите цель или идёте по её следам",
        description:
          "Назначаете существо своей добычей. Против него работает кромка, а проверки Выживания, чтобы выследить именно его, получают ваш охотничий бонус. Одновременно добыча одна, если черта не говорит иначе.",
      }),
      makeAction({
        name: "Спрятаться",
        cost: "1",
        traits: "скрытность",
        requirements: "Есть укрытие или вы уже скрыты",
        description:
          "Проверка Скрытности против СЛ Восприятия наблюдателей. Успех — вы спрятаны от них. Помните штраф доспеха, если Силы не хватает на порог брони.",
      }),
      makeAction({
        name: "Первая помощь",
        cost: "2",
        traits: "медицина, манипуляция",
        requirements: "Набор лекаря",
        description:
          "Стабилизировать умирающего: Медицина против СЛ 15 + значение состояния «умирает» (обычно) или СЛ восстановления, как договоритесь за столом. Успех снимает умирание. Можно остановить кровотечение той же проверкой.",
      }),
      makeAction({
        name: "Лечить раны",
        cost: "free",
        traits: "медицина, исследование",
        frequency: "Раз в час на каждую цель",
        description:
          "10 минут и набор лекаря. Медицина СЛ 15 на этом уровне. Успех лечит 2d8, крит — 4d8. Провал ранит пациента на 1d8. Это занятие исследования, не удар в раунде.",
      }),
      makeAction({
        name: "Уклонение",
        cost: "reaction",
        traits: "удача",
        trigger: "Вас только что ударили атакой или вы провалили спасбросок",
        frequency: "Если есть пункт героизма",
        description:
          "Потратьте 1 пункт героизма, чтобы перебросить проверку, или все оставшиеся — чтобы не умереть, когда значение «умирает» вот-вот вас добьёт. Кнопка героического спасения есть на вкладке «Бой».",
      }),
    ],
    gear: [
      makeGear({ name: "Кожаный доспех", bulk: 1, worn: true, invested: false, price: "2 зм" }),
      makeGear({ name: "Длинный меч +1 разящий", bulk: 1, worn: true, invested: true, price: "" }),
      makeGear({ name: "Короткий лук +1", bulk: 1, worn: true, invested: true, price: "" }),
      makeGear({ name: "Стрелы", qty: 20, bulk: 0, light: true, worn: true, notes: "Колчан" }),
      makeGear({ name: "Набор лекаря", bulk: 1, worn: true, price: "5 зм" }),
      makeGear({ name: "Верёвка, 50 футов", bulk: 1, light: false, price: "" }),
      makeGear({ name: "Спальник", bulk: 0, light: true }),
      makeGear({ name: "Паёк", qty: 4, bulk: 0, light: true }),
      makeGear({ name: "Рюкзак", bulk: 0, light: true, worn: true, notes: "Первый рюкзак сам почти ничего не весит" }),
    ],
    spellcasting: [
      makeSpellcasting({
        name: "Заклинания стража",
        kind: "focus",
        tradition: "primal",
        ability: "wis",
        proficiency: 2,
        spells: [
          makeSpell({
            name: "Успокаивающий мох",
            rank: 0,
            actions: "1",
            traits: "фокус, первобытное, исцеление",
            defense: "",
            prepared: true,
            description:
              "Фокус стража: касание и мягкий мох закрывают рану. Лечит немного — впишите кости из описания вашей книги (часто 1d4 или 1d8, усиленные до половины уровня). Тратит 1 пункт фокуса.",
            heightened: "Усиливается до половины уровня, округляя вверх.",
          }),
        ],
      }),
    ],
    rituals: [],
    focusMax: 1,
    focusLeft: 1,
    toughness: true,
    languages: "всеобщий, эльфийский, сильван",
    age: "126",
    gender: "женщина",
    height: "5′9″",
    weight: "130 фунтов",
    appearance: "Смуглая, с коротким чёрным каре и шрамом поперёк брови. Плащ цвета хвои, лук всегда на плече.",
    attitude: "Говорит мало и по делу. К чужим присматривается, к своим — прикрывает спину без лишних слов.",
    beliefs: "Лес кормит тех, кто не берёт лишнего.",
    edicts: "Не оставлять раненого спутника. Читать следы, прежде чем идти в чащу.",
    anathema: "Жечь лес ради забавы. Бросать добычу гнить без нужды.",
    likes: "Дождь, чай из иголок, тишина перед рассветом.",
    dislikes: "Городской шум, пустые хвастуны, клетки.",
    catchphrase: "Сначала следы. Потом сталь.",
    allies: "Отряд, с которым вышла из Андорана.",
    enemies: "Браконьеры Чёрной просеки.",
    organizations: "",
    campaign: "Ищем того, кто травит ручьи к северу от тракта.",
    notes: "Пример листа. Все цифры считаются из характеристик, уровня и обученности — поправьте любое поле, и итог обновится.",
    coins: { cp: 12, sp: 8, gp: 22, pp: 0 },
    updatedAt: Date.now(),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function num(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeCharacter(raw: unknown): Character | null {
  const data = asRecord(raw);
  if (typeof data.name !== "string" && !data.abilities) return null;
  const base = blankCharacter();
  const abilities = asRecord(data.abilities);
  const conditions = asRecord(data.conditions);
  const coins = asRecord(data.coins);
  const aura = asRecord(data.aura);
  const next: Character = {
    ...base,
    ...(data as unknown as Character),
    id: typeof data.id === "string" && data.id ? data.id : uid(),
    abilities: {
      str: num(abilities.str, 10),
      dex: num(abilities.dex, 10),
      con: num(abilities.con, 10),
      int: num(abilities.int, 10),
      wis: num(abilities.wis, 10),
      cha: num(abilities.cha, 10),
    },
    conditions: { ...emptyConditions(), ...(conditions as unknown as Conditions) },
    coins: {
      cp: num(coins.cp, 0),
      sp: num(coins.sp, 0),
      gp: num(coins.gp, 0),
      pp: num(coins.pp, 0),
    },
    aura: {
      attackStatus: num(aura.attackStatus, 0),
      attackCirc: num(aura.attackCirc, 0),
      damageStatus: num(aura.damageStatus, 0),
      saveStatus: num(aura.saveStatus, 0),
      acStatus: num(aura.acStatus, 0),
    },
    skills: Array.isArray(data.skills) ? (data.skills as Skill[]) : base.skills,
    strikes: Array.isArray(data.strikes) ? (data.strikes as Strike[]) : base.strikes,
    feats: Array.isArray(data.feats) ? (data.feats as Feat[]) : [],
    actions: Array.isArray(data.actions) ? (data.actions as ActionEntry[]) : [],
    gear: Array.isArray(data.gear) ? (data.gear as GearItem[]) : [],
    spellcasting: Array.isArray(data.spellcasting) ? (data.spellcasting as Spellcasting[]) : [],
    rituals: Array.isArray(data.rituals) ? (data.rituals as Ritual[]) : [],
    level: Math.min(20, Math.max(1, num(data.level, 1))),
    updatedAt: num(data.updatedAt, Date.now()),
  };
  if (!next.name) next.name = "Безымянный";
  return next;
}

export function applyAncestry(c: Character, ancestryId: string): Character {
  const ancestry = ANCESTRIES.find((item) => item.id === ancestryId);
  if (!ancestry) return c;
  return {
    ...c,
    ancestry: ancestry.name,
    ancestryHp: ancestry.hp,
    speedBase: ancestry.speed,
    size: ancestry.size,
    updatedAt: Date.now(),
  };
}

export function applyClassStats(c: Character, classId: string, profs: boolean): Character {
  const klass = CLASSES.find((item) => item.id === classId);
  if (!klass) return c;
  const next: Character = {
    ...c,
    className: klass.name,
    classHp: klass.hp,
    keyAbility: klass.key,
    updatedAt: Date.now(),
  };
  if (!profs) return next;
  return {
    ...next,
    perceptionProf: klass.perception,
    fortProf: klass.fort,
    refProf: klass.ref,
    willProf: klass.will,
    classDcProf: klass.classDc,
    armorProficiency: klass.armor[c.armorCategory],
  };
}

export function applyArmor(c: Character, armorId: string): Character {
  const armor = ARMORS.find((item) => item.id === armorId);
  if (!armor) return c;
  return {
    ...c,
    armorName: armor.name,
    armorCategory: armor.category,
    armorBonus: armor.bonus,
    armorDexCap: armor.dex,
    armorCheck: armor.check,
    armorSpeed: armor.speed,
    armorStr: armor.str,
    updatedAt: Date.now(),
  };
}

export const KEY_ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];
