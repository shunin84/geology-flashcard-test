import type { FactCard } from '../../types';
import styles from './FlashCard.module.css';

type Props = {
  card: FactCard;
  isFlipped: boolean;
  onFlip: () => void;
};

export function FlashCard({ card, isFlipped, onFlip }: Props) {
  return (
    <div className={styles.cardWrapper}>
      {/* 表面 */}
      <div
        className={`${styles.cardFront} ${isFlipped ? styles.faceHidden : ''}`}
        aria-hidden={isFlipped}
        data-testid="card-front"
      >
        <p className={styles.promptText}>{card.prompt}</p>
        <button
          className={styles.flipButton}
          onClick={onFlip}
          aria-label="答えを見る"
        >
          答えを見る
        </button>
      </div>

      {/* 裏面 */}
      <div
        className={`${styles.cardBack} ${!isFlipped ? styles.faceHidden : ''}`}
        aria-hidden={!isFlipped}
        data-testid="card-back"
      >
        <p className={styles.answerLabel}>答え</p>
        <p className={styles.answerText}>{card.answer}</p>
        {card.detail && (
          <p className={styles.detailText}>{card.detail}</p>
        )}
        <div className={styles.sourceRefs}>
          {card.sourceRefs.map((ref) => (
            <span
              key={`${ref.occurrenceId}-${ref.yearKey}`}
              className={`${styles.sourceTag} ${ref.isSupplemental ? styles.sourceTagSupplemental : ''}`}
            >
              {ref.chapterLabel} / {ref.yearLabel}
              {ref.isSupplemental ? ' (予想問題)' : ' (過去問)'}
            </span>
          ))}
        </div>
        <button
          className={styles.backButton}
          onClick={onFlip}
          aria-label="問題に戻る"
        >
          ↩ 問題に戻る
        </button>
      </div>
    </div>
  );
}
