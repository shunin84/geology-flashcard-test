import { useRef, useEffect } from 'react';
import type { FactCard } from '../../types';
import styles from './FlashCard.module.css';

type Props = {
  card: FactCard;
  isFlipped: boolean;
  onFlip: () => void;
};

export function FlashCard({ card, isFlipped, onFlip }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    const back = backRef.current;
    if (!wrapper || !inner || !back) return;

    if (isFlipped) {
      const h = back.scrollHeight;
      wrapper.style.minHeight = `${h}px`;
      inner.style.minHeight = `${h}px`;
    } else {
      wrapper.style.minHeight = '';
      inner.style.minHeight = '';
    }
  }, [isFlipped, card]);

  return (
    <div className={styles.cardWrapper} ref={wrapperRef}>
      <div className={`${styles.cardInner} ${isFlipped ? styles.flipped : ''}`} ref={innerRef}>
        {/* 表面 */}
        <div className={styles.cardFront} aria-hidden={isFlipped} data-testid="card-front">
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
          className={styles.cardBack}
          aria-hidden={!isFlipped}
          data-testid="card-back"
          onClick={onFlip}
          role="button"
          tabIndex={isFlipped ? 0 : -1}
          aria-label="問題に戻る（タップで戻る）"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFlip(); }}
          ref={backRef}
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
        </div>
      </div>
    </div>
  );
}
