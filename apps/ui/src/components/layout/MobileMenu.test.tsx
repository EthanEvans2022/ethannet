import type { NavLink } from "@/config/navigation";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MobileMenu } from "./MobileMenu";

const links: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

function setup() {
  const user = userEvent.setup();
  render(<MobileMenu links={links} />);
  const toggle = screen.getByRole("button", { name: "Open menu" });
  const open = () => user.click(toggle);
  return { user, toggle, open };
}

// The panel stays mounted for its slide animation, so "closed" means hidden from
// the accessibility tree rather than absent from the DOM.
const panel = () => screen.queryByRole("navigation", { name: "Mobile" });

describe("MobileMenu", () => {
  it("starts closed", () => {
    const { toggle } = setup();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-menu");
    expect(panel()).not.toBeInTheDocument();
  });

  it("opens the panel with every link when the hamburger is clicked", async () => {
    const { toggle, open } = setup();
    await open();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const nav = panel();
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("id", "mobile-menu");
    for (const link of links) {
      expect(
        within(nav as HTMLElement).getByRole("link", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
  });

  it("closes when the X button is clicked", async () => {
    const { user, toggle, open } = setup();
    await open();
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel()).not.toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", async () => {
    const { user, toggle, open } = setup();
    await open();
    await user.click(screen.getByTestId("mobile-menu-backdrop"));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when Escape is pressed", async () => {
    const { user, toggle, open } = setup();
    await open();
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when a link is clicked", async () => {
    const { user, toggle, open } = setup();
    await open();
    await user.click(
      within(panel() as HTMLElement).getByRole("link", { name: "About" }),
    );
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("ignores Escape while closed", async () => {
    const { user, toggle } = setup();
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
