import type { Character } from "@/lib/pf2/types";
import { GrowText, Section, TextField, type Patch } from "@/components/sheet/bits";

type TextKey =
  | "ethnicity"
  | "nationality"
  | "birthplace"
  | "age"
  | "gender"
  | "height"
  | "weight"
  | "languages"
  | "appearance"
  | "attitude"
  | "beliefs"
  | "edicts"
  | "anathema"
  | "likes"
  | "dislikes"
  | "catchphrase"
  | "campaign"
  | "allies"
  | "enemies"
  | "organizations"
  | "notes";

export function Bio({ character, patch }: { character: Character; patch: Patch }) {
  const set = (key: TextKey) => (value: string) => patch((c) => ({ ...c, [key]: value }));
  return (
    <div className="flex flex-col gap-4">
      <Section title="Внешность" kicker="Происхождение">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField label="Этнос" value={character.ethnicity} onChange={set("ethnicity")} />
          <TextField label="Национальность" value={character.nationality} onChange={set("nationality")} />
          <TextField label="Место рождения" value={character.birthplace} onChange={set("birthplace")} />
          <TextField label="Возраст" value={character.age} onChange={set("age")} />
          <TextField label="Пол" value={character.gender} onChange={set("gender")} />
          <TextField label="Рост" value={character.height} onChange={set("height")} />
          <TextField label="Вес" value={character.weight} onChange={set("weight")} />
          <TextField label="Языки" value={character.languages} onChange={set("languages")} />
        </div>
        <div className="mt-3">
          <GrowText label="Внешность" value={character.appearance} onChange={set("appearance")} rows={3} />
        </div>
      </Section>
      <Section title="Личность">
        <div className="grid gap-3 sm:grid-cols-2">
          <GrowText label="Отношение" value={character.attitude} onChange={set("attitude")} />
          <GrowText label="Божество и философия" value={character.beliefs} onChange={set("beliefs")} />
          <GrowText label="Эдикты" value={character.edicts} onChange={set("edicts")} />
          <GrowText label="Анафемы" value={character.anathema} onChange={set("anathema")} />
          <GrowText label="Любит" value={character.likes} onChange={set("likes")} />
          <GrowText label="Не любит" value={character.dislikes} onChange={set("dislikes")} />
          <div className="sm:col-span-2">
            <TextField label="Меткие фразы" value={character.catchphrase} onChange={set("catchphrase")} />
          </div>
        </div>
      </Section>
      <Section title="Заметки для компании">
        <div className="grid gap-3">
          <GrowText label="Сюжет" value={character.campaign} onChange={set("campaign")} rows={4} />
          <GrowText label="Друзья" value={character.allies} onChange={set("allies")} />
          <GrowText label="Враги" value={character.enemies} onChange={set("enemies")} />
          <GrowText label="Организации" value={character.organizations} onChange={set("organizations")} />
          <GrowText label="Прочие заметки" value={character.notes} onChange={set("notes")} rows={5} />
        </div>
      </Section>
    </div>
  );
}
