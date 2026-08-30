/**
 * Join CSS-module class names, dropping falsy values.
 *
 *   cx(styles.row, isActive && styles.active, priority && styles[priority])
 */
export type ClassValue = string | false | null | undefined;

export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
