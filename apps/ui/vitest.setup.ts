import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-cleans when Vitest globals are enabled; they aren't here.
afterEach(cleanup);

// jsdom can't navigate between pages and logs an error when a link is followed.
// Cancel the default action after React's handlers have run, so link clicks stay testable.
window.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("a")) {
    event.preventDefault();
  }
});
