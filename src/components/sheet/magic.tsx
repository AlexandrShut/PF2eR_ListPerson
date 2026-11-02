import { Plus, Trash2 } from "lucide-react";
import { cantripRank, fmt, spellAttack, spellDc } from "@/lib/pf2/calc";
import { ABILITIES, fullCasterSlots, TRADITIONS } from "@/lib/pf2/data";
import { makeRitual, makeSpell, makeSpellcasting } from "@/lib/pf2/defaults";
import { refocus } from "@/lib/pf2/mutate";
import type { Character, Spell, Spellcasting, Tradition } from "@/lib/pf2/types";
import { Btn, GrowText, NumField, Parts, RankButton, Section, SelectField, StatButton, TextField, type Patch } from "@/components/sheet/bits";
import { useRoll } from "@/components/sheet/roller";

const KINDS: { id: Spellcasting["kind"]; label: string }[] = [
  { id: "prepared", label: "Подготовленные" },
  { id: "spontaneous", label: "Спонтанные" },
  { id: "focus", label: "Фокус" },
  { id: "innate", label: "Врождённые" },
];

export function Magic({ character, patch }: { character: Character; patch: Patch }) {
  const setEntry = (id: string, recipe: (entry: Spellcasting) => Spellcasting) =>
    patch((c) => ({ ...c, spellcasting: c.spellcasting.map((entry) => (entry.id === id ? recipe(entry) : entry)) }));

  return (
    <div className="flex flex-col gap-4">
      <Section title="Фокус" kicker="Общий резерв">
        <div className="flex flex-wrap items-end gap-3">
          <NumField label="Максимум" value={character.focusMax} min={0} max={3} onChange={(focusMax) => patch((c) => ({ ...c, focusMax, focusLeft: Math.min(c.focusLeft, focusMax) }))} />
          <div>
            <p className="text-sm text-muted">Сейчас</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.max(character.focusMax, 1) }, (_, index) => {
                const filled = index < character.focusLeft;
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Пункт фокуса ${index + 1}`}
                    disabled={character.focusMax === 0}
                    onClick={() => patch((c) => ({ ...c, focusLeft: filled && index === c.focusLeft - 1 ? index : index + 1 }))}
                    className={`size-11 rounded-full border ${filled ? "border-gold bg-gold" : "border-line bg-paper"}`}
                  />
                );
              })}
            </div>
          </div>
          <Btn onClick={() => patch((c) => refocus(c, false))}>Перефокусировка +1</Btn>
          <Btn onClick={() => patch((c) => refocus(c, true))}>Полный резерв</Btn>
        </div>
        <p className="mt-2 text-sm text-muted">Заговоры и фокус усиливаются до круга {cantripRank(character.level)}.</p>
      </Section>

      {character.spellcasting.map((entry) => (
        <Caster
          key={entry.id}
          character={character}
          entry={entry}
          onChange={(recipe) => setEntry(entry.id, recipe)}
          onRemove={() => patch((c) => ({ ...c, spellcasting: c.spellcasting.filter((item) => item.id !== entry.id) }))}
          onSpendFocus={() => patch((c) => ({ ...c, focusLeft: Math.max(0, c.focusLeft - 1) }))}
        />
      ))}

      <div className="flex flex-wrap gap-2">
        <Btn tone="blood" onClick={() => patch((c) => ({ ...c, spellcasting: [...c.spellcasting, makeSpellcasting({ name: "Новая традиция", ability: c.keyAbility })] }))}>
          <Plus className="size-4" /> Источник заклинаний
        </Btn>
      </div>

      <Section
        title="Ритуалы"
        extra={
          <Btn onClick={() => patch((c) => ({ ...c, rituals: [...c.rituals, makeRitual()] }))}>
            <Plus className="size-4" /> Ритуал
          </Btn>
        }
      >
        {character.rituals.length === 0 ? <p className="text-sm text-muted">Ритуалы не тратят ячейки. Добавьте, если знаете.</p> : null}
        <ul className="flex flex-col gap-3">
          {character.rituals.map((ritual) => (
            <li key={ritual.id} className="rounded-md border border-line bg-paper-2 p-3">
              <div className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-3">
                  <TextField label="Название" value={ritual.name} onChange={(name) => patch((c) => ({ ...c, rituals: c.rituals.map((item) => (item.id === ritual.id ? { ...item, name } : item)) }))} />
                  <NumField label="Круг" value={ritual.rank} min={1} max={10} onChange={(rank) => patch((c) => ({ ...c, rituals: c.rituals.map((item) => (item.id === ritual.id ? { ...item, rank } : item)) }))} />
                  <TextField label="Цена" value={ritual.cost} onChange={(cost) => patch((c) => ({ ...c, rituals: c.rituals.map((item) => (item.id === ritual.id ? { ...item, cost } : item)) }))} />
                </div>
                <button type="button" className="inline-flex size-11 items-center justify-center text-blood" aria-label="Удалить ритуал" onClick={() => patch((c) => ({ ...c, rituals: c.rituals.filter((item) => item.id !== ritual.id) }))}>
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-2">
                <GrowText value={ritual.description} onChange={(description) => patch((c) => ({ ...c, rituals: c.rituals.map((item) => (item.id === ritual.id ? { ...item, description } : item)) }))} rows={3} placeholder="Первичный и вторичный касты, время, эффект" />
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Caster({
  character,
  entry,
  onChange,
  onRemove,
  onSpendFocus,
}: {
  character: Character;
  entry: Spellcasting;
  onChange: (recipe: (entry: Spellcasting) => Spellcasting) => void;
  onRemove: () => void;
  onSpendFocus: () => void;
}) {
  const roll = useRoll();
  const attack = spellAttack(character, entry);
  const dc = spellDc(character, entry);
  const setSpell = (id: string, recipe: (spell: Spell) => Spell) =>
    onChange((current) => ({ ...current, spells: current.spells.map((spell) => (spell.id === id ? recipe(spell) : spell)) }));

  return (
    <Section
      title={entry.name || "Заклинания"}
      kicker={KINDS.find((kind) => kind.id === entry.kind)?.label}
      extra={
        <button type="button" className="inline-flex size-11 items-center justify-center text-blood" aria-label="Удалить источник" onClick={onRemove}>
          <Trash2 className="size-4" />
        </button>
      }
    >
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start justify-between gap-2 rounded-md border border-line bg-paper-2 p-3">
          <StatButton label="Атака" value={fmt(attack.total)} onClick={() => roll.rollCheck(`${entry.name}: атака`, attack.total)} />
          <RankButton rank={entry.proficiency} onChange={(proficiency) => onChange((current) => ({ ...current, proficiency }))} />
        </div>
        <div className="rounded-md border border-line bg-paper-2 p-3">
          <StatButton label="СЛ" value={String(dc.total)} />
          <Parts parts={dc.parts} />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <TextField label="Название" value={entry.name} onChange={(name) => onChange((current) => ({ ...current, name }))} />
        <SelectField label="Как колдует" value={entry.kind} onChange={(kind) => onChange((current) => ({ ...current, kind }))} options={KINDS} />
        <SelectField label="Традиция" value={entry.tradition} onChange={(tradition: Tradition) => onChange((current) => ({ ...current, tradition }))} options={TRADITIONS} />
        <SelectField
          label="Характеристика"
          value={entry.ability}
          onChange={(ability) => onChange((current) => ({ ...current, ability }))}
          options={ABILITIES.map((ability) => ({ id: ability.id, label: ability.name }))}
        />
        <NumField label="Предмет к атаке и СЛ" value={entry.itemBonus} min={0} max={3} onChange={(itemBonus) => onChange((current) => ({ ...current, itemBonus }))} />
      </div>

      {entry.kind === "prepared" || entry.kind === "spontaneous" ? (
        <div className="mt-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <Btn
              onClick={() =>
                onChange((current) => ({
                  ...current,
                  slots: fullCasterSlots(character.level).map((slot) => {
                    const prev = current.slots.find((item) => item.rank === slot.rank);
                    const left = prev ? Math.min(prev.left, slot.max) : slot.max;
                    return { rank: slot.rank, max: slot.max, left };
                  }),
                }))
              }
            >
              Ячейки полного заклинателя
            </Btn>
            <Btn
              onClick={() =>
                onChange((current) => ({
                  ...current,
                  slots: [...current.slots, { rank: current.slots.length + 1, max: 1, left: 1 }].slice(0, 10),
                }))
              }
            >
              + круг
            </Btn>
            <Btn onClick={() => onChange((current) => ({ ...current, slots: current.slots.map((slot) => ({ ...slot, left: slot.max })) }))}>
              Вернуть ячейки
            </Btn>
          </div>
          <ul className="flex flex-col gap-2">
            {entry.slots.map((slot) => (
              <li key={slot.rank} className="flex flex-wrap items-center gap-2">
                <span className="w-16 text-sm font-semibold text-ink">{slot.rank} круг</span>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: slot.max }, (_, index) => {
                    const filled = index < slot.left;
                    return (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Ячейка ${slot.rank} круга ${index + 1}`}
                        onClick={() =>
                          onChange((current) => ({
                            ...current,
                            slots: current.slots.map((item) =>
                              item.rank === slot.rank ? { ...item, left: filled && index === item.left - 1 ? index : index + 1 } : item,
                            ),
                          }))
                        }
                        className={`size-11 rounded-md border ${filled ? "border-blood bg-blood" : "border-line bg-paper"}`}
                      />
                    );
                  })}
                </div>
                <NumField label="Макс." value={slot.max} min={0} max={10} onChange={(max) => onChange((current) => ({ ...current, slots: current.slots.map((item) => (item.rank === slot.rank ? { ...item, max, left: Math.min(item.left, max) } : item)) }))} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Btn
          onClick={() =>
            onChange((current) => ({
              ...current,
              spells: [...current.spells, makeSpell({ rank: 0, name: "Заговор", actions: "2" })],
            }))
          }
        >
          Заговор
        </Btn>
        <Btn
          tone="blood"
          onClick={() => onChange((current) => ({ ...current, spells: [...current.spells, makeSpell({ name: "Заклинание" })] }))}
        >
          <Plus className="size-4" /> Заклинание
        </Btn>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {entry.spells.map((spell) => (
          <li key={spell.id} className="rounded-md border border-line p-3">
            <div className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <TextField label="Название" value={spell.name} onChange={(name) => setSpell(spell.id, (item) => ({ ...item, name }))} />
                </div>
                <NumField label="Круг (0 = заговор)" value={spell.rank} min={0} max={10} onChange={(rank) => setSpell(spell.id, (item) => ({ ...item, rank }))} />
                <TextField label="Действия" value={spell.actions} onChange={(actions) => setSpell(spell.id, (item) => ({ ...item, actions }))} placeholder="1, 2, 3, реакция" />
                <TextField label="Дескрипторы" value={spell.traits} onChange={(traits) => setSpell(spell.id, (item) => ({ ...item, traits }))} />
                <TextField label="Защита" value={spell.defense} onChange={(defense) => setSpell(spell.id, (item) => ({ ...item, defense }))} placeholder="СЛ Стойкости" />
                {entry.kind === "prepared" ? (
                  <div className="flex items-end">
                    <Btn tone={spell.prepared ? "blood" : "ghost"} onClick={() => setSpell(spell.id, (item) => ({ ...item, prepared: !item.prepared }))}>
                      {spell.prepared ? "Подготовлено" : "Не подготовлено"}
                    </Btn>
                  </div>
                ) : null}
                {entry.kind === "innate" ? (
                  <>
                    <NumField label="Использований" value={spell.innateMax} min={0} max={20} onChange={(innateMax) => setSpell(spell.id, (item) => ({ ...item, innateMax, innateLeft: Math.min(item.innateLeft, innateMax) }))} />
                    <NumField label="Осталось" value={spell.innateLeft} min={0} max={spell.innateMax || 20} onChange={(innateLeft) => setSpell(spell.id, (item) => ({ ...item, innateLeft }))} />
                  </>
                ) : null}
              </div>
              <button type="button" className="inline-flex size-11 items-center justify-center text-blood" aria-label="Удалить заклинание" onClick={() => onChange((current) => ({ ...current, spells: current.spells.filter((item) => item.id !== spell.id) }))}>
                <Trash2 className="size-4" />
              </button>
            </div>
            {spell.rank === 0 ? <p className="mt-2 text-sm text-gold">Усилен до круга {cantripRank(character.level)}</p> : null}
            {entry.kind === "focus" ? (
              <div className="mt-2">
                <Btn disabled={character.focusLeft <= 0} onClick={onSpendFocus}>
                  Потратить пункт фокуса ({character.focusLeft})
                </Btn>
              </div>
            ) : null}
            <div className="mt-2 grid gap-2">
              <GrowText label="Описание" value={spell.description} onChange={(description) => setSpell(spell.id, (item) => ({ ...item, description }))} rows={4} placeholder="Эффект, область, длительность. Пишите полностью." />
              <GrowText label="Усиление" value={spell.heightened} onChange={(heightened) => setSpell(spell.id, (item) => ({ ...item, heightened }))} rows={2} />
            </div>
            {spell.rank > 0 && (entry.kind === "prepared" || entry.kind === "spontaneous") ? (
              <div className="mt-2">
                <Btn
                  onClick={() =>
                    onChange((current) => ({
                      ...current,
                      slots: current.slots.map((slot) => (slot.rank === spell.rank && slot.left > 0 ? { ...slot, left: slot.left - 1 } : slot)),
                    }))
                  }
                >
                  Потратить ячейку {spell.rank} круга
                </Btn>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
