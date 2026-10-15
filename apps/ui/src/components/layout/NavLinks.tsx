import type { NavLink } from "@/config/navigation";
import Link from "next/link";
import styles from "./NavLinks.module.css";

/** Props for {@link NavLinks}. */
export interface NavLinksProps {
  /** Links to render, in order. */
  links: NavLink[];
  /** Called after any link is clicked, e.g. so a menu can close itself. */
  onNavigate?: () => void;
  /** Lay links out horizontally (`row`) or stacked (`column`). Defaults to `row`. */
  direction?: "row" | "column";
}

/** A plain list of internal links. Renders nothing for an empty list. */
export function NavLinks({
  links,
  onNavigate,
  direction = "row",
}: NavLinksProps) {
  if (links.length === 0) return null;
  return (
    <ul className={`${styles.list} ${styles[direction]}`}>
      {links.map((link) => (
        <li key={link.href}>
          <Link className={styles.link} href={link.href} onClick={onNavigate}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
