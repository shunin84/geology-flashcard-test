import type { FactCard } from '../../types';
import styles from './ChapterSelect.module.css';

const CHAPTER_SUBTITLES: Record<number, string> = {
  1: '社会一般・行政・入札契約等',
  2: '地質・土質の基礎',
  3: '調査・試験',
  4: '計画・実施・管理',
  5: '解析・評価',
  6: '機器・器具等の取り扱い',
};

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
            const subtitle = CHAPTER_SUBTITLES[ch];
            const count = countByChapter(ch);
            return (
              <button
                key={ch}
                className={styles.chapterBtn}
                onClick={() => onSelect([ch])}
              >
                <span className={styles.chapterLabel}>{label}</span>
                {subtitle && (
                  <span className={styles.chapterSubtitle}>{subtitle}</span>
                )}
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
