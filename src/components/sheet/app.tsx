import { BookOpen, Copy, Download, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Actions } from "@/components/sheet/actions";
import { Bio } from "@/components/sheet/bio";
import { Combat } from "@/components/sheet/combat";
import { Feats } from "@/components/sheet/feats";
import { Gear } from "@/components/sheet/gear";
import { Magic } from "@/components/sheet/magic";
import { RollProvider } from "@/components/sheet/roller";
import { Skills } from "@/components/sheet/skills";
import { Strikes } from "@/components/sheet/strikes";
import { acBreakdown, currentHp, maxHp } from "@/lib/pf2/calc";
import { blankCharacter, makeSample, normalizeCharacter, SAMPLE_ID, uid } from "@/lib/pf2/defaults";
import { ensureSeed, useSheet } from "@/lib/pf2/store";
import type { Character } from "@/lib/pf2/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "combat", label: "Бой" },
  { id: "skills", label: "Навыки" },
  { id: "strikes", label: "Атаки" },
  { id: "feats", label: "Черты" },
  { id: "actions", label: "Действия" },
  { id: "magic", label: "Магия" },
  { id: "gear", label: "Сумка" },
  { id: "bio", label: "Личность" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const finish = () => {
      ensureSeed();
      setHydrated(true);
    };
    const unsub = useSheet.persist.onFinishHydration(finish);
    if (useSheet.persist.hasHydrated()) finish();
    return () => {
      unsub();
    };
  }, []);
  return hydrated;
}

export function App() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-desk text-paper">
        <p className="font-display text-4xl">Гримуар</p>
      </div>
    );
  }
  return (
    <RollProvider>
      <Shell />
    </RollProvider>
  );
}

