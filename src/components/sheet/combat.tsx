import { useState } from "react";
import {
  abilityMod,
  acBreakdown,
  bulkOf,
  classDcBreakdown,
  currentHp,
  deathThreshold,
  fmt,
  hpFormula,
  maxHp,
  perceptionBreakdown,
  saveBreakdown,
  speedOf,
} from "@/lib/pf2/calc";
import {
  ABILITIES,
  ANCESTRIES,
  ARMORS,
  ARMOR_CATEGORIES,
  CLASSES,
  levelReminders,
  SIZES,
} from "@/lib/pf2/data";
import { applyAncestry, applyArmor, applyClassStats } from "@/lib/pf2/defaults";
import {
  applyDamage,
  applyHeal,
  applyRecovery,
  clearWounded,
  heroicRecovery,
  nightRest,
  restTenMinutes,
  revive,
} from "@/lib/pf2/mutate";
import type { Ability, Character, Proficiency } from "@/lib/pf2/types";
import { DEGREE_LABEL } from "@/lib/pf2/calc";
import {
  Btn,
  NullableNum,
  NumField,
  Parts,
  RankButton,
  Section,
  SelectField,
  StatButton,
  TextField,
  Toggle,
  type Patch,
} from "@/components/sheet/bits";
import { useRoll } from "@/components/sheet/roller";

const FLAGS: { key: keyof Character["conditions"]; label: string; math?: boolean }[] = [
  { key: "fatigued", label: "Усталость", math: true },
  { key: "offGuard", label: "Врасплох", math: true },
  { key: "prone", label: "Ничком", math: true },
  { key: "grabbed", label: "Схвачен", math: true },
  { key: "restrained", label: "Скован", math: true },
  { key: "blinded", label: "Слепота", math: true },
  { key: "paralyzed", label: "Паралич", math: true },
  { key: "immobilized", label: "Обездвижен", math: true },
  { key: "unconscious", label: "Без сознания", math: true },
  { key: "dazzled", label: "Ослеплён бликом" },
  { key: "deafened", label: "Глухота" },
  { key: "fascinated", label: "Очарован" },
  { key: "concealed", label: "Скрыт" },
  { key: "hidden", label: "Спрятан" },
  { key: "invisible", label: "Невидим" },
  { key: "quickened", label: "Ускорен" },
];

const VALUES: { key: "frightened" | "sickened" | "clumsy" | "enfeebled" | "drained" | "stupefied" | "stunned" | "slowed"; label: string; max: number }[] = [
  { key: "frightened", label: "Испуган", max: 4 },
  { key: "sickened", label: "Тошнота", max: 4 },
  { key: "clumsy", label: "Неуклюжесть", max: 4 },
  { key: "enfeebled", label: "Ослабление", max: 4 },
  { key: "drained", label: "Истощение", max: 4 },
  { key: "stupefied", label: "Одурман", max: 4 },
  { key: "stunned", label: "Ошеломлён", max: 4 },
  { key: "slowed", label: "Замедлен", max: 3 },
];

