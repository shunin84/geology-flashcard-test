import { create } from 'zustand';
import type { CardProgress } from '../types';

const STORAGE_KEY = 'fact-cards-progress';

type ProgressStore = {
  progressById: Record<string, CardProgress>;
  markLearned: (cardId: string, learned?: boolean) => void;
  toggleFlag: (cardId: string) => void;
  resetProgress: () => void;
};

function loadFromStorage(): Record<string, CardProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CardProgress>;
  } catch {
    return {};
  }
}

function saveToStorage(progressById: Record<string, CardProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressById));
  } catch {
    // LocalStorage への書き込み失敗は無視
  }
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progressById: loadFromStorage(),

  markLearned: (cardId, learned = true) => {
    const current = get().progressById[cardId] ?? { learned: false, flagged: false };
    const updated = {
      ...get().progressById,
      [cardId]: { ...current, learned },
    };
    saveToStorage(updated);
    set({ progressById: updated });
  },

  toggleFlag: (cardId) => {
    const current = get().progressById[cardId] ?? { learned: false, flagged: false };
    const updated = {
      ...get().progressById,
      [cardId]: { ...current, flagged: !current.flagged },
    };
    saveToStorage(updated);
    set({ progressById: updated });
  },

  resetProgress: () => {
    saveToStorage({});
    set({ progressById: {} });
  },
}));
