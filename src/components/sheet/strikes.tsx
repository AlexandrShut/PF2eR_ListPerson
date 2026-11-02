import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { fmt, mapSteps, strikeAttack, strikeDamage } from "@/lib/pf2/calc";
import { ABILITIES, WEAPONS } from "@/lib/pf2/data";
import { makeStrike, strikeFromWeapon } from "@/lib/pf2/defaults";
import type { Character, DamageAbility, Die, Proficiency, Strike } from "@/lib/pf2/types";
import { Btn, GrowText, NumField, Parts, RankButton, Section, SelectField, TextField, Toggle, type Patch } from "@/components/sheet/bits";
import { useRoll } from "@/components/sheet/roller";

const DICE: Die[] = [4, 6, 8, 10, 12];
const DAMAGE_MODES: { id: DamageAbility; label: string }[] = [
  { id: "str", label: "Сила" },
  { id: "halfstr", label: "Половина Силы" },
  { id: "dex", label: "Ловкость" },
  { id: "none", label: "Без характеристики" },
];

export function Strikes({ character, patch }: { character: Character; patch: Patch }) {
  const [preset, setPreset] = useState("0");
  const setStrike = (id: string, recipe: (strike: Strike) => Strike) =>
    patch((c) => ({ ...c, strikes: c.strikes.map((strike) => (strike.id === id ? recipe(strike) : strike)) }));
  const setAllProf = (proficiency: Proficiency) =>
    patch((c) => ({ ...c, strikes: c.strikes.map((strike) => ({ ...strike, proficiency })) }));

  return (
    <Section
      title="Атаки"
      kicker="Три числа — штраф серии"
      extra={
        <Btn onClick={() => patch((c) => ({ ...c, strikes: [...c.strikes, makeStrike()] }))}>
          <Plus className="size-4" /> Пустая
        </Btn>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 text-sm text-muted">
          Оружие из списка
          <select
            className="mt-1 min-h-11 w-full rounded-md border border-line bg-paper px-3 text-base text-ink"
            value={preset}
            onChange={(event) => setPreset(event.target.value)}
          >
            {WEAPONS.map((weapon, index) => (
              <option key={weapon.name} value={String(index)}>
                {weapon.name}
              </option>
            ))}
          </select>
        </label>
        <Btn
          tone="blood"
          onClick={() =>
            patch((c) => ({
              ...c,
              strikes: [...c.strikes, strikeFromWeapon(Number(preset), c.strikes[0]?.proficiency ?? 2)],
            }))
          }
        >
          Добавить
        </Btn>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="self-center text-sm text-muted">Обученность всех атак</span>
        {([0, 2, 4, 6, 8] as Proficiency[]).map((rank) => (
          <RankButton key={rank} rank={rank} onChange={() => setAllProf(rank)} />
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {character.strikes.map((strike) => (
          <StrikeCard key={strike.id} character={character} strike={strike} onChange={(recipe) => setStrike(strike.id, recipe)} onRemove={() => patch((c) => ({ ...c, strikes: c.strikes.filter((item) => item.id !== strike.id) }))} />
        ))}
      </ul>
    </Section>
  );
}

function StrikeCard({
  character,
  strike,
  onChange,
  onRemove,
}: {
  character: Character;
  strike: Strike;
  onChange: (recipe: (strike: Strike) => Strike) => void;
  onRemove: () => void;
}) {
  const roll = useRoll();
  const maps = mapSteps(strike);
  const attacks = maps.map((map) => strikeAttack(character, strike, map));
  const damage = strikeDamage(character, strike);
  return (
    <li className="rounded-md border border-line bg-paper-2 p-3">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <TextField value={strike.name} onChange={(name) => onChange((item) => ({ ...item, name }))} placeholder="Название оружия" />
        </div>
        <RankButton rank={strike.proficiency} onChange={(proficiency) => onChange((item) => ({ ...item, proficiency }))} />
        <button type="button" className="inline-flex size-11 items-center justify-center text-blood" aria-label="Удалить атаку" onClick={onRemove}>
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {attacks.map((attack, index) => (
          <button
            key={maps[index]}
            type="button"
            className="rounded-md border border-line bg-paper px-2 py-2 text-left hover:bg-paper-3"
            onClick={() => roll.rollCheck(`${strike.name} · удар ${index + 1}`, attack.total)}
          >
            <span className="block text-sm text-muted">{index === 0 ? "Первый" : index === 1 ? "Второй" : "Третий"}</span>
            <span className="font-display text-3xl leading-none tabular">{fmt(attack.total)}</span>
          </button>
        ))}
      </div>
      <div className="mt-2">
        <Parts parts={attacks[0]?.parts ?? []} />
      </div>
      <button
        type="button"
        className="mt-2 min-h-11 rounded-md border border-blood px-3 text-left text-blood"
        onClick={() => roll.rollDamage(`${strike.name}: урон`, damage.dice, damage.die, damage.flat, strike.extraDamage)}
      >
        Урон {damage.formula}
        {strike.damageType ? ` ${strike.damageType}` : ""}
        {strike.extraDamage ? ` + ${strike.extraDamage}` : ""}
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <Toggle on={strike.ranged} label="Дальняя" onClick={() => onChange((item) => ({ ...item, ranged: !item.ranged, ability: !item.ranged ? "dex" : item.ability }))} />
        <Toggle on={strike.finesse} label="Фехтовальное" onClick={() => onChange((item) => ({ ...item, finesse: !item.finesse }))} />
        <Toggle on={strike.agile} label="Быстрое" onClick={() => onChange((item) => ({ ...item, agile: !item.agile }))} />
        <Toggle on={strike.propulsive} label="Метательное/толчковое" onClick={() => onChange((item) => ({ ...item, propulsive: !item.propulsive, damageAbility: !item.propulsive ? "halfstr" : item.damageAbility }))} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SelectField
          label="Атака от"
          value={strike.ability}
          onChange={(ability) => onChange((item) => ({ ...item, ability }))}
          options={ABILITIES.map((ability) => ({ id: ability.id, label: ability.name }))}
        />
        <SelectField label="Кость" value={String(strike.die) as `${Die}`} onChange={(die) => onChange((item) => ({ ...item, die: Number(die) as Die }))} options={DICE.map((die) => ({ id: String(die) as `${Die}`, label: `d${die}` }))} />
        <NumField label="Руна удара" value={strike.striking} min={0} max={3} onChange={(striking) => onChange((item) => ({ ...item, striking: striking as 0 | 1 | 2 | 3 }))} />
        <NumField label="Потенция" value={strike.potency} min={0} max={3} onChange={(potency) => onChange((item) => ({ ...item, potency }))} />
        <TextField label="Тип урона" value={strike.damageType} onChange={(damageType) => onChange((item) => ({ ...item, damageType }))} />
        <SelectField label="Урон от" value={strike.damageAbility} onChange={(damageAbility) => onChange((item) => ({ ...item, damageAbility }))} options={DAMAGE_MODES} />
        <NumField label="Плоский бонус" value={strike.damageBonus} min={-10} max={30} onChange={(damageBonus) => onChange((item) => ({ ...item, damageBonus }))} />
        <TextField label="Доп. урон" value={strike.extraDamage} onChange={(extraDamage) => onChange((item) => ({ ...item, extraDamage }))} placeholder="1d6 огонь" />
        <TextField label="Руки" value={strike.hands} onChange={(hands) => onChange((item) => ({ ...item, hands }))} />
        <TextField label="Дистанция" value={strike.range} onChange={(range) => onChange((item) => ({ ...item, range }))} />
      </div>
      <div className="mt-2">
        <GrowText label="Дескрипторы и заметки" value={`${strike.traits}${strike.notes ? (strike.traits ? "\n" : "") + strike.notes : ""}`} onChange={(text) => onChange((item) => ({ ...item, traits: text, notes: "" }))} rows={2} placeholder="быстрое, фехтовальное, досягаемость…" />
      </div>
    </li>
  );
}