export function Combat({ character, patch }: { character: Character; patch: Patch }) {
  const roll = useRoll();
  const max = maxHp(character);
  const current = currentHp(character);
  const ac = acBreakdown(character);
  const speed = speedOf(character);
  const bulk = bulkOf(character);
  const [amount, setAmount] = useState(5);
  const [crit, setCrit] = useState(false);
  const [recoveryNote, setRecoveryNote] = useState("");
  const ratio = max === 0 ? 0 : Math.min(100, Math.round((current / max) * 100));
  const classId = CLASSES.find((item) => item.name === character.className)?.id ?? "";
  const ancestryId = ANCESTRIES.find((item) => item.name === character.ancestry)?.id ?? "";

  return (
    <div className="flex flex-col gap-4">
      <Section title="Кто вы" kicker="Лист">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField label="Игрок" value={character.player} onChange={(player) => patch((c) => ({ ...c, player }))} />
          <label className="flex flex-col gap-1 text-sm text-muted">
            Народ
            <select
              className="min-h-11 rounded-md border border-line bg-paper px-3 text-base text-ink"
              value={ancestryId}
              onChange={(event) => {
                const id = event.target.value;
                if (id) patch((c) => applyAncestry(c, id));
              }}
            >
              <option value="">Свой</option>
              {ANCESTRIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <TextField label="Название народа" value={character.ancestry} onChange={(ancestry) => patch((c) => ({ ...c, ancestry }))} />
          <TextField label="Наследие" value={character.heritage} onChange={(heritage) => patch((c) => ({ ...c, heritage }))} />
          <TextField label="Происхождение" value={character.background} onChange={(background) => patch((c) => ({ ...c, background }))} />
          <label className="flex flex-col gap-1 text-sm text-muted">
            Класс
            <select
              className="min-h-11 rounded-md border border-line bg-paper px-3 text-base text-ink"
              value={classId}
              onChange={(event) => {
                const id = event.target.value;
                if (id) patch((c) => applyClassStats(c, id, false));
              }}
            >
              <option value="">Свой</option>
              {CLASSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.hp} ПЗ
                </option>
              ))}
            </select>
          </label>
          <TextField label="Название класса" value={character.className} onChange={(className) => patch((c) => ({ ...c, className }))} />
          <TextField label="Подкласс / путь" value={character.subclass} onChange={(subclass) => patch((c) => ({ ...c, subclass }))} placeholder="Кромка, доктрина, покровитель…" />
          <SelectField label="Размер" value={character.size} onChange={(size) => patch((c) => ({ ...c, size }))} options={SIZES} />
          <SelectField
            label="Ключ класса"
            value={character.keyAbility}
            onChange={(keyAbility) => patch((c) => ({ ...c, keyAbility }))}
            options={ABILITIES.map((ability) => ({ id: ability.id, label: ability.name }))}
          />
          <TextField label="Божество" value={character.deity} onChange={(deity) => patch((c) => ({ ...c, deity }))} />
          <NumField label="Опыт (1000 до уровня)" value={character.xp} min={0} max={99999} onChange={(xp) => patch((c) => ({ ...c, xp }))} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn
            tone="blood"
            disabled={!classId}
            onClick={() => patch((c) => applyClassStats(c, classId, true))}
            title="Стойкость, Реакция, Воля, Восприятие, КБ и классовая СЛ станут как на 1 уровне"
          >
            Стартовые обученности класса
          </Btn>
          <Btn
            onClick={() =>
              patch((c) => ({
                ...c,
                level: Math.min(20, c.level + 1),
                xp: Math.max(0, c.xp - 1000),
              }))
            }
          >
            Получить уровень
          </Btn>
        </div>
        {classId ? <p className="mt-2 text-sm text-muted">{CLASSES.find((item) => item.id === classId)?.note}</p> : null}
        <p className="mt-2 text-sm text-muted">На {character.level} уровне обычно: {levelReminders(character.level).join("; ")}.</p>
      </Section>

      <Section title="Характеристики" kicker="С учётом половинных бустов (Remaster)">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITIES.map((ability) => {
          const score = character.abilities[ability.id];
          const mod = abilityMod(score);
          const isPartial = score % 2 === 1;
          const displayMod = isPartial ? `${fmt(mod)}½` : fmt(mod);

          return (
            <div key={ability.id} className="rounded-md border border-line bg-paper-2 p-2">
              <StatButton
                label={ability.name}
                value={displayMod}
                hint="Проверка характеристики"
                onClick={() => roll.rollCheck(ability.name, mod)}
              />
              <div className="mt-2 flex items-center justify-center gap-1">
                <Btn
                  tone="ghost"
                  onClick={() => {
                    const newScore = score <= 18 ? Math.max(1, score - 2) : score - 1;
                    patch((c) => ({
                      ...c,
                      abilities: { ...c.abilities, [ability.id]: newScore },
                    }));
                  }}
                >
                  −
                </Btn>
                <Btn
                  tone="ghost"
                  onClick={() => {
                    const newScore = score >= 18 ? score + 1 : score + 2;
                    patch((c) => ({
                      ...c,
                      abilities: { ...c.abilities, [ability.id]: Math.min(30, newScore) },
                    }));
                  }}
                >
                  +
                </Btn>
              </div>
              <p className="mt-1 text-center text-xs text-muted">
                {score}
                {isPartial ? " · ½ буста" : ""}
              </p>
            </div>
          );
        })}
      </div>
    </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Здоровье" kicker={character.dead ? "Мёртв" : "Пункты здоровья"}>
          <div className="flex items-end justify-between gap-3">
            <p className="font-display text-5xl leading-none text-ink tabular">
              {current}
              <span className="text-2xl text-muted">/{max}</span>
            </p>
            <p className="text-sm text-muted">врем. {character.tempHp}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-3">
            <div className="h-full bg-blood" style={{ width: `${ratio}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted">{hpFormula(character)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <NumField label="Урон / лечение" value={amount} min={0} max={999} onChange={setAmount} />
            <div className="flex flex-col justify-end gap-2">
              <Btn tone="blood" onClick={() => patch((c) => applyDamage(c, amount, crit))}>
                Получить урон
              </Btn>
            </div>
            <div className="flex flex-col justify-end">
              <Btn onClick={() => patch((c) => applyHeal(c, amount))}>Лечение</Btn>
            </div>
            <Toggle on={crit} label="Крит. удар" onClick={() => setCrit((value) => !value)} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <NumField label="Временные" value={character.tempHp} min={0} max={999} onChange={(tempHp) => patch((c) => ({ ...c, tempHp }))} />
            <NumField
              label="Умирает"
              value={character.conditions.dying}
              min={0}
              max={4}
              onChange={(dying) =>
                patch((c) => {
                  const conditions = { ...c.conditions, dying };
                  const dead = dying >= deathThreshold({ ...c, conditions }) && dying > 0;
                  return { ...c, dead: dead || (deathThreshold({ ...c, conditions }) <= 0), conditions: { ...conditions, unconscious: dying > 0 || conditions.unconscious } };
                })
              }
            />
            <NumField label="Ранен" value={character.conditions.wounded} min={0} max={10} onChange={(wounded) => patch((c) => ({ ...c, conditions: { ...c.conditions, wounded } }))} />
            <NumField
              label="Обречён"
              value={character.conditions.doomed}
              min={0}
              max={4}
              onChange={(doomed) =>
                patch((c) => {
                  const conditions = { ...c.conditions, doomed };
                  const dead =
                    deathThreshold({ ...c, conditions }) <= 0 ||
                    (c.conditions.dying > 0 && c.conditions.dying >= deathThreshold({ ...c, conditions }));
                  return { ...c, conditions, dead };
                })
              }
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            Смерть при умирании {deathThreshold(character)}
            {character.conditions.doomed ? ` (обречён ${character.conditions.doomed})` : ""}. Ранен прибавляется, когда вы получаете умирание.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn
              onClick={() => {
                const natural = 1 + Math.floor(Math.random() * 20);
                let note = "";
                patch((c) => {
                  const result = applyRecovery(c, natural);
                  note = `d20 ${natural} против СЛ ${result.dc}: ${DEGREE_LABEL[result.degree]}`;
                  return result.next;
                });
                setRecoveryNote(note);
              }}
              disabled={character.conditions.dying <= 0 || character.dead}
            >
              Проверка восстановления
            </Btn>
            <Btn tone="gold" disabled={character.heroPoints < 1 || character.conditions.dying <= 0} onClick={() => patch(heroicRecovery)}>
              Героическое спасение
            </Btn>
            <Btn onClick={() => patch(clearWounded)}>Снять ранение</Btn>
            <Btn onClick={() => patch(restTenMinutes)}>10 минут на полных ПЗ</Btn>
            <Btn onClick={() => patch(nightRest)}>Ночной отдых (−1 обречён)</Btn>
            {character.dead ? (
              <Btn tone="blood" onClick={() => patch(revive)}>
                Вернули к жизни
              </Btn>
            ) : null}
          </div>
          {recoveryNote ? <p className="mt-2 text-sm text-ink">{recoveryNote}</p> : null}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-blood">Из чего ПЗ</summary>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <NumField label="ПЗ народа" value={character.ancestryHp} min={0} max={40} onChange={(ancestryHp) => patch((c) => ({ ...c, ancestryHp }))} />
              <NumField label="ПЗ класса" value={character.classHp} min={0} max={20} onChange={(classHp) => patch((c) => ({ ...c, classHp }))} />
              <NumField label="Ещё за уровень" value={character.hpPerLevel} min={-5} max={20} onChange={(hpPerLevel) => patch((c) => ({ ...c, hpPerLevel }))} />
              <NumField label="Разовые ПЗ" value={character.hpFlat} min={-50} max={200} onChange={(hpFlat) => patch((c) => ({ ...c, hpFlat }))} />
              <div className="flex items-end">
                <Toggle on={character.toughness} label="Крепость +1/ур" onClick={() => patch((c) => ({ ...c, toughness: !c.toughness }))} />
              </div>
            </div>
          </details>
        </Section>

        <Section title="Защита" kicker="Класс брони">
          <div className="flex items-start justify-between gap-3">
            <StatButton label="КБ" value={String(ac.total)} hint="Бросок не нужен — это СЛ" />
            <div className="flex items-center gap-2">
              <RankButton rank={character.armorProficiency} onChange={(armorProficiency) => patch((c) => ({ ...c, armorProficiency }))} />
              <Toggle on={character.shieldRaised} label={character.shieldRaised ? "Щит поднят" : "Поднять щит"} onClick={() => patch((c) => ({ ...c, shieldRaised: !c.shieldRaised }))} />
            </div>
          </div>
          <div className="mt-2">
            <Parts parts={ac.parts} />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-muted">
              Доспех из списка
              <select
                className="min-h-11 rounded-md border border-line bg-paper px-3 text-base text-ink"
                value={ARMORS.find((item) => item.name === character.armorName)?.id ?? ""}
                onChange={(event) => {
                  if (event.target.value) patch((c) => applyArmor(c, event.target.value));
                }}
              >
                <option value="">Свой</option>
                {ARMORS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <TextField label="Название" value={character.armorName} onChange={(armorName) => patch((c) => ({ ...c, armorName }))} />
            <SelectField
              label="Категория"
              value={character.armorCategory}
              onChange={(armorCategory) => patch((c) => ({ ...c, armorCategory }))}
              options={ARMOR_CATEGORIES}
            />
            <NumField label="Бонус доспеха" value={character.armorBonus} min={0} max={10} onChange={(armorBonus) => patch((c) => ({ ...c, armorBonus }))} />
            <NumField label="Потенция" value={character.armorPotency} min={0} max={3} onChange={(armorPotency) => patch((c) => ({ ...c, armorPotency }))} />
            <NullableNum label="Потолок Лов" value={character.armorDexCap} onChange={(armorDexCap) => patch((c) => ({ ...c, armorDexCap }))} />
            <NumField label="Штраф проверки" value={character.armorCheck} min={0} max={10} onChange={(armorCheck) => patch((c) => ({ ...c, armorCheck }))} />
            <NumField label="Штраф скорости" value={character.armorSpeed} min={0} max={20} onChange={(armorSpeed) => patch((c) => ({ ...c, armorSpeed }))} />
            <NullableNum label="Порог Силы (мод.)" value={character.armorStr} onChange={(armorStr) => patch((c) => ({ ...c, armorStr }))} />
            <NumField label="Устойчивость к спасброскам" value={character.resilient} min={0} max={3} onChange={(resilient) => patch((c) => ({ ...c, resilient }))} />
            <NumField label="Обст. к КБ" value={character.acCircumstance} min={-10} max={10} onChange={(acCircumstance) => patch((c) => ({ ...c, acCircumstance }))} />
            <NumField label="Прочее к КБ" value={character.acMisc} min={-10} max={10} onChange={(acMisc) => patch((c) => ({ ...c, acMisc }))} />
          </div>
          <p className="mt-2 text-sm text-muted">
            Порог силы — модификатор, не значение. Если он набран, штраф проверки пропадает, а штраф скорости падает на 5 футов. Врасплох даёт −2 обстоятельства и стакается со щитом.
          </p>
          <div className="mt-4 border-t border-line pt-4">
            <h3 className="font-display text-2xl text-blood">Щит</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <TextField label="Название" value={character.shieldName} onChange={(shieldName) => patch((c) => ({ ...c, shieldName }))} />
              <NumField label="Бонус КБ" value={character.shieldBonus} min={0} max={4} onChange={(shieldBonus) => patch((c) => ({ ...c, shieldBonus }))} />
              <NumField label="Твёрдость" value={character.shieldHardness} min={0} max={30} onChange={(shieldHardness) => patch((c) => ({ ...c, shieldHardness }))} />
              <NumField label="ПЗ щита" value={character.shieldHp} min={0} max={200} onChange={(shieldHp) => patch((c) => ({ ...c, shieldHp }))} />
              <NumField label="Макс. ПЗ" value={character.shieldMaxHp} min={0} max={200} onChange={(shieldMaxHp) => patch((c) => ({ ...c, shieldMaxHp }))} />
              <NumField label="Порог поломки" value={character.shieldBroken} min={0} max={200} onChange={(shieldBroken) => patch((c) => ({ ...c, shieldBroken }))} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Btn
                onClick={() =>
                  patch((c) => ({
                    ...c,
                    shieldName: "Стальной щит",
                    shieldBonus: 2,
                    shieldHardness: 5,
                    shieldMaxHp: 20,
                    shieldHp: 20,
                    shieldBroken: 10,
                  }))
                }
              >
                Стальной щит
              </Btn>
              <Btn
                onClick={() =>
                  patch((c) => ({
                    ...c,
                    shieldName: "Баклер",
                    shieldBonus: 1,
                    shieldHardness: 3,
                    shieldMaxHp: 6,
                    shieldHp: 6,
                    shieldBroken: 3,
                  }))
                }
              >
                Баклер
              </Btn>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Спасброски и чутьё" kicker="Бонус обученности = уровень + ранг">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SaveCard
            label="Стойкость"
            ability="con"
            rank={character.fortProf}
            breakdown={saveBreakdown(character, "fort")}
            onRank={(fortProf) => patch((c) => ({ ...c, fortProf }))}
            onRoll={() => roll.rollCheck("Стойкость", saveBreakdown(character, "fort").total)}
            misc={character.fortMisc}
            circ={character.fortCirc}
            onMisc={(fortMisc) => patch((c) => ({ ...c, fortMisc }))}
            onCirc={(fortCirc) => patch((c) => ({ ...c, fortCirc }))}
          />
          <SaveCard
            label="Реакция"
            ability="dex"
            rank={character.refProf}
            breakdown={saveBreakdown(character, "ref")}
            onRank={(refProf) => patch((c) => ({ ...c, refProf }))}
            onRoll={() => roll.rollCheck("Реакция", saveBreakdown(character, "ref").total)}
            misc={character.refMisc}
            circ={character.refCirc}
            onMisc={(refMisc) => patch((c) => ({ ...c, refMisc }))}
            onCirc={(refCirc) => patch((c) => ({ ...c, refCirc }))}
          />
          <SaveCard
            label="Воля"
            ability="wis"
            rank={character.willProf}
            breakdown={saveBreakdown(character, "will")}
            onRank={(willProf) => patch((c) => ({ ...c, willProf }))}
            onRoll={() => roll.rollCheck("Воля", saveBreakdown(character, "will").total)}
            misc={character.willMisc}
            circ={character.willCirc}
            onMisc={(willMisc) => patch((c) => ({ ...c, willMisc }))}
            onCirc={(willCirc) => patch((c) => ({ ...c, willCirc }))}
          />
          <SaveCard
            label="Восприятие"
            ability="wis"
            rank={character.perceptionProf}
            breakdown={perceptionBreakdown(character)}
            onRank={(perceptionProf) => patch((c) => ({ ...c, perceptionProf }))}
            onRoll={() => roll.rollCheck("Восприятие / инициатива", perceptionBreakdown(character).total)}
            misc={character.perceptionMisc}
            circ={character.perceptionCirc}
            onMisc={(perceptionMisc) => patch((c) => ({ ...c, perceptionMisc }))}
            onCirc={(perceptionCirc) => patch((c) => ({ ...c, perceptionCirc }))}
            extraItem={character.perceptionItem}
            onItem={(perceptionItem) => patch((c) => ({ ...c, perceptionItem }))}
          />
          <div className="rounded-md border border-line bg-paper-2 p-3">
            <StatButton
              label={speed.stuck ? "Скорость (нельзя идти)" : "Скорость"}
              value={`${speed.total}`}
              hint="В футах"
            />
            <Parts parts={speed.parts} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <NumField label="База" value={character.speedBase} min={0} max={100} onChange={(speedBase) => patch((c) => ({ ...c, speedBase }))} />
              <NumField label="Прочее" value={character.speedMisc} min={-40} max={40} onChange={(speedMisc) => patch((c) => ({ ...c, speedMisc }))} />
            </div>
            <div className="mt-2">
              <TextField label="Другие перемещения" value={character.speeds} onChange={(speeds) => patch((c) => ({ ...c, speeds }))} placeholder="полёт 20, плавание 15…" />
            </div>
            {bulk.state !== "ok" ? <p className="mt-2 text-sm text-blood">{bulk.label}: −10 футов и неуклюжесть 1</p> : null}
          </div>
          <div className="rounded-md border border-line bg-paper-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <StatButton label="Классовая СЛ" value={String(classDcBreakdown(character).total)} />
              <RankButton rank={character.classDcProf} onChange={(classDcProf) => patch((c) => ({ ...c, classDcProf }))} />
            </div>
            <Parts parts={classDcBreakdown(character).parts} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <NumField label="Обстоятельство" value={character.classDcCirc} min={-5} max={5} onChange={(classDcCirc) => patch((c) => ({ ...c, classDcCirc }))} />
              <NumField label="Прочее" value={character.classDcMisc} min={-5} max={5} onChange={(classDcMisc) => patch((c) => ({ ...c, classDcMisc }))} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Состояния" kicker="Одинаковые типы не стакаются — берётся худший">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VALUES.map((item) => (
            <NumField
              key={item.key}
              label={item.label}
              value={character.conditions[item.key]}
              min={0}
              max={item.max}
              onChange={(value) => patch((c) => ({ ...c, conditions: { ...c.conditions, [item.key]: value } }))}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FLAGS.filter((item) => item.math).map((item) => (
            <Toggle
              key={item.key}
              on={Boolean(character.conditions[item.key])}
              label={item.label}
              onClick={() =>
                patch((c) => ({
                  ...c,
                  conditions: { ...c.conditions, [item.key]: !c.conditions[item.key] },
                }))
              }
            />
          ))}
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-blood">Остальные состояния</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {FLAGS.filter((item) => !item.math).map((item) => (
              <Toggle
                key={item.key}
                on={Boolean(character.conditions[item.key])}
                label={item.label}
                onClick={() =>
                  patch((c) => ({
                    ...c,
                    conditions: { ...c.conditions, [item.key]: !c.conditions[item.key] },
                  }))
                }
              />
            ))}
          </div>
        </details>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <TextField
            label="Продолжительный урон"
            value={character.conditions.persistent}
            onChange={(persistent) => patch((c) => ({ ...c, conditions: { ...c.conditions, persistent } }))}
            placeholder="1d6 кровь"
          />
          <TextField label="Сопротивления" value={character.resistances} onChange={(resistances) => patch((c) => ({ ...c, resistances }))} />
          <TextField label="Уязвимости" value={character.weaknesses} onChange={(weaknesses) => patch((c) => ({ ...c, weaknesses }))} />
          <TextField label="Иммунитеты" value={character.immunities} onChange={(immunities) => patch((c) => ({ ...c, immunities }))} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <NumField label="Статус к атакам" value={character.aura.attackStatus} min={0} max={4} onChange={(attackStatus) => patch((c) => ({ ...c, aura: { ...c.aura, attackStatus } }))} />
          <NumField label="Обст. к атакам" value={character.aura.attackCirc} min={-4} max={4} onChange={(attackCirc) => patch((c) => ({ ...c, aura: { ...c.aura, attackCirc } }))} />
          <NumField label="Статус к урону" value={character.aura.damageStatus} min={0} max={10} onChange={(damageStatus) => patch((c) => ({ ...c, aura: { ...c.aura, damageStatus } }))} />
          <NumField label="Статус к спасбр." value={character.aura.saveStatus} min={0} max={4} onChange={(saveStatus) => patch((c) => ({ ...c, aura: { ...c.aura, saveStatus } }))} />
          <NumField label="Статус к КБ" value={character.aura.acStatus} min={0} max={4} onChange={(acStatus) => patch((c) => ({ ...c, aura: { ...c.aura, acStatus } }))} />
        </div>
        <p className="mt-2 text-sm text-muted">
          Поля сверху — бонусы от баффов вроде гимна барда. Штрафы испуга, тошноты, неуклюжести и остальных состояний лист вычитает сам и не складывает штрафы одного типа.
        </p>
      </Section>
    </div>
  );
}

function SaveCard({
  label,
  ability,
  rank,
  breakdown,
  onRank,
  onRoll,
  misc,
  circ,
  onMisc,
  onCirc,
  extraItem,
  onItem,
}: {
  label: string;
  ability: Ability;
  rank: Proficiency;
  breakdown: { total: number; parts: { label: string; value: number }[] };
  onRank: (rank: Proficiency) => void;
  onRoll: () => void;
  misc: number;
  circ: number;
  onMisc: (value: number) => void;
  onCirc: (value: number) => void;
  extraItem?: number;
  onItem?: (value: number) => void;
}) {
  const name = ABILITIES.find((item) => item.id === ability)?.short ?? ability;
  return (
    <div className="rounded-md border border-line bg-paper-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <StatButton label={`${label} · ${name}`} value={fmt(breakdown.total)} onClick={onRoll} hint="Бросить d20" />
        <RankButton rank={rank} onChange={onRank} />
      </div>
      <div className="mt-1">
        <Parts parts={breakdown.parts} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {onItem ? <NumField label="Предмет" value={extraItem ?? 0} min={-3} max={3} onChange={onItem} /> : null}
        <NumField label="Обстоятельство" value={circ} min={-5} max={5} onChange={onCirc} />
        <NumField label="Прочее" value={misc} min={-10} max={10} onChange={onMisc} />
      </div>
    </div>
  );
}
