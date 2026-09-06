import { promises as fs } from "node:fs";
import express from "express";
import { buildMediaRouter, resolveMediaDir } from "./routes/media";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4002;
const mediaDir = resolveMediaDir();

app.use((_req, res, next) => {
  // Permissive CORS for local development only.
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/api/media", buildMediaRouter(mediaDir));
app.use("/media", express.static(mediaDir));

await fs.mkdir(mediaDir, { recursive: true });

app.listen(port, () => {
  console.log(`[media-server] listening on http://localhost:${port}`);
  console.log(`[media-server] serving files from ${mediaDir}`);
});
