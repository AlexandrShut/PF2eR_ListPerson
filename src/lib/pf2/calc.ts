import { abilityShort, profLabel } from "@/lib/pf2/data";
import type {
  Ability,
  Breakdown,
  Character,
  DamageAbility,
  Part,
  Proficiency,
  Skill,
  Spellcasting,
  Strike,
} from "@/lib/pf2/types";

export function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function profBonus(rank: Proficiency, level: number): number {
  if (rank <= 0) return 0;
  return level + rank;
}

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n > 0 ? `+${n}` : `${n}`;
}

export function totalOf(parts: Part[]): number {
  return parts.reduce((sum, part) => sum + part.value, 0);
}

function pack(parts: Part[]): Breakdown {
  return { total: totalOf(parts), parts };
}

export function deathThreshold(c: Character): number {
  return Math.max(0, 4 - Math.max(0, c.conditions.doomed));
}

export function maxHp(c: Character): number {
  const con = abilityMod(c.abilities.con);
  const per = c.classHp + con + c.hpPerLevel + (c.toughness ? 1 : 0);
  const raw = c.ancestryHp + per * c.level + c.hpFlat;
  return Math.max(0, raw - c.conditions.drained * c.level);
}

export function currentHp(c: Character): number {
  return Math.max(0, maxHp(c) - Math.max(0, c.damageTaken));
}

export interface BulkResult {
  total: number;
  encThreshold: number;
  maxThreshold: number;
  state: "ok" | "encumbered" | "over";
  label: string;
}

export function bulkOf(c: Character): BulkResult {
  let tenths = 0;
  for (const item of c.gear) {
    if (!item.carried) continue;
    const qty = Math.max(0, item.qty || 0);
    if (item.light) tenths += qty;
    else tenths += Math.round((item.bulk || 0) * 10) * qty;
  }
  if (c.coinsInBulk) {
    const coins = c.coins.cp + c.coins.sp + c.coins.gp + c.coins.pp;
    tenths += Math.floor(coins / 1000) * 10;
  }
  const total = tenths / 10;
  const str = abilityMod(c.abilities.str);
  const encThreshold = Math.max(0, 5 + str);
  const maxThreshold = Math.max(encThreshold, 10 + str);
  const state: BulkResult["state"] =
    total > maxThreshold ? "over" : total > encThreshold ? "encumbered" : "ok";
  const label = state === "over" ? "Перегруз" : state === "encumbered" ? "Нагружен" : "Свободно";
  return { total, encThreshold, maxThreshold, state, label };
}

export function isEncumbered(c: Character): boolean {
  return bulkOf(c).state !== "ok";
}

export function effectiveClumsy(c: Character): number {
  return Math.max(0, c.conditions.clumsy, isEncumbered(c) ? 1 : 0);
}

function meetsArmorStr(c: Character): boolean {
  if (c.armorStr == null) return true;
  return abilityMod(c.abilities.str) >= c.armorStr;
}

export function armorCheckPenalty(c: Character): number {
  if (c.armorCheck <= 0 || meetsArmorStr(c)) return 0;
  return -Math.abs(c.armorCheck);
}

export function armorSpeedPenalty(c: Character): number {
  let penalty = Math.max(0, c.armorSpeed);
  if (meetsArmorStr(c)) penalty = Math.max(0, penalty - 5);
  return penalty;
}

type StatusSpec = {
  checks: boolean;
  ability?: Ability | null;
  save?: "fort" | "ref" | "will" | null;
  ac?: boolean;
  spell?: boolean;
  perception?: boolean;
  classDc?: boolean;
  damage?: boolean;
  damageFrom?: DamageAbility | null;
};

function worstStatus(c: Character, spec: StatusSpec): { value: number; label: string } {
  const found: { value: number; label: string }[] = [];
  const add = (amount: number, label: string) => {
    if (amount > 0) found.push({ value: -amount, label });
  };

  if (spec.checks) {
    add(c.conditions.frightened, "испуг");
    add(c.conditions.sickened, "тошнота");
  }
  if (spec.ac || spec.save) {
    if (c.conditions.fatigued) add(1, "усталость");
  }

  const dexBased =
    spec.ability === "dex" || spec.ac || spec.save === "ref" || (spec.damage && spec.damageFrom === "dex");
  if (dexBased && !spec.damage) add(effectiveClumsy(c), isEncumbered(c) && c.conditions.clumsy < 1 ? "нагрузка" : "неуклюжесть");

  const strBased =
    spec.ability === "str" ||
    (spec.damage && (spec.damageFrom === "str" || spec.damageFrom === "halfstr"));
  if (strBased) add(c.conditions.enfeebled, "ослабление");

  if (spec.save === "fort" || spec.ability === "con") add(c.conditions.drained, "истощение");

  const mental =
    spec.spell ||
    spec.perception ||
    spec.ability === "int" ||
    spec.ability === "wis" ||
    spec.ability === "cha" ||
    spec.save === "will" ||
    (spec.classDc && (c.keyAbility === "int" || c.keyAbility === "wis" || c.keyAbility === "cha"));
  if (mental && spec.checks) add(c.conditions.stupefied, "одурман");

  if (found.length === 0) return { value: 0, label: "" };
  const worst = found.reduce((best, item) => (item.value < best.value ? item : best));
  const labels = found.filter((item) => item.value === worst.value).map((item) => item.label);
  return { value: worst.value, label: labels[0] ?? "" };
}

