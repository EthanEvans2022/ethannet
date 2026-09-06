import { promises as fs } from "node:fs";
import path from "node:path";
import type { MediaFile } from "@ethannet/types";
import { Router } from "express";

export function resolveMediaDir(): string {
  return process.env.MEDIA_DIR
    ? path.resolve(process.env.MEDIA_DIR)
    : path.resolve(process.cwd(), "media");
}

export async function listMediaFiles(mediaDir: string): Promise<MediaFile[]> {
  const entries = await fs.readdir(mediaDir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map(async (entry): Promise<MediaFile> => {
        const stats = await fs.stat(path.join(mediaDir, entry.name));
        return {
          name: entry.name,
          size: stats.size,
          url: `/media/${encodeURIComponent(entry.name)}`,
        };
      }),
  );
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export function buildMediaRouter(mediaDir: string): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    res.json(await listMediaFiles(mediaDir));
  });

  return router;
}
