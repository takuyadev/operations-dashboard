import { cx } from "@utilities/cx";
import { Icon } from "@components/Icon/Icon";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange?: (page: number) => void;
  /** Names the thing being paged, for screen readers ("reports"). */
  label?: string;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  label = "results",
  className,
}: PaginationProps) {
  const go = (next: number) => {
    if (next >= 1 && next <= totalPages) onChange?.(next);
  };

  return (
    <div className={cx(styles.pagination, className)}>
      <button
        type="button"
        className={styles.arrow}
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label={`Previous page of ${label}`}
      >
        <Icon name="chevron-left" size={22} />
      </button>
      <span className={styles.status} aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className={styles.arrow}
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label={`Next page of ${label}`}
      >
        <Icon name="chevron-right" size={22} />
      </button>
    </div>
  );
}
