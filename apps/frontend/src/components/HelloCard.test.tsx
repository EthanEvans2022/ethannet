import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HelloCard } from "./HelloCard";

describe("HelloCard", () => {
  it("renders the message", () => {
    render(
      <HelloCard message="Hi there" timestamp="2026-01-01T00:00:00.000Z" />,
    );
    expect(screen.getByText("Hi there")).toBeInTheDocument();
  });
});
