import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cx } from "@utilities/cx";
import styles from "./Field.module.css";

interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  hint?: string;
}

export function TextAreaField({
  label,
  hint,
  className,
  ...rest
}: TextAreaFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        aria-describedby={hintId}
        className={cx(styles.textarea, className)}
        {...rest}
      />
    </div>
  );
}
