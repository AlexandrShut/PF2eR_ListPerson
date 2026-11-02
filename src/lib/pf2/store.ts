import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { makeSample, normalizeCharacter } from "@/lib/pf2/defaults";
import type { Character } from "@/lib/pf2/types";

type SheetState = {
  characters: Character[];
  activeId: string | null;
  setActive: (id: string | null) => void;
  add: (character: Character) => void;
  remove: (id: string) => void;
  update: (id: string, recipe: (character: Character) => Character) => void;
  replaceAll: (characters: Character[], activeId: string | null) => void;
};

const memory = new Map<string, string>();

const storage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return memory.get(key) ?? null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") memory.set(key, value);
    else localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") memory.delete(key);
    else localStorage.removeItem(key);
  },
};

export const useSheet = create<SheetState>()(
  persist(
    (set) => ({
      characters: [],
      activeId: null,
      setActive: (id) => set({ activeId: id }),
      add: (character) =>
        set((state) => ({
          characters: [character, ...state.characters],
          activeId: character.id,
        })),
      remove: (id) =>
        set((state) => {
          const characters = state.characters.filter((character) => character.id !== id);
          const activeId = state.activeId === id ? (characters[0]?.id ?? null) : state.activeId;
          return { characters, activeId };
        }),
      update: (id, recipe) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === id ? recipe(character) : character,
          ),
        })),
      replaceAll: (characters, activeId) => set({ characters, activeId }),
    }),
    {
      name: "grimuar-pf2",
      version: 1,
      storage: createJSONStorage(() => storage),
      merge: (persisted, current) => {
        const data = (persisted ?? {}) as Partial<SheetState>;
        const characters = (data.characters ?? [])
          .map((character) => normalizeCharacter(character))
          .filter((character): character is Character => character !== null);
        return {
          ...current,
          characters,
          activeId: data.activeId ?? null,
        };
      },
    },
  ),
);

export function ensureSeed(): void {
  const state = useSheet.getState();
  if (state.characters.length === 0) {
    const sample = makeSample();
    useSheet.setState({ characters: [sample], activeId: sample.id });
    return;
  }
  if (!state.activeId || !state.characters.some((character) => character.id === state.activeId)) {
    useSheet.setState({ activeId: state.characters[0]?.id ?? null });
  }
}
