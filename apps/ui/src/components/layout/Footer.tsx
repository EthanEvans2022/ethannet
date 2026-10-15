import type { NavLink, SocialLink } from "@/config/navigation";
import styles from "./Footer.module.css";
import { NavLinks } from "./NavLinks";

/** Props for {@link Footer}. */
export interface FooterProps {
  /** Internal links, usually the same list the header uses. */
  navLinks: NavLink[];
  /** External profile links, opened in a new tab. The list is omitted when empty. */
  socialLinks: SocialLink[];
}

/** Site footer: a repeat of the main navigation plus social links. */
export function Footer({ navLinks, socialLinks }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <nav aria-label="Footer">
        <NavLinks links={navLinks} />
      </nav>
      {socialLinks.length > 0 && (
        <ul className={styles.social} aria-label="Social">
          {socialLinks.map((link) => (
            <li key={link.href}>
              <a
                className={styles.socialLink}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </footer>
  );
}
