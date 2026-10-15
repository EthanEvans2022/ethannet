import type { NavLink } from "@/config/navigation";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NavLinks } from "./NavLinks";

const links: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

describe("NavLinks", () => {
  it("renders one link per item with its href", () => {
    render(<NavLinks links={links} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("calls onNavigate when a link is clicked", async () => {
    const onNavigate = vi.fn();
    render(<NavLinks links={links} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole("link", { name: "About" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when given no links", () => {
    render(<NavLinks links={[]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
