import { deathThreshold, degreeOfSuccess, maxHp, type Degree } from "@/lib/pf2/calc";
import type { Character } from "@/lib/pf2/types";

function touch(c: Character): Character {
  return { ...c, updatedAt: Date.now() };
}

export function setNumberField<K extends keyof Character>(c: Character, key: K, value: Character[K]): Character {
  return touch({ ...c, [key]: value });
}

export function adjustTemp(c: Character, delta: number): Character {
  return touch({ ...c, tempHp: Math.max(0, c.tempHp + delta) });
}

function gainDying(c: Character, base: number): Character {
  let dying = base;
  if (c.conditions.wounded > 0) dying += c.conditions.wounded;
  return finishDying(c, dying);
}

function finishDying(c: Character, dying: number): Character {
  const cap = deathThreshold(c);
  if (cap <= 0 || dying >= cap) {
    return touch({
      ...c,
      dead: true,
      damageTaken: Math.max(c.damageTaken, maxHp(c)),
      conditions: { ...c.conditions, dying: Math.max(cap, dying), unconscious: true },
    });
  }
  return touch({
    ...c,
    dead: false,
    conditions: { ...c.conditions, dying, unconscious: true },
  });
}

function loseDying(c: Character, heroic: boolean): Character {
  const had = c.conditions.dying > 0;
  let wounded = c.conditions.wounded;
  if (had && !heroic) wounded = wounded > 0 ? wounded + 1 : 1;
  const aliveHp = maxHp(c) - c.damageTaken > 0;
  return touch({
    ...c,
    dead: false,
    conditions: {
      ...c.conditions,
      dying: 0,
      wounded,
      unconscious: aliveHp ? false : true,
    },
  });
}

export function applyDamage(c: Character, amount: number, crit = false): Character {
  const hit = Math.max(0, Math.round(amount));
  if (hit <= 0 || c.dead) return c;
  let temp = c.tempHp;
  let left = hit;
  if (temp > 0) {
    const soaked = Math.min(temp, left);
    temp -= soaked;
    left -= soaked;
  }
  const max = maxHp({ ...c, tempHp: temp });
  const before = Math.max(0, max - c.damageTaken);
  let damageTaken = c.damageTaken + left;
  if (damageTaken > max) damageTaken = max;
  let next: Character = touch({ ...c, tempHp: temp, damageTaken });
  const after = Math.max(0, max - damageTaken);
  if (left <= 0) return next;
  if (next.conditions.dying > 0) {
    return finishDying(next, next.conditions.dying + (crit ? 2 : 1));
  }
  if (before > 0 && after === 0) return gainDying(next, crit ? 2 : 1);
  if (before === 0 && after === 0) return gainDying(next, crit ? 2 : 1);
  return next;
}

export function applyHeal(c: Character, amount: number): Character {
  const heal = Math.max(0, Math.round(amount));
  if (heal <= 0) return c;
  const damageTaken = Math.max(0, c.damageTaken - heal);
  let next = touch({ ...c, damageTaken, dead: false });
  const hp = maxHp(next) - damageTaken;
  if (hp > 0 && (next.conditions.dying > 0 || next.conditions.unconscious)) {
    if (next.conditions.dying > 0) next = loseDying(next, false);
    else next = touch({ ...next, conditions: { ...next.conditions, unconscious: false } });
  }
  return next;
}

export function applyRecovery(c: Character, natural: number): { next: Character; degree: Degree; dc: number } {
  const dc = 10 + c.conditions.dying;
  const degree = degreeOfSuccess(natural, natural, dc);
  const delta = degree === "crit-success" ? -2 : degree === "success" ? -1 : degree === "crit-failure" ? 2 : 1;
  let dying = c.conditions.dying + delta;
  let next = c;
  if (dying <= 0) next = loseDying(c, false);
  else next = finishDying(c, dying);
  return { next, degree, dc };
}

export function heroicRecovery(c: Character): Character {
  if (c.heroPoints < 1 || c.conditions.dying <= 0) return c;
  const next = loseDying({ ...c, heroPoints: 0 }, true);
  return touch({
    ...next,
    heroPoints: 0,
    conditions: { ...next.conditions, unconscious: maxHp(next) - next.damageTaken <= 0 },
  });
}

export function restTenMinutes(c: Character): Character {
  const full = maxHp(c) - c.damageTaken >= maxHp(c) && c.damageTaken === 0;
  if (!full) return c;
  return touch({ ...c, conditions: { ...c.conditions, wounded: 0 } });
}

export function clearWounded(c: Character): Character {
  return touch({ ...c, conditions: { ...c.conditions, wounded: 0 } });
}

export function nightRest(c: Character): Character {
  return touch({
    ...c,
    conditions: { ...c.conditions, doomed: Math.max(0, c.conditions.doomed - 1) },
  });
}

export function revive(c: Character): Character {
  const max = maxHp(c);
  return touch({
    ...c,
    dead: false,
    damageTaken: Math.max(0, max - 1),
    conditions: { ...c.conditions, dying: 0, unconscious: false },
  });
}

export function refocus(c: Character, all: boolean): Character {
  const focusLeft = all ? c.focusMax : Math.min(c.focusMax, c.focusLeft + 1);
  return touch({ ...c, focusLeft });
}
