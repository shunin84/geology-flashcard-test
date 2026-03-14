import type { FactCard } from '../../types';
import styles from './ChapterSelect.module.css';

type Props = {
  allCards: FactCard[];
  onSelect: (chapters: number[]) => void;
};

export function ChapterSelect({ allCards, onSelect }: Props) {
  // カードから章情報を収集
  const chapterLabelMap = new Map<number, string>();
  for (const card of allCards) {
    for (let i = 0; i < card.chapters.length; i++) {
      if (!chapterLabelMap.has(card.chapters[i])) {
        chapterLabelMap.set(card.chapters[i], card.chapterLabels[i]);
      }
    }
  }

  const availableChapters = Array.from(chapterLabelMap.keys()).sort((a, b) => a - b);

  const countByChapter = (ch: number) =>
    allCards.filter((c) => c.chapters.includes(ch)).length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <h2 className={styles.title}>どの章から始めますか？</h2>
          <p className={styles.sub}>章を選んでカード学習を開始します</p>
        </div>

        <div className={styles.grid}>
          {availableChapters.map((ch) => {
            const label = chapterLabelMap.get(ch) ?? `第${ch}章`;
            const count = countByChapter(ch);
            return (
              <button
                key={ch}
                className={styles.chapterBtn}
                onClick={() => onSelect([ch])}
              >
                <span className={styles.chapterLabel}>{label}</span>
                <span className={styles.chapterCount}>{count}枚</span>
              </button>
            );
          })}
        </div>

        <button
          className={styles.allBtn}
          onClick={() => onSelect([])}
        >
          全章まとめて（{allCards.length}枚）
        </button>
      </div>
    </div>
  );
}
