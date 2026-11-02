import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ACTION_COSTS, FEAT_TYPES } from "@/lib/pf2/data";
import { makeFeat } from "@/lib/pf2/defaults";
import type { ActionCost, Character, Feat, FeatType } from "@/lib/pf2/types";
import { ActionMarks, Btn, GrowText, NumField, Section, SelectField, TextField, type Patch } from "@/components/sheet/bits";
import { cn } from "@/lib/utils";

export function Feats({ character, patch }: { character: Character; patch: Patch }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FeatType | "all">("all");
  const shown = character.feats.filter((feat) => filter === "all" || feat.type === filter);
  const setFeat = (id: string, recipe: (feat: Feat) => Feat) =>
    patch((c) => ({ ...c, feats: c.feats.map((feat) => (feat.id === id ? recipe(feat) : feat)) }));

  const add = () => {
    const feat = makeFeat({ level: character.level, description: "" });
    patch((c) => ({ ...c, feats: [...c.feats, feat] }));
    setOpen((state) => ({ ...state, [feat.id]: true }));
  };

  return (
    <Section
      title="Черты и особенности"
      kicker="Описание растягивается целиком"
      extra={
        <Btn tone="blood" onClick={add}>
          <Plus className="size-4" /> Черта
        </Btn>
      }
    >
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <FilterChip on={filter === "all"} label="Все" onClick={() => setFilter("all")} />
        {FEAT_TYPES.map((type) => (
          <FilterChip key={type.id} on={filter === type.id} label={type.label} onClick={() => setFilter(type.id)} />
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="text-sm text-muted">Пока пусто. Добавляйте черты народа, класса, навыков и общие — без лимита строк, текст можно вписать полностью.</p>
      ) : null}
      <ul className="flex flex-col gap-2">
        {shown.map((feat) => {
          const expanded = open[feat.id] ?? feat.description.length < 180;
          return (
            <li key={feat.id} className="rounded-md border border-line bg-paper-2">
              <div className="flex items-center gap-2 p-2">
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center text-blood"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Свернуть" : "Развернуть"}
                  onClick={() => setOpen((state) => ({ ...state, [feat.id]: !expanded }))}
                >
                  <ChevronDown className={cn("size-5 transition-transform", expanded && "rotate-180")} />
                </button>
                {feat.actionCost ? <ActionMarks cost={feat.actionCost} /> : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{feat.name || "Без названия"}</p>
                  <p className="truncate text-sm text-muted">
                    {feat.level ? `${feat.level} ур. · ` : ""}
                    {FEAT_TYPES.find((type) => type.id === feat.type)?.label}
                    {feat.traits ? ` · ${feat.traits}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center text-blood"
                  aria-label="Удалить черту"
                  onClick={() => patch((c) => ({ ...c, feats: c.feats.filter((item) => item.id !== feat.id) }))}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {expanded ? (
                <div className="grid gap-2 border-t border-line p-3 sm:grid-cols-2">
                  <TextField label="Название" value={feat.name} onChange={(name) => setFeat(feat.id, (item) => ({ ...item, name }))} />
                  <NumField label="Уровень" value={feat.level ?? 1} min={1} max={20} onChange={(level) => setFeat(feat.id, (item) => ({ ...item, level }))} />
                  <SelectField label="Тип" value={feat.type} onChange={(type) => setFeat(feat.id, (item) => ({ ...item, type }))} options={FEAT_TYPES} />
                  <SelectField
                    label="Цена действия"
                    value={(feat.actionCost || "none") as ActionCost | "none"}
                    onChange={(actionCost) => setFeat(feat.id, (item) => ({ ...item, actionCost: actionCost === "none" ? "" : actionCost }))}
                    options={[{ id: "none" as const, label: "Нет" }, ...ACTION_COSTS]}
                  />
                  <div className="sm:col-span-2">
                    <TextField label="Дескрипторы" value={feat.traits} onChange={(traits) => setFeat(feat.id, (item) => ({ ...item, traits }))} placeholder="черти, концентрация…" />
                  </div>
                  <div className="sm:col-span-2">
                    <GrowText
                      label="Полное описание"
                      value={feat.description}
                      onChange={(description) => setFeat(feat.id, (item) => ({ ...item, description }))}
                      placeholder="Впишите текст черты целиком: что делает, когда, какие кости и ограничения."
                      rows={5}
                    />
                  </div>
                </div>
              ) : feat.description ? (
                <p className="line-clamp-2 px-3 pb-3 text-sm text-muted">{feat.description}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function FilterChip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 shrink-0 rounded-full border px-3 text-sm font-semibold",
        on ? "border-blood bg-blood text-paper" : "border-line bg-paper text-ink",
      )}
    >
      {label}
    </button>
  );
}
