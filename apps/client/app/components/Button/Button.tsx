import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

import { cx } from "@utilities/cx";
import { Icon, type IconName } from "@components/Icon/Icon";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "dispatch"
  | "resolve"
  | "danger"
  | "ghost";

interface CommonProps {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  /** Leading icon, drawn at a size matched to the button. */
  icon?: IconName;
  block?: boolean;
  children: ReactNode;
  className?: string;
}

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    to?: never;
  };

type AsLink = CommonProps & {
  /** When set, the button renders as a router link. */
  to: string;
};

export type ButtonProps = AsButton | AsLink;

export function Button({
  variant = "primary",
  size = "md",
  icon,
  block = false,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = cx(
    styles.btn,
    styles[variant],
    size === "lg" && styles.lg,
    block && styles.block,
    className,
  );

  const inner = (
    <>
      {icon ? <Icon name={icon} size={size === "lg" ? 24 : 20} /> : null}
      <span>{children}</span>
    </>
  );

  if ("to" in rest && typeof rest.to === "string") {
    return (
      <Link to={rest.to} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}
