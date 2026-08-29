import type { ReactNode } from "react";

export const metadata = {
  title: "ethannet",
  description: "Minimal pnpm + TypeScript + Express + Next.js monorepo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
