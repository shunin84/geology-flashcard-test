import type { FactCard } from '../../types';
import styles from './ChapterSelect.module.css';

const CHAPTER_SUBTITLES: Record<number, string> = {
  1: '社会一般・行政・入札契約等',
  2: '地質、測量、土木、建築等の知識',
  3: '現場技術の知識',
  4: '調査技術の理解度',
  5: '解析手法、設計・施工への適用',
  6: '管理技法',
};

// カードがなくても表示する章の定義
const ALL_CHAPTERS: { ch: number; label: string }[] = [
  { ch: 1, label: '第1章' },
  { ch: 2, label: '第2章' },
  { ch: 3, label: '第3章' },
  { ch: 4, label: '第4章' },
  { ch: 5, label: '第5章' },
  { ch: 6, label: '第6章' },
];

type Props = {
  allCards: FactCard[];
  onSelect: (chapters: number[]) => void;
};

export function ChapterSelect({ allCards, onSelect }: Props) {
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
          {ALL_CHAPTERS.map(({ ch, label }) => {
            const subtitle = CHAPTER_SUBTITLES[ch];
            const count = countByChapter(ch);
            const isEmpty = count === 0;
            return (
              <button
                key={ch}
                className={`${styles.chapterBtn} ${isEmpty ? styles.chapterBtnEmpty : ''}`}
                onClick={() => !isEmpty && onSelect([ch])}
                disabled={isEmpty}
              >
                <span className={styles.chapterLabel}>{label}</span>
                {subtitle && (
                  <span className={styles.chapterSubtitle}>{subtitle}</span>
                )}
                <span className={styles.chapterCount}>
                  {isEmpty ? '準備中' : `${count}枚`}
                </span>
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
