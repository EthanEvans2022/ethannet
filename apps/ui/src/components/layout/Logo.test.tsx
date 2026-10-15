import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("links to the home page with an accessible name", () => {
    render(<Logo />);
    const link = screen.getByRole("link", { name: "ethannet home" });
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveTextContent("ethannet");
  });
});
