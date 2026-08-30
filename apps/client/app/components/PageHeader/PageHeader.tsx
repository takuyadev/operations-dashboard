import type { ReactNode } from "react";
import { Link } from "react-router";

import { Icon } from "@components/Icon/Icon";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  /** Right-aligned supporting content, e.g. a shift clock. */
  meta?: ReactNode;
  /** Optional back link shown above the title. */
  back?: { to: string; label: string };
}

export function PageHeader({ title, meta, back }: PageHeaderProps) {
  return (
    <div className={styles.wrap}>
      {back ? (
        <Link to={back.to} className={styles.back}>
          <Icon name="arrow-left" size={22} />
          {back.label}
        </Link>
      ) : null}
      <div className={styles.row}>
        <h1 className={styles.title}>{title}</h1>
        {meta ? <div className={styles.meta}>{meta}</div> : null}
      </div>
    </div>
  );
}
