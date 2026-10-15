import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { navLinks, socialLinks } from "@/config/navigation";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "ethannet",
  description: "Minimal pnpm + TypeScript + Express + Next.js monorepo",
};

// Composition root: the only place the navigation config is wired into components.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header links={navLinks} />
        <main>{children}</main>
        <Footer navLinks={navLinks} socialLinks={socialLinks} />
      </body>
    </html>
  );
}
