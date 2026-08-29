import { describe, expect, it } from "vitest";
import { buildHelloResponse } from "./hello";

describe("buildHelloResponse", () => {
  it("returns a message and a valid ISO timestamp", () => {
    const result = buildHelloResponse();
    expect(result.message).toBe("Hello from the Express backend!");
    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });
});
