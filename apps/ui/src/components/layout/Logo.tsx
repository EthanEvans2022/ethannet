import Link from "next/link";
import styles from "./Logo.module.css";

/** The site wordmark, linking back to the home page. Swap the text for an image here. */
export function Logo() {
  return (
    <Link className={styles.logo} href="/" aria-label="ethannet home">
      ethannet
    </Link>
  );
}
