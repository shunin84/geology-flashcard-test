import { describe, it, expect, beforeEach } from 'vitest';
import { useCardStore } from './useCardStore';

describe('useCardStore', () => {
  beforeEach(() => {
    // ストアを初期状態に戻す
    useCardStore.setState({
      filter: {
        chapters: [],
        termIds: [],
        tags: [],
        showOnlyUnlearned: false,
        showOnlyFlagged: false,
        includeSupplemental: true,
      },
      currentIndex: 5,
      isFlipped: true,
      isShuffleEnabled: false,
    });
  });

  it('setFilter時にcurrentIndexが0にリセットされること', () => {
    const { setFilter } = useCardStore.getState();
    setFilter({ chapters: [3] });
    expect(useCardStore.getState().currentIndex).toBe(0);
  });

  it('setFilter時にisFlippedがfalseにリセットされること', () => {
    const { setFilter } = useCardStore.getState();
    setFilter({ showOnlyUnlearned: true });
    expect(useCardStore.getState().isFlipped).toBe(false);
  });

  it('resetFilters時にフィルターが初期状態に戻ること', () => {
    const { setFilter, resetFilters } = useCardStore.getState();
    setFilter({ chapters: [2, 3], showOnlyFlagged: true });
    resetFilters();
    const { filter, currentIndex } = useCardStore.getState();
    expect(filter.chapters).toEqual([]);
    expect(filter.showOnlyFlagged).toBe(false);
    expect(currentIndex).toBe(0);
  });

  it('flip時にisFlippedがトグルされること', () => {
    useCardStore.setState({ isFlipped: false });
    useCardStore.getState().flip();
    expect(useCardStore.getState().isFlipped).toBe(true);
    useCardStore.getState().flip();
    expect(useCardStore.getState().isFlipped).toBe(false);
  });

  it('goNext時に次のインデックスへ進むこと', () => {
    useCardStore.setState({ currentIndex: 0, isFlipped: true });
    useCardStore.getState().goNext(5);
    expect(useCardStore.getState().currentIndex).toBe(1);
    expect(useCardStore.getState().isFlipped).toBe(false);
  });

  it('goNext時に最後のカードからは先頭に戻ること', () => {
    useCardStore.setState({ currentIndex: 4 });
    useCardStore.getState().goNext(5);
    expect(useCardStore.getState().currentIndex).toBe(0);
  });

  it('goPrev時に前のインデックスへ戻ること', () => {
    useCardStore.setState({ currentIndex: 3 });
    useCardStore.getState().goPrev(5);
    expect(useCardStore.getState().currentIndex).toBe(2);
  });

  it('goPrev時に先頭のカードからは末尾に戻ること', () => {
    useCardStore.setState({ currentIndex: 0 });
    useCardStore.getState().goPrev(5);
    expect(useCardStore.getState().currentIndex).toBe(4);
  });

  it('setShuffleEnabled時にcurrentIndexが0にリセットされること', () => {
    useCardStore.setState({ currentIndex: 3 });
    useCardStore.getState().setShuffleEnabled(true);
    expect(useCardStore.getState().currentIndex).toBe(0);
    expect(useCardStore.getState().isShuffleEnabled).toBe(true);
  });
});
