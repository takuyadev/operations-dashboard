import { useId } from "react";

import { Icon } from "@components/Icon/Icon";
import styles from "./SearchField.module.css";

interface SearchFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: SearchFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <Icon name="search" size={24} className={styles.icon} />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        inputMode="numeric"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