function typed(bonuses: number[], penalties: number[]): { bonus: number; penalty: number } {
  return {
    bonus: bonuses.reduce((best, value) => Math.max(best, value), 0),
    penalty: penalties.reduce((worst, value) => Math.min(worst, value), 0),
  };
}

export function isOffGuard(c: Character): boolean {
  const k = c.conditions;
  return k.offGuard || k.prone || k.grabbed || k.restrained || k.blinded || k.paralyzed || k.unconscious;
}

export function shieldBrokenNow(c: Character): boolean {
  return c.shieldMaxHp > 0 && c.shieldHp <= c.shieldBroken;
}

export function shieldAcBonus(c: Character): number {
  if (!c.shieldRaised || shieldBrokenNow(c) || c.shieldBonus <= 0) return 0;
  return c.shieldBonus;
}

export function acBreakdown(c: Character): Breakdown & { shielded: number } {
  const dex = abilityMod(c.abilities.dex);
  const dexUsed = c.armorDexCap == null ? dex : Math.min(dex, c.armorDexCap);
  const prof = profBonus(c.armorProficiency, c.level);
  const item = c.armorBonus + c.armorPotency;
  const status = worstStatus(c, { checks: true, ac: true, ability: "dex" });
  const statusBonus = Math.max(0, c.aura.acStatus);
  const circManual = c.acCircumstance;
  const circ = typed(
    [shieldAcBonus(c), circManual > 0 ? circManual : 0],
    [isOffGuard(c) ? -2 : 0, circManual < 0 ? circManual : 0],
  );
  const parts: Part[] = [
    { label: "база", value: 10 },
    { label: `Лов ${fmt(dexUsed)}${c.armorDexCap != null && dex > c.armorDexCap ? " (потолок)" : ""}`, value: dexUsed },
    { label: profLabel(c.armorProficiency).toLowerCase(), value: prof },
  ];
  if (item) parts.push({ label: "доспех", value: item });
  if (statusBonus) parts.push({ label: "статус", value: statusBonus });
  if (status.value) parts.push({ label: status.label, value: status.value });
  if (circ.bonus) {
    const fromShield = shieldAcBonus(c) > 0 && circ.bonus === shieldAcBonus(c) && circManual <= shieldAcBonus(c);
    parts.push({ label: fromShield ? "щит" : "обстоятельство", value: circ.bonus });
  }
  if (circ.penalty) parts.push({ label: isOffGuard(c) ? "врасплох" : "обстоятельство", value: circ.penalty });
  if (c.acMisc) parts.push({ label: "прочее", value: c.acMisc });
  const normal = pack(parts);
  return { ...normal, shielded: normal.total };
}

export function saveBreakdown(c: Character, save: "fort" | "ref" | "will"): Breakdown {
  const ability: Ability = save === "fort" ? "con" : save === "ref" ? "dex" : "wis";
  const mod = abilityMod(c.abilities[ability]);
  const rank = save === "fort" ? c.fortProf : save === "ref" ? c.refProf : c.willProf;
  const misc = save === "fort" ? c.fortMisc : save === "ref" ? c.refMisc : c.willMisc;
  const circManual = save === "fort" ? c.fortCirc : save === "ref" ? c.refCirc : c.willCirc;
  const prof = profBonus(rank, c.level);
  const status = worstStatus(c, { checks: true, save, ability });
  const statusBonus = Math.max(0, c.aura.saveStatus);
  const circ = typed([circManual > 0 ? circManual : 0], [circManual < 0 ? circManual : 0]);
  const parts: Part[] = [
    { label: abilityShort(ability), value: mod },
    { label: profLabel(rank).toLowerCase(), value: prof },
  ];
  if (c.resilient) parts.push({ label: "устойчивость", value: c.resilient });
  if (statusBonus) parts.push({ label: "статус", value: statusBonus });
  if (status.value) parts.push({ label: status.label, value: status.value });
  if (circ.bonus) parts.push({ label: "обстоятельство", value: circ.bonus });
  if (circ.penalty) parts.push({ label: "обстоятельство", value: circ.penalty });
  if (misc) parts.push({ label: "прочее", value: misc });
  return pack(parts);
}

