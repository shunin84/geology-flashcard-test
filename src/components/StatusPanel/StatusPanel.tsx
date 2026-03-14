import styles from './StatusPanel.module.css';

type Props =
  | { status: 'loading' }
  | { status: 'error'; message: string; onReload: () => void }
  | { status: 'empty' };

export function StatusPanel(props: Props) {
  if (props.status === 'loading') {
    return (
      <div className={styles.panel} role="status" aria-live="polite">
        <div className={styles.spinner} aria-hidden />
        <p className={styles.message}>カードデータを読み込んでいます...</p>
      </div>
    );
  }

  if (props.status === 'error') {
    return (
      <div className={styles.panel} role="alert">
        <p className={`${styles.message} ${styles.errorMessage}`}>
          データの読み込みに失敗しました。
          <br />
          <small>{props.message}</small>
        </p>
        <button className={styles.reloadBtn} onClick={props.onReload}>
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <p className={styles.message}>
        表示できるカードがありません。
        <br />
        <small>
          フィルターの条件を変えるか、npm run build:cards でカードデータを生成してください。
        </small>
      </p>
    </div>
  );
}
