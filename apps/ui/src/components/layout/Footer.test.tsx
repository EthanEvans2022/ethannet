import type { NavLink, SocialLink } from "@/config/navigation";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];
const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/example" },
];

describe("Footer", () => {
  it("renders the nav links in a footer navigation landmark", () => {
    render(<Footer navLinks={navLinks} socialLinks={socialLinks} />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(nav).getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("opens social links in a new tab safely", () => {
    render(<Footer navLinks={navLinks} socialLinks={socialLinks} />);
    const github = screen.getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("href", "https://github.com/example");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("omits the social list when there are no social links", () => {
    render(<Footer navLinks={navLinks} socialLinks={[]} />);
    expect(
      screen.queryByRole("list", { name: "Social" }),
    ).not.toBeInTheDocument();
  });

  it("has no copyright line", () => {
    render(<Footer navLinks={navLinks} socialLinks={socialLinks} />);
    expect(screen.getByRole("contentinfo")).not.toHaveTextContent(
      /©|copyright/i,
    );
  });
});