export function perceptionBreakdown(c: Character): Breakdown {
  const mod = abilityMod(c.abilities.wis);
  const prof = profBonus(c.perceptionProf, c.level);
  const status = worstStatus(c, { checks: true, perception: true, ability: "wis" });
  const circ = typed(
    [c.perceptionCirc > 0 ? c.perceptionCirc : 0],
    [c.perceptionCirc < 0 ? c.perceptionCirc : 0],
  );
  const parts: Part[] = [
    { label: "Мдр", value: mod },
    { label: profLabel(c.perceptionProf).toLowerCase(), value: prof },
  ];
  if (c.perceptionItem) parts.push({ label: "предмет", value: c.perceptionItem });
  if (status.value) parts.push({ label: status.label, value: status.value });
  if (circ.bonus || circ.penalty) parts.push({ label: "обстоятельство", value: circ.bonus + circ.penalty });
  if (c.perceptionMisc) parts.push({ label: "прочее", value: c.perceptionMisc });
  return pack(parts);
}

export function classDcBreakdown(c: Character): Breakdown {
  const mod = abilityMod(c.abilities[c.keyAbility]);
  const prof = profBonus(c.classDcProf, c.level);
  const status = worstStatus(c, { checks: true, classDc: true, ability: c.keyAbility });
  const circ = typed([c.classDcCirc > 0 ? c.classDcCirc : 0], [c.classDcCirc < 0 ? c.classDcCirc : 0]);
  const parts: Part[] = [
    { label: "база", value: 10 },
    { label: abilityShort(c.keyAbility), value: mod },
    { label: profLabel(c.classDcProf).toLowerCase(), value: prof },
  ];
  if (status.value) parts.push({ label: status.label, value: status.value });
  if (circ.bonus || circ.penalty) parts.push({ label: "обстоятельство", value: circ.bonus + circ.penalty });
  if (c.classDcMisc) parts.push({ label: "прочее", value: c.classDcMisc });
  return pack(parts);
}

export function skillBreakdown(c: Character, skill: Skill): Breakdown {
  const mod = abilityMod(c.abilities[skill.ability]);
  const prof = profBonus(skill.proficiency, c.level);
  const status = worstStatus(c, { checks: true, ability: skill.ability });
  const armor = skill.armor ? armorCheckPenalty(c) : 0;
  const circ = typed(
    [skill.circumstance > 0 ? skill.circumstance : 0],
    [skill.circumstance < 0 ? skill.circumstance : 0],
  );
  const parts: Part[] = [
    { label: abilityShort(skill.ability), value: mod },
    { label: profLabel(skill.proficiency).toLowerCase(), value: prof },
  ];
  if (skill.item) parts.push({ label: "предмет", value: skill.item });
  if (status.value) parts.push({ label: status.label, value: status.value });
  if (circ.bonus || circ.penalty) parts.push({ label: "обстоятельство", value: circ.bonus + circ.penalty });
  if (armor) parts.push({ label: "штраф доспеха", value: armor });
  if (skill.misc) parts.push({ label: "прочее", value: skill.misc });
  return pack(parts);
}

export function strikeAttackAbility(c: Character, strike: Strike): Ability {
  if (!strike.ranged && strike.finesse) {
    const str = abilityMod(c.abilities.str);
    const dex = abilityMod(c.abilities.dex);
    if (dex > str) return "dex";
  }
  return strike.ability;
}

export function strikeAttack(c: Character, strike: Strike, map = 0): Breakdown {
  const ability = strikeAttackAbility(c, strike);
  const mod = abilityMod(c.abilities[ability]);
  const prof = profBonus(strike.proficiency, c.level);
  const status = worstStatus(c, { checks: true, ability });
  const statusBonus = Math.max(0, c.aura.attackStatus);
  const prone = !strike.ranged && c.conditions.prone ? -2 : 0;
  const circ = typed(
    [c.aura.attackCirc > 0 ? c.aura.attackCirc : 0],
    [c.aura.attackCirc < 0 ? c.aura.attackCirc : 0, prone],
  );
  const parts: Part[] = [
    { label: abilityShort(ability), value: mod },
    { label: profLabel(strike.proficiency).toLowerCase(), value: prof },
  ];
  if (strike.potency) parts.push({ label: "потенция", value: strike.potency });
  if (statusBonus) parts.push({ label: "статус", value: statusBonus });
  if (status.value) parts.push({ label: status.label, value: status.value });
  if (circ.bonus) parts.push({ label: "обстоятельство", value: circ.bonus });
  if (circ.penalty) parts.push({ label: prone && circ.penalty === prone ? "ничком" : "обстоятельство", value: circ.penalty });
  if (map) parts.push({ label: "штраф серии", value: map });
  return pack(parts);
}

