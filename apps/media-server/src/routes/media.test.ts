import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listMediaFiles } from "./media";

describe("listMediaFiles", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "media-server-test-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("lists files with their name, size, and url, sorted by name", async () => {
    await writeFile(path.join(dir, "b-song.mp3"), "fake-audio-data");
    await writeFile(path.join(dir, "a-clip.mp4"), "fake-video");

    const files = await listMediaFiles(dir);

    expect(files).toEqual([
      { name: "a-clip.mp4", size: 10, url: "/media/a-clip.mp4" },
      { name: "b-song.mp3", size: 15, url: "/media/b-song.mp3" },
    ]);
  });

  it("ignores subdirectories", async () => {
    await mkdir(path.join(dir, "nested"));
    await writeFile(path.join(dir, "track.wav"), "fake-audio-data");

    const files = await listMediaFiles(dir);

    expect(files).toEqual([
      { name: "track.wav", size: 15, url: "/media/track.wav" },
    ]);
  });

  it("ignores dotfiles", async () => {
    await writeFile(path.join(dir, ".gitignore"), "*\n");
    await writeFile(path.join(dir, "track.wav"), "fake-audio-data");

    const files = await listMediaFiles(dir);

    expect(files).toEqual([
      { name: "track.wav", size: 15, url: "/media/track.wav" },
    ]);
  });
});
