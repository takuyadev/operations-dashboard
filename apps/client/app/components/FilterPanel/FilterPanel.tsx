import { useState } from "react";

import { cx } from "@utilities/cx";
import { Icon } from "@components/Icon/Icon";
import { Button } from "@components/Button/Button";
import { PRIORITY_LABEL, type Priority } from "../../data/incidents";
import styles from "./FilterPanel.module.css";

export interface IncidentFilters {
  yearFrom: string;
  yearTo: string;
  priorities: Priority[];
}

export const EMPTY_FILTERS: IncidentFilters = {
  yearFrom: "",
  yearTo: "",
  priorities: [],
};

const YEARS = ["2026", "2025", "2024", "2023"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

interface FilterPanelProps {
  onApply: (filters: IncidentFilters) => void;
  onClear: () => void;
}

export function FilterPanel({ onApply, onClear }: FilterPanelProps) {
  const [draft, setDraft] = useState<IncidentFilters>(EMPTY_FILTERS);

  const togglePriority = (priority: Priority) => {
    setDraft((current) => ({
      ...current,
      priorities: current.priorities.includes(priority)
        ? current.priorities.filter((p) => p !== priority)
        : [...current.priorities, priority],
    }));
  };

  return (
    <div className={styles.groups}>
      <div className={styles.group}>
        <span className={cx("label", styles.groupLabel)}>Year</span>
        <div className={styles.years}>
          <select
            className={styles.select}
            aria-label="From year"
            value={draft.yearFrom}
            onChange={(event) =>
              setDraft((c) => ({ ...c, yearFrom: event.target.value }))
            }
          >
            <option value="">From</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <span className={styles.dash}>–</span>
          <select
            className={styles.select}
            aria-label="To year"
            value={draft.yearTo}
            onChange={(event) =>
              setDraft((c) => ({ ...c, yearTo: event.target.value }))
            }
          >
            <option value="">To</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.group}>
        <span className={cx("label", styles.groupLabel)}>Priority</span>
        {PRIORITIES.map((priority) => (
          <label key={priority} className={styles.check}>
            <input
              type="checkbox"
              checked={draft.priorities.includes(priority)}
              onChange={() => togglePriority(priority)}
            />
            <span className={styles.box}>
              <Icon name="check" size={20} />
            </span>
            <span className={styles.checkText}>
              <span className={cx(styles.swatch, styles[priority])} />
              {PRIORITY_LABEL[priority]}
            </span>
          </label>
        ))}
      </div>

      <div className={styles.actions}>
        <Button variant="primary" block onClick={() => onApply(draft)}>
          Apply filters
        </Button>
        <Button
          variant="ghost"
          block
          onClick={() => {
            setDraft(EMPTY_FILTERS);
            onClear();
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
