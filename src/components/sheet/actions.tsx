import { Plus, Trash2 } from "lucide-react";
import { ACTION_COSTS } from "@/lib/pf2/data";
import { makeAction } from "@/lib/pf2/defaults";
import type { Character, ActionEntry } from "@/lib/pf2/types";
import { ActionMarks, Btn, GrowText, Section, SelectField, TextField, type Patch } from "@/components/sheet/bits";

export function Actions({ character, patch }: { character: Character; patch: Patch }) {
  const setAction = (id: string, recipe: (action: ActionEntry) => ActionEntry) =>
    patch((c) => ({ ...c, actions: c.actions.map((action) => (action.id === id ? recipe(action) : action)) }));

  return (
    <Section
      title="Действия"
      kicker="Столько, сколько нужно за столом"
      extra={
        <Btn tone="blood" onClick={() => patch((c) => ({ ...c, actions: [...c.actions, makeAction({ name: "Новое действие" })] }))}>
          <Plus className="size-4" /> Действие
        </Btn>
      }
    >
      <p className="mb-3 text-sm text-muted">
        Сюда — всё, что вы делаете в бою и вне его: классовые действия, реакции, фокусы, приёмы. Поле описания растёт вместе с текстом.
      </p>
      {character.actions.length === 0 ? <p className="text-sm text-muted">Добавьте первое действие.</p> : null}
      <ul className="flex flex-col gap-3">
        {character.actions.map((action) => (
          <li key={action.id} className="rounded-md border border-line bg-paper-2 p-3">
            <div className="flex items-start gap-2">
              <ActionMarks cost={action.cost} />
              <div className="min-w-0 flex-1">
                <TextField value={action.name} onChange={(name) => setAction(action.id, (item) => ({ ...item, name }))} placeholder="Название" />
              </div>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center text-blood"
                aria-label="Удалить действие"
                onClick={() => patch((c) => ({ ...c, actions: c.actions.filter((item) => item.id !== action.id) }))}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <SelectField label="Цена" value={action.cost} onChange={(cost) => setAction(action.id, (item) => ({ ...item, cost }))} options={ACTION_COSTS} />
              <TextField label="Частота" value={action.frequency} onChange={(frequency) => setAction(action.id, (item) => ({ ...item, frequency }))} placeholder="1/ход, 1/день…" />
              <TextField label="Дескрипторы" value={action.traits} onChange={(traits) => setAction(action.id, (item) => ({ ...item, traits }))} />
              <TextField label="Триггер" value={action.trigger} onChange={(trigger) => setAction(action.id, (item) => ({ ...item, trigger }))} placeholder="для реакций" />
              <div className="sm:col-span-2">
                <TextField label="Условия" value={action.requirements} onChange={(requirements) => setAction(action.id, (item) => ({ ...item, requirements }))} />
              </div>
              <div className="sm:col-span-2">
                <GrowText
                  label="Описание"
                  value={action.description}
                  onChange={(description) => setAction(action.id, (item) => ({ ...item, description }))}
                  rows={4}
                  placeholder="Что происходит при успехе, провале и крите. Пишите столько, сколько нужно."
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Btn onClick={() => patch((c) => ({ ...c, actions: [...c.actions, makeAction()] }))}>
          <Plus className="size-4" /> Ещё действие
        </Btn>
      </div>
    </Section>
  );
}
