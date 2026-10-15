/** An internal site link rendered with `next/link`. */
export interface NavLink {
  /** Visible link text. */
  label: string;
  /** App route, e.g. `/about`. */
  href: string;
}

/** An external profile or contact link, opened in a new tab. */
export interface SocialLink {
  /** Visible link text, e.g. `GitHub`. */
  label: string;
  /** Absolute URL (`https://…` or `mailto:…`). */
  href: string;
}

/**
 * Site-wide navigation, shared by the header, the mobile menu and the footer.
 * Injected by `app/layout.tsx`; components never import this directly.
 *
 * `/about`, `/projects` and `/contact` are placeholders and 404 until those pages exist.
 */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

/** Footer social links. The URLs are placeholders; replace them with real profiles. */
export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Email", href: "mailto:hello@example.com" },
];
