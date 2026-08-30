import styles from "./Avatar.module.css";

interface AvatarProps {
  /** Full name; the first two initials are shown. */
  name: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "");
}

export function Avatar({ name }: AvatarProps) {
  return (
    <span className={styles.avatar} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
