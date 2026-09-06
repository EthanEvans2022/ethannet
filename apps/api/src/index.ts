import express from "express";
import { helloRouter } from "./routes/hello";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4001;

app.use((_req, res, next) => {
  // Permissive CORS for local development only.
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/api/hello", helloRouter);

app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
