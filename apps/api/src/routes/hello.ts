import type { HelloResponse } from "@ethannet/types";
import { Router } from "express";

export function buildHelloResponse(): HelloResponse {
  return {
    message: "Hello from the Express API!",
    timestamp: new Date().toISOString(),
  };
}

export const helloRouter = Router();

helloRouter.get("/", (_req, res) => {
  res.json(buildHelloResponse());
});
