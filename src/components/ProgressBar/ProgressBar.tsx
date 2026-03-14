import styles from './ProgressBar.module.css';

type Props = {
  learnedCount: number;
  total: number;
  flaggedCount?: number;
};

export function ProgressBar({ learnedCount, total, flaggedCount }: Props) {
  const percent = total > 0 ? Math.round((learnedCount / total) * 100) : 0;

  return (
    <div className={styles.progressBar} role="region" aria-label="学習進捗">
      <div className={styles.label}>
        <span>
          学習済み: <span className={styles.count}>{learnedCount}</span> / {total}
          {flaggedCount !== undefined && flaggedCount > 0 && (
            <span style={{ marginLeft: '0.75rem', color: 'var(--color-flag)' }}>
              要復習: {flaggedCount}
            </span>
          )}
        </span>
        <span>{percent}%</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={learnedCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${total}枚中${learnedCount}枚学習済み`}
        />
      </div>
    </div>
  );
}