function Shell() {
  const characters = useSheet((state) => state.characters);
  const activeId = useSheet((state) => state.activeId);
  const setActive = useSheet((state) => state.setActive);
  const add = useSheet((state) => state.add);
  const remove = useSheet((state) => state.remove);
  const update = useSheet((state) => state.update);
  const [tab, setTab] = useState<TabId>("combat");
  const [library, setLibrary] = useState(false);
  const character = characters.find((item) => item.id === activeId) ?? null;

  const patch = (recipe: (character: Character) => Character) => {
    if (!character) return;
    update(character.id, (current) => ({ ...recipe(current), updatedAt: Date.now() }));
  };

  const openNew = () => {
    add(blankCharacter());
    setLibrary(false);
    setTab("combat");
  };

  if (library || !character) {
    return (
      <Library
        characters={characters}
        onOpen={(id) => {
          setActive(id);
          setLibrary(false);
          setTab("combat");
        }}
        onNew={openNew}
        onSample={() => {
          add(makeSample());
          setLibrary(false);
        }}
        onDelete={remove}
        onDuplicate={(source) => {
          const copy = normalizeCharacter(structuredClone(source));
          if (!copy) return;
          add({ ...copy, id: uid(), name: `${source.name} — копия` });
        }}
        onImport={(list) => {
          list.forEach((item, index) => add({ ...item, id: uid(), name: item.name || `Импорт ${index + 1}` }));
          setLibrary(false);
        }}
      />
    );
  }

  const hpMax = maxHp(character);
  const hp = currentHp(character);
  const ac = acBreakdown(character).total;

  return (
    <div className="min-h-screen pb-28">
      <header className="no-print sticky top-0 z-30 border-b border-desk-2 bg-desk/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 py-3">
          <button type="button" className="shrink-0 text-left" onClick={() => setLibrary(true)} aria-label="К списку персонажей">
            <span className="block font-display text-2xl leading-none text-gold-soft">Гримуар</span>
            <span className="text-xs tracking-widest text-faint uppercase">PF2 ремастер</span>
          </button>
          <input
            value={character.name}
            aria-label="Имя персонажа"
            onChange={(event) => patch((c) => ({ ...c, name: event.target.value }))}
            className="min-w-0 flex-1 bg-transparent font-display text-2xl text-paper outline-none"
          />
          <label className="flex items-center gap-1 text-sm text-gold-soft">
            ур.
            <input
              inputMode="numeric"
              aria-label="Уровень"
              value={character.level}
              onChange={(event) => {
                const level = Math.min(20, Math.max(1, Number(event.target.value) || 1));
                patch((c) => ({ ...c, level }));
              }}
              className="min-h-11 w-12 rounded-md border border-gold bg-desk px-1 text-center text-base text-paper tabular"
            />
          </label>
          <div className="hidden text-right text-sm text-gold-soft sm:block tabular">
            <div>ПЗ {hp}/{hpMax}</div>
            <div>КБ {ac}</div>
          </div>
          <div className="flex gap-1" aria-label="Пункты героизма">
            {[0, 1, 2].map((index) => {
              const on = index < character.heroPoints;
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Пункт героизма ${index + 1}`}
                  onClick={() => patch((c) => ({ ...c, heroPoints: on && index === c.heroPoints - 1 ? index : index + 1 }))}
                  className={cn("size-11 rounded-full border", on ? "border-gold bg-gold" : "border-gold-soft bg-transparent")}
                />
              );
            })}
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2" aria-label="Разделы листа">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold",
                tab === item.id ? "bg-paper text-ink" : "text-gold-soft",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-3 py-4">
        {character.id === SAMPLE_ID ? (
          <p className="no-print rounded-md border border-gold bg-desk-2 px-3 py-2 text-sm text-gold-soft">
            Это пример: эльф-следопыт 5 уровня. Цифры уже живые — нажмите на навык или атаку, чтобы бросить кость. Свой лист — кнопка «Гримуар» слева сверху.
          </p>
        ) : null}
          <p className="text-sm text-gold-soft tabular sm:hidden">
            ПЗ {hp}/{hpMax} · КБ {ac} · {character.level} уровень
          </p>
        {tab === "combat" ? <Combat character={character} patch={patch} /> : null}
        {tab === "skills" ? <Skills character={character} patch={patch} /> : null}
        {tab === "strikes" ? <Strikes character={character} patch={patch} /> : null}
        {tab === "feats" ? <Feats character={character} patch={patch} /> : null}
        {tab === "actions" ? <Actions character={character} patch={patch} /> : null}
        {tab === "magic" ? <Magic character={character} patch={patch} /> : null}
        {tab === "gear" ? <Gear character={character} patch={patch} /> : null}
        {tab === "bio" ? <Bio character={character} patch={patch} /> : null}
        <footer className="px-1 pb-4 text-xs leading-relaxed text-faint">
          Гримуар — неофициальный лист по правилам Pathfinder Second Edition Remaster. Pathfinder принадлежит Paizo Inc. Этот лист не является продуктом Paizo и сделан для личной игры. Обученность задаёте вы, бонус от уровня лист прибавляет сам.
        </footer>
      </main>
    </div>
  );
}

function Library({
  characters,
  onOpen,
  onNew,
  onSample,
  onDelete,
  onDuplicate,
  onImport,
}: {
  characters: Character[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onSample: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (character: Character) => void;
  onImport: (characters: Character[]) => void;
}) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [importError, setImportError] = useState("");
  return (
    <div className="min-h-screen bg-desk text-paper">
      <header className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-xs font-semibold tracking-widest text-gold uppercase">Pathfinder 2 Remaster</p>
        <h1 className="font-display text-5xl leading-none text-gold-soft">Гримуар</h1>
        <p className="mt-3 max-w-xl text-base text-paper">
          Интерактивный лист: характеристики, КБ, навыки, спасброски, атаки и заклинания пересчитываются сами. Черты и действия можно добавлять без конца и писать целиком.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onNew} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-blood px-4 font-semibold text-paper">
            <Plus className="size-4" /> Новый персонаж
          </button>
          <button type="button" onClick={onSample} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gold px-4 font-semibold text-gold-soft">
            <BookOpen className="size-4" /> Пример следопыта
          </button>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-gold px-4 font-semibold text-gold-soft">
            <Upload className="size-4" /> Импорт
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void file.text().then((text) => {
                  try {
                    const data = JSON.parse(text) as unknown;
                    const list = (Array.isArray(data) ? data : [data])
                      .map((item) => normalizeCharacter(item))
                      .filter((item): item is Character => item !== null);
                    if (list.length) {
                      setImportError("");
                      onImport(list);
                    } else setImportError("В файле не нашлось листа персонажа.");
                  } catch {
                    setImportError("Файл не читается как JSON.");
                  }
                });
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {importError ? <p className="mt-3 text-sm text-gold-soft">{importError}</p> : null}
      </header>
      <ul className="mx-auto grid max-w-5xl gap-3 px-4 pb-16 sm:grid-cols-2">
        {characters.map((character) => {
          const hp = currentHp(character);
          const max = maxHp(character);
          return (
            <li key={character.id} className="paper p-4">
              <button type="button" className="w-full text-left" onClick={() => onOpen(character.id)}>
                <p className="font-display text-3xl leading-none text-blood">{character.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {[character.ancestry, character.className, character.subclass].filter(Boolean).join(" · ") || "Пустой лист"} · {character.level} уровень
                </p>
                <p className="mt-2 text-sm tabular text-ink">
                  ПЗ {hp}/{max} · КБ {acBreakdown(character).total}
                </p>
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="inline-flex min-h-11 items-center gap-1 rounded-md border border-line px-3 text-sm text-ink" onClick={() => download(character)}>
                  <Download className="size-4" /> JSON
                </button>
                <button type="button" className="inline-flex min-h-11 items-center gap-1 rounded-md border border-line px-3 text-sm text-ink" onClick={() => onDuplicate(character)}>
                  <Copy className="size-4" /> Копия
                </button>
                {pendingDelete === character.id ? (
                  <button type="button" className="inline-flex min-h-11 items-center gap-1 rounded-md bg-blood px-3 text-sm text-paper" onClick={() => onDelete(character.id)}>
                    Точно удалить
                  </button>
                ) : (
                  <button type="button" className="inline-flex min-h-11 items-center gap-1 rounded-md border border-line px-3 text-sm text-blood" onClick={() => setPendingDelete(character.id)}>
                    <Trash2 className="size-4" /> Удалить
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function download(character: Character) {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${character.name || "персонаж"}.grimuar.json`;
  link.click();
  URL.revokeObjectURL(url);
}
