import styles from "./MediaFrame.module.css";

interface MediaFrameProps {
  /** e.g. "Snapshot" or "Map". */
  label: string;
  /** Short state note shown on the right of the caption bar. */
  status?: string;
  /** Placeholder text shown in the frame body. */
  placeholder: string;
}

export function MediaFrame({ label, status, placeholder }: MediaFrameProps) {
  return (
    <figure className={styles.frame}>
      <figcaption className={styles.caption}>
        <span>{label}</span>
        {status ? <span className={styles.status}>{status}</span> : null}
      </figcaption>
      <div className={styles.placeholder}>{placeholder}</div>
    </figure>
  );
}
