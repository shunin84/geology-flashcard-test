import type { FactCard } from '../../types';
import { useCardStore } from '../../store/useCardStore';
import { useProgressStore } from '../../store/useProgressStore';
import { FlashCard } from '../FlashCard/FlashCard';
import styles from './CardDeck.module.css';

type Props = {
  cards: FactCard[];
};

export function CardDeck({ cards }: Props) {
  const { currentIndex, isFlipped, isShuffleEnabled, flip, goNext, goPrev, setShuffleEnabled } =
    useCardStore();
  const { progressById, markLearned, toggleFlag } = useProgressStore();

  if (cards.length === 0) {
    return null;
  }

  // currentIndex が範囲外の場合は先頭カードを表示
  const safeIndex = Math.min(currentIndex, cards.length - 1);
  const card = cards[safeIndex];
  const progress = progressById[card.cardId] ?? { learned: false, flagged: false };

  const handleLearned = () => {
    markLearned(card.cardId, !progress.learned);
  };

  const handleFlag = () => {
    toggleFlag(card.cardId);
  };

  return (
    <div className={styles.deck}>
      <div className={styles.meta}>
        <span className={styles.termName}>{card.termName}</span>
        <span className={styles.position}>
          {safeIndex + 1} / {cards.length}
        </span>
      </div>

      <FlashCard card={card} isFlipped={isFlipped} onFlip={flip} />

      <div className={styles.controls}>
        <div className={styles.navRow}>
          <button
            className={`${styles.btn} ${styles.btnNav}`}
            onClick={() => goPrev(cards.length)}
            aria-label="前のカードへ"
          >
            ← 前の問題へ
          </button>
          <button
            className={`${styles.btn} ${styles.btnNav}`}
            onClick={() => goNext(cards.length)}
            aria-label="次のカードへ"
          >
            次の問題へ →
          </button>
        </div>
        <div className={styles.actionRow}>
          <button
            className={`${styles.btn} ${styles.btnLearned}`}
            onClick={handleLearned}
            aria-pressed={progress.learned}
            aria-label={progress.learned ? '学習済みを解除' : '学習済みにする'}
          >
            {progress.learned ? '✓ 学習済み' : '学習済み'}
          </button>
          <button
            className={`${styles.btn} ${styles.btnFlag}`}
            onClick={handleFlag}
            aria-pressed={progress.flagged}
            aria-label={progress.flagged ? '要復習を解除' : '要復習にする'}
          >
            {progress.flagged ? '★ 要復習' : '要復習'}
          </button>
          <button
            className={`${styles.btn} ${styles.btnShuffle}`}
            onClick={() => setShuffleEnabled(!isShuffleEnabled)}
            aria-pressed={isShuffleEnabled}
            aria-label={isShuffleEnabled ? 'シャッフルをオフにする' : 'シャッフルをオンにする'}
          >
            シャッフル
          </button>
        </div>
      </div>
    </div>
  );
}
