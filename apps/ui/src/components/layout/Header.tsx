import type { NavLink } from "@/config/navigation";
import styles from "./Header.module.css";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

/** Props for {@link Header}. */
export interface HeaderProps {
  /** Main navigation links, shown inline on desktop and in the mobile menu on phones. */
  links: NavLink[];
}

/**
 * Site header: logo on the left, navigation on the right.
 * Mobile-first: below 768px the links live in the hamburger menu; at 768px and up
 * they're shown inline and the hamburger is hidden.
 */
export function Header({ links }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Logo />
      <nav aria-label="Main" className={styles.desktopNav}>
        <NavLinks links={links} />
      </nav>
      <div className={styles.mobileMenu}>
        <MobileMenu links={links} />
      </div>
    </header>
  );
}
