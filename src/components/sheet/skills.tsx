import { Plus, Trash2 } from "lucide-react";
import { fmt, skillBreakdown } from "@/lib/pf2/calc";
import { ABILITIES, profLabel } from "@/lib/pf2/data";
import { makeLore } from "@/lib/pf2/defaults";
import type { Character, Skill } from "@/lib/pf2/types";
import { Btn, NumField, Parts, RankButton, Section, SelectField, TextField, type Patch } from "@/components/sheet/bits";
import { useRoll } from "@/components/sheet/roller";

export function Skills({ character, patch }: { character: Character; patch: Patch }) {
  const roll = useRoll();
  const setSkill = (id: string, recipe: (skill: Skill) => Skill) =>
    patch((c) => ({ ...c, skills: c.skills.map((skill) => (skill.id === id ? recipe(skill) : skill)) }));

  return (
    <Section
      title="Навыки"
      kicker="Клик по числу бросает кость"
      extra={
        <Btn onClick={() => patch((c) => ({ ...c, skills: [...c.skills, makeLore("Знание")] }))}>
          <Plus className="size-4" /> Знание
        </Btn>
      }
    >
      <p className="mb-3 text-sm text-muted">
        Итог = модификатор + обученность (уровень + 2/4/6/8) + предмет + обстоятельство + прочее − штраф доспеха, если порог Силы не набран. Буква ранга меняется по нажатию: Н О Э М Л.
      </p>
      <ul className="flex flex-col gap-2">
        {character.skills.map((skill) => {
          const breakdown = skillBreakdown(character, skill);
          return (
            <li key={skill.id} className="rounded-md border border-line bg-paper-2 p-3">
              <div className="flex items-center gap-2">
                <RankButton rank={skill.proficiency} onChange={(proficiency) => setSkill(skill.id, (item) => ({ ...item, proficiency }))} />
                <div className="min-w-0 flex-1">
                  {skill.catalogId ? (
                    <p className="truncate font-semibold text-ink">{skill.name}</p>
                  ) : (
                    <TextField value={skill.name} onChange={(name) => setSkill(skill.id, (item) => ({ ...item, name }))} />
                  )}
                  <p className="text-sm text-muted">
                    {ABILITIES.find((ability) => ability.id === skill.ability)?.short} · {profLabel(skill.proficiency).toLowerCase()}
                    {skill.armor ? " · штраф доспеха" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="min-h-11 min-w-16 rounded-md px-2 font-display text-4xl leading-none text-ink tabular hover:bg-paper-3"
                  onClick={() => roll.rollCheck(skill.name, breakdown.total)}
                  title="Бросить навык"
                >
                  {fmt(breakdown.total)}
                </button>
                {skill.catalogId ? null : (
                  <button
                    type="button"
                    className="inline-flex size-11 items-center justify-center text-blood"
                    aria-label="Удалить знание"
                    onClick={() => patch((c) => ({ ...c, skills: c.skills.filter((item) => item.id !== skill.id) }))}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <div className="mt-2">
                <Parts parts={breakdown.parts} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {skill.catalogId ? null : (
                  <SelectField
                    label="Характеристика"
                    value={skill.ability}
                    onChange={(ability) => setSkill(skill.id, (item) => ({ ...item, ability }))}
                    options={ABILITIES.map((ability) => ({ id: ability.id, label: ability.name }))}
                  />
                )}
                <NumField label="Предмет" value={skill.item} min={-3} max={5} onChange={(item) => setSkill(skill.id, (skill) => ({ ...skill, item }))} />
                <NumField label="Обстоятельство" value={skill.circumstance} min={-5} max={5} onChange={(circumstance) => setSkill(skill.id, (skill) => ({ ...skill, circumstance }))} />
                <NumField label="Прочее" value={skill.misc} min={-10} max={10} onChange={(misc) => setSkill(skill.id, (skill) => ({ ...skill, misc }))} />
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
