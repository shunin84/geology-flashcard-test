import { useMemo, useRef } from 'react';
import type { FactCard, FilterState, CardProgress } from '../types';

function shuffleArray<T>(arr: T[], seed: number): T[] {
  // シード付きの擬似ランダム（シード固定による安定したシャッフル）
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useFlashCards(
  allCards: FactCard[],
  filter: FilterState,
  progressById: Record<string, CardProgress>,
  isShuffleEnabled: boolean
): {
  filteredCards: FactCard[];
  learnedCount: number;
  flaggedCount: number;
} {
  // シャッフル用シードをフィルター変更時に再生成
  const shuffleSeedRef = useRef(Date.now());
  const prevFilterRef = useRef<string>('');
  const filterKey = JSON.stringify(filter);
  if (filterKey !== prevFilterRef.current) {
    shuffleSeedRef.current = Date.now();
    prevFilterRef.current = filterKey;
  }

  const filteredCards = useMemo(() => {
    let cards = allCards;

    // 章フィルター
    if (filter.chapters.length > 0) {
      cards = cards.filter((card) =>
        card.chapters.some((ch) => filter.chapters.includes(ch))
      );
    }

    // 用語フィルター
    if (filter.termIds.length > 0) {
      cards = cards.filter((card) => filter.termIds.includes(card.termId));
    }

    // タグフィルター
    if (filter.tags.length > 0) {
      cards = cards.filter((card) =>
        card.tags.some((tag) => filter.tags.includes(tag))
      );
    }

    // 予想問題フィルター
    if (!filter.includeSupplemental) {
      cards = cards.filter((card) => !card.isSupplementalOnly);
    }

    // 未学習フィルター
    if (filter.showOnlyUnlearned) {
      cards = cards.filter((card) => !progressById[card.cardId]?.learned);
    }

    // 要復習フィルター
    if (filter.showOnlyFlagged) {
      cards = cards.filter((card) => !!progressById[card.cardId]?.flagged);
    }

    // シャッフル
    if (isShuffleEnabled) {
      return shuffleArray(cards, shuffleSeedRef.current);
    }

    return cards;
  }, [allCards, filter, progressById, isShuffleEnabled]);

  const learnedCount = useMemo(
    () => filteredCards.filter((card) => !!progressById[card.cardId]?.learned).length,
    [filteredCards, progressById]
  );

  const flaggedCount = useMemo(
    () => filteredCards.filter((card) => !!progressById[card.cardId]?.flagged).length,
    [filteredCards, progressById]
  );

  return { filteredCards, learnedCount, flaggedCount };
}
