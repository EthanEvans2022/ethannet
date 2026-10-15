"use client";

import type { NavLink } from "@/config/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./MobileMenu.module.css";
import { NavLinks } from "./NavLinks";

/** Props for {@link MobileMenu}. */
export interface MobileMenuProps {
  /** Links shown in the slide-out panel. */
  links: NavLink[];
}

/**
 * Hamburger button that slides a navigation panel in from the right.
 * The panel closes on the X button, a backdrop click, Escape, or any link click.
 * Hidden at desktop widths by the header's CSS.
 */
export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <span className={styles.bars} aria-hidden="true" />
      </button>

      {/* Escape and the X button are the keyboard equivalents of a backdrop click. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: see above */}
      <div
        data-testid="mobile-menu-backdrop"
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        aria-hidden="true"
        onClick={close}
      />

      {/* Kept mounted so the slide transition can run; inert + aria-hidden while closed. */}
      <nav
        id="mobile-menu"
        aria-label="Mobile"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-hidden={!open}
        inert={!open}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          aria-label="Close menu"
          onClick={close}
        >
          <span aria-hidden="true">×</span>
        </button>
        <NavLinks
          links={links}
          direction="column"
          onNavigate={() => setOpen(false)}
        />
      </nav>
    </>
  );
}
