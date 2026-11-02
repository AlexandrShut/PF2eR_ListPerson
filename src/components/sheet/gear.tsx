import { Plus, Trash2 } from "lucide-react";
import { bulkOf, investedCount } from "@/lib/pf2/calc";
import { makeGear } from "@/lib/pf2/defaults";
import type { Character, GearItem } from "@/lib/pf2/types";
import { Btn, GrowText, NumField, Section, TextField, Toggle, type Patch } from "@/components/sheet/bits";

const COINS = [
  { key: "cp" as const, label: "ММ" },
  { key: "sp" as const, label: "СМ" },
  { key: "gp" as const, label: "ЗМ" },
  { key: "pp" as const, label: "ПМ" },
];

export function Gear({ character, patch }: { character: Character; patch: Patch }) {
  const bulk = bulkOf(character);
  const invested = investedCount(character);
  const setItem = (id: string, recipe: (item: GearItem) => GearItem) =>
    patch((c) => ({ ...c, gear: c.gear.map((item) => (item.id === id ? recipe(item) : item)) }));

  return (
    <div className="flex flex-col gap-4">
      <Section title="Вес" kicker="10 лёгких вещей = 1">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="font-display text-5xl leading-none text-ink tabular">
            {Number.isInteger(bulk.total) ? bulk.total : bulk.total.toFixed(1)}
          </p>
          <p className={`text-sm font-semibold ${bulk.state === "ok" ? "text-ink" : "text-blood"}`}>
            {bulk.label}. Нагруженность после {bulk.encThreshold}, предел {bulk.maxThreshold}
          </p>
        </div>
        <p className="mt-2 text-sm text-muted">
          Надетые вещи тоже весят, если вы их несёте. Снимите «при себе», чтобы оставить сундук в таверне. Инвестировано {invested} из 10.
        </p>
        {invested > 10 ? <p className="mt-1 text-sm text-blood">Больше десяти инвестированных предметов носить нельзя.</p> : null}
        <div className="mt-3">
          <Toggle on={character.coinsInBulk} label="Считать монеты (1000 = 1)" onClick={() => patch((c) => ({ ...c, coinsInBulk: !c.coinsInBulk }))} />
        </div>
      </Section>

      <Section title="Богатство">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COINS.map((coin) => (
            <NumField
              key={coin.key}
              label={coin.label}
              value={character.coins[coin.key]}
              min={0}
              max={999999}
              onChange={(value) => patch((c) => ({ ...c, coins: { ...c.coins, [coin.key]: value } }))}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Снаряжение"
        extra={
          <Btn tone="blood" onClick={() => patch((c) => ({ ...c, gear: [...c.gear, makeGear({ name: "Вещь" })] }))}>
            <Plus className="size-4" /> Вещь
          </Btn>
        }
      >
        {character.gear.length === 0 ? <p className="text-sm text-muted">Сумка пуста.</p> : null}
        <ul className="flex flex-col gap-3">
          {character.gear.map((item) => (
            <li key={item.id} className="rounded-md border border-line bg-paper-2 p-3">
              <div className="flex items-start gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <TextField label="Название" value={item.name} onChange={(name) => setItem(item.id, (gear) => ({ ...gear, name }))} />
                  </div>
                  <NumField label="Число" value={item.qty} min={1} max={999} onChange={(qty) => setItem(item.id, (gear) => ({ ...gear, qty }))} />
                  <NumField label="Вес" value={item.bulk} min={0} max={50} onChange={(bulk) => setItem(item.id, (gear) => ({ ...gear, bulk }))} />
                  <TextField label="Цена" value={item.price} onChange={(price) => setItem(item.id, (gear) => ({ ...gear, price }))} />
                </div>
                <button type="button" className="inline-flex size-11 items-center justify-center text-blood" aria-label="Удалить вещь" onClick={() => patch((c) => ({ ...c, gear: c.gear.filter((gear) => gear.id !== item.id) }))}>
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Toggle on={item.light} label="Лёгкая" onClick={() => setItem(item.id, (gear) => ({ ...gear, light: !gear.light }))} />
                <Toggle on={item.worn} label="Надето" onClick={() => setItem(item.id, (gear) => ({ ...gear, worn: !gear.worn }))} />
                <Toggle on={item.invested} label="Инвест." onClick={() => setItem(item.id, (gear) => ({ ...gear, invested: !gear.invested }))} />
                <Toggle on={item.carried} label="При себе" onClick={() => setItem(item.id, (gear) => ({ ...gear, carried: !gear.carried }))} />
              </div>
              <div className="mt-2">
                <GrowText value={item.notes} onChange={(notes) => setItem(item.id, (gear) => ({ ...gear, notes }))} rows={2} placeholder="Заметки, руны, заряды" />
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
