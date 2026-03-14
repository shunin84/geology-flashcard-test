import { useState, useEffect, useCallback } from 'react';
import type { FactCard } from './types';
import { loadFactCards } from './data/loadFactCards';
import { useCardStore } from './store/useCardStore';
import { useProgressStore } from './store/useProgressStore';
import { useFlashCards } from './hooks/useFlashCards';
import { ChapterSelect } from './components/ChapterSelect/ChapterSelect';
import { CardDeck } from './components/CardDeck/CardDeck';
import { ProgressBar } from './components/ProgressBar/ProgressBar';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { StatusPanel } from './components/StatusPanel/StatusPanel';

type LoadState =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'loaded'; cards: FactCard[] };

type Screen = 'chapter-select' | 'cards';

function App() {
  const [loadState, setLoadState] = useState<LoadState>({ type: 'loading' });
  const [screen, setScreen] = useState<Screen>('chapter-select');

  const { filter, setFilter, resetFilters, isShuffleEnabled } = useCardStore();
  const { progressById } = useProgressStore();

  const allCards = loadState.type === 'loaded' ? loadState.cards : [];
  const { filteredCards, learnedCount, flaggedCount } = useFlashCards(
    allCards,
    filter,
    progressById,
    isShuffleEnabled
  );

  const fetchCards = useCallback(() => {
    setLoadState({ type: 'loading' });
    loadFactCards()
      .then((cards) => setLoadState({ type: 'loaded', cards }))
      .catch((err: Error) => setLoadState({ type: 'error', message: err.message }));
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleChapterSelect = (chapters: number[]) => {
    setFilter({ chapters });
    setScreen('cards');
  };

  const handleBackToChapterSelect = () => {
    resetFilters();
    setScreen('chapter-select');
  };

  // 選択中の章ラベルを取得
  const selectedChapterLabel = (() => {
    if (filter.chapters.length === 0) return '全章';
    const chapterLabelMap = new Map<number, string>();
    for (const card of allCards) {
      for (let i = 0; i < card.chapters.length; i++) {
        if (!chapterLabelMap.has(card.chapters[i])) {
          chapterLabelMap.set(card.chapters[i], card.chapterLabels[i]);
        }
      }
    }
    return filter.chapters
      .sort((a, b) => a - b)
      .map((ch) => chapterLabelMap.get(ch) ?? `第${ch}章`)
      .join('・');
  })();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0.75rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-content-width)',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <h1
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            地質調査技士 一問一答カード
          </h1>

          {screen === 'cards' && loadState.type === 'loaded' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {selectedChapterLabel}　{filteredCards.length}枚
              </span>
              <button
                onClick={handleBackToChapterSelect}
                aria-label="章選択に戻る"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: '2px solid var(--color-border)',
                  borderRadius: '50%',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </header>

      <main
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {loadState.type === 'loading' && <StatusPanel status="loading" />}

        {loadState.type === 'error' && (
          <StatusPanel status="error" message={loadState.message} onReload={fetchCards} />
        )}

        {loadState.type === 'loaded' && screen === 'chapter-select' && (
          <ChapterSelect allCards={allCards} onSelect={handleChapterSelect} />
        )}

        {loadState.type === 'loaded' && screen === 'cards' && (
          <>
            <ProgressBar
              learnedCount={learnedCount}
              total={filteredCards.length}
              flaggedCount={flaggedCount}
            />

            {filteredCards.length === 0 ? (
              <StatusPanel status="empty" />
            ) : (
              <CardDeck cards={filteredCards} />
            )}

            <FilterPanel
              allCards={allCards}
              filter={filter}
              onFilterChange={setFilter}
              onReset={resetFilters}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
