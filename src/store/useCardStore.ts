import { create } from 'zustand';
import type { FilterState } from '../types';

const DEFAULT_FILTER: FilterState = {
  chapters: [],
  termIds: [],
  tags: [],
  showOnlyUnlearned: false,
  showOnlyFlagged: false,
  includeSupplemental: true,
};

type CardStore = {
  filter: FilterState;
  currentIndex: number;
  isFlipped: boolean;
  isShuffleEnabled: boolean;
  setFilter: (partial: Partial<FilterState>) => void;
  resetFilters: () => void;
  flip: () => void;
  goNext: (total: number) => void;
  goPrev: (total: number) => void;
  resetToFront: () => void;
  setShuffleEnabled: (enabled: boolean) => void;
};

export const useCardStore = create<CardStore>((set) => ({
  filter: { ...DEFAULT_FILTER },
  currentIndex: 0,
  isFlipped: false,
  isShuffleEnabled: false,

  setFilter: (partial) => {
    set((state) => ({
      filter: { ...state.filter, ...partial },
      currentIndex: 0,
      isFlipped: false,
    }));
  },

  resetFilters: () => {
    set({
      filter: { ...DEFAULT_FILTER },
      currentIndex: 0,
      isFlipped: false,
    });
  },

  flip: () => {
    set((state) => ({ isFlipped: !state.isFlipped }));
  },

  goNext: (total) => {
    set((state) => {
      if (total === 0) return {};
      const next = state.currentIndex < total - 1 ? state.currentIndex + 1 : 0;
      return { currentIndex: next, isFlipped: false };
    });
  },

  goPrev: (total) => {
    set((state) => {
      if (total === 0) return {};
      const prev = state.currentIndex > 0 ? state.currentIndex - 1 : total - 1;
      return { currentIndex: prev, isFlipped: false };
    });
  },

  resetToFront: () => {
    set({ isFlipped: false });
  },

  setShuffleEnabled: (enabled) => {
    set({ isShuffleEnabled: enabled, currentIndex: 0, isFlipped: false });
  },
}));