export function mapSteps(strike: Strike): [number, number, number] {
  return strike.agile ? [0, -4, -8] : [0, -5, -10];
}

export function damageAbilityMod(c: Character, mode: DamageAbility): number {
  const str = abilityMod(c.abilities.str);
  if (mode === "str") return str;
  if (mode === "dex") return abilityMod(c.abilities.dex);
  if (mode === "halfstr") return str >= 0 ? Math.floor(str / 2) : str;
  return 0;
}

export function strikeDamage(c: Character, strike: Strike): { formula: string; flat: number; dice: number; die: number; extra: string } {
  const dice = 1 + strike.striking;
  const fromAbility = damageAbilityMod(c, strike.damageAbility);
  const status = worstStatus(c, {
    checks: false,
    damage: true,
    damageFrom: strike.damageAbility,
    ability: strike.damageAbility === "dex" ? "dex" : strike.damageAbility === "none" ? null : "str",
  });
  const statusBonus = Math.max(0, c.aura.damageStatus);
  const flat = fromAbility + strike.damageBonus + status.value + statusBonus;
  const sign = flat === 0 ? "" : fmt(flat);
  const formula = `${dice}d${strike.die}${sign}`;
  return { formula, flat, dice, die: strike.die, extra: strike.extraDamage.trim() };
}

export function spellAttack(c: Character, entry: Spellcasting): Breakdown {
  const mod = abilityMod(c.abilities[entry.ability]);
  const prof = profBonus(entry.proficiency, c.level);
  const status = worstStatus(c, { checks: true, spell: true, ability: entry.ability });
  const parts: Part[] = [
    { label: abilityShort(entry.ability), value: mod },
    { label: profLabel(entry.proficiency).toLowerCase(), value: prof },
  ];
  if (entry.itemBonus) parts.push({ label: "предмет", value: entry.itemBonus });
  if (c.aura.attackStatus) parts.push({ label: "статус", value: c.aura.attackStatus });
  if (status.value) parts.push({ label: status.label, value: status.value });
  return pack(parts);
}

export function spellDc(c: Character, entry: Spellcasting): Breakdown {
  const attack = spellAttack(c, entry);
  return pack([{ label: "база", value: 10 }, ...attack.parts]);
}

export function speedOf(c: Character): { total: number; parts: Part[]; stuck: boolean } {
  const armor = armorSpeedPenalty(c);
  const enc = isEncumbered(c) ? 10 : 0;
  const stuck =
    c.conditions.immobilized ||
    c.conditions.restrained ||
    c.conditions.paralyzed ||
    c.conditions.unconscious ||
    c.conditions.dying > 0;
  const parts: Part[] = [{ label: "база", value: c.speedBase }];
  if (c.speedMisc) parts.push({ label: "прочее", value: c.speedMisc });
  if (armor) parts.push({ label: "доспех", value: -armor });
  if (enc) parts.push({ label: "нагрузка", value: -enc });
  const total = Math.max(0, totalOf(parts));
  return { total: stuck ? 0 : total, parts, stuck };
}

export function cantripRank(level: number): number {
  return Math.max(1, Math.ceil(level / 2));
}

export function investedCount(c: Character): number {
  return c.gear.filter((item) => item.invested && item.carried).length;
}

export type Degree = "crit-success" | "success" | "failure" | "crit-failure";

export function degreeOfSuccess(natural: number, total: number, dc: number): Degree {
  let step = 1;
  if (total >= dc + 10) step = 3;
  else if (total >= dc) step = 2;
  else if (total <= dc - 10) step = 0;
  if (natural === 20) step = Math.min(3, step + 1);
  if (natural === 1) step = Math.max(0, step - 1);
  return (["crit-failure", "failure", "success", "crit-success"] as const)[step] ?? "failure";
}

export const DEGREE_LABEL: Record<Degree, string> = {
  "crit-success": "Критический успех",
  success: "Успех",
  failure: "Провал",
  "crit-failure": "Критический провал",
};

export function formatParts(parts: Part[]): string {
  return parts
    .filter((part) => part.value !== 0 || part.label === "база")
    .map((part) => `${part.label} ${fmt(part.value)}`)
    .join(" · ");
}

export function hpFormula(c: Character): string {
  const con = abilityMod(c.abilities.con);
  const tough = c.toughness ? 1 : 0;
  const per = c.classHp + con + c.hpPerLevel + tough;
  const drained = c.conditions.drained * c.level;
  return `${c.ancestryHp} народа + (${c.classHp} класса ${fmt(con)} Вын${c.hpPerLevel ? ` ${fmt(c.hpPerLevel)}` : ""}${tough ? " +1 крепость" : ""}) × ${c.level}${c.hpFlat ? ` ${fmt(c.hpFlat)}` : ""}${drained ? ` − ${drained} истощение` : ""}`;
}
