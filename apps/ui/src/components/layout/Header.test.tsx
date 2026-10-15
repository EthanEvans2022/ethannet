import type { NavLink } from "@/config/navigation";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "./Header";

const links: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
];

describe("Header", () => {
  it("renders the logo linking home", () => {
    render(<Header links={links} />);
    expect(
      within(screen.getByRole("banner")).getByRole("link", {
        name: "ethannet home",
      }),
    ).toHaveAttribute("href", "/");
  });

  it("renders every link in the main navigation", () => {
    render(<Header links={links} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const link of links) {
      expect(
        within(nav).getByRole("link", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
  });

  it("includes the mobile menu toggle", () => {
    render(<Header links={links} />);
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
  });
});
