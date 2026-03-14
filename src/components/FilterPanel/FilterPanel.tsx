import type { FactCard, FilterState } from '../../types';
import styles from './FilterPanel.module.css';

type Props = {
  allCards: FactCard[];
  filter: FilterState;
  onFilterChange: (partial: Partial<FilterState>) => void;
  onReset: () => void;
};

export function FilterPanel({ allCards, filter, onFilterChange, onReset }: Props) {
  // 利用可能な章を収集
  const availableChapters = Array.from(
    new Set(allCards.flatMap((c) => c.chapters))
  ).sort((a, b) => a - b);

  const chapterLabelMap = new Map<number, string>();
  for (const card of allCards) {
    for (let i = 0; i < card.chapters.length; i++) {
      if (!chapterLabelMap.has(card.chapters[i])) {
        chapterLabelMap.set(card.chapters[i], card.chapterLabels[i]);
      }
    }
  }

  const hasSupplementalCards = allCards.some((c) => c.isSupplementalOnly);

  const toggleChapter = (ch: number) => {
    const current = filter.chapters;
    const next = current.includes(ch) ? current.filter((c) => c !== ch) : [...current, ch];
    onFilterChange({ chapters: next });
  };

  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>
        <span>絞り込み</span>
        <span className={styles.chevron}>▶</span>
      </summary>
      <div className={styles.content}>
        {/* 章フィルター */}
        {availableChapters.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>章</span>
            <div className={styles.checkboxGroup}>
              {availableChapters.map((ch) => (
                <label key={ch} className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={filter.chapters.includes(ch)}
                    onChange={() => toggleChapter(ch)}
                  />
                  {chapterLabelMap.get(ch) ?? `第${ch}章`}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 表示フィルター */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>表示対象</span>
          <div className={styles.toggleGroup}>
            <button
              className={styles.toggleBtn}
              aria-pressed={filter.showOnlyUnlearned}
              onClick={() => onFilterChange({ showOnlyUnlearned: !filter.showOnlyUnlearned })}
            >
              未学習のみ
            </button>
            <button
              className={styles.toggleBtn}
              aria-pressed={filter.showOnlyFlagged}
              onClick={() => onFilterChange({ showOnlyFlagged: !filter.showOnlyFlagged })}
            >
              要復習のみ
            </button>
            {hasSupplementalCards && (
              <button
                className={styles.toggleBtn}
                aria-pressed={!filter.includeSupplemental}
                onClick={() =>
                  onFilterChange({ includeSupplemental: !filter.includeSupplemental })
                }
              >
                予想問題を除く
              </button>
            )}
          </div>
        </div>

        <button className={styles.resetBtn} onClick={onReset}>
          フィルターをリセット
        </button>
      </div>
    </details>
  );
}
