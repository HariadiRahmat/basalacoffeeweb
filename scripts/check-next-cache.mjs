import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const nextDir = join(process.cwd(), ".next");
const manifest = join(nextDir, "prerender-manifest.json");

if (existsSync(nextDir) && !existsSync(manifest)) {
  console.warn("[dev] Cache .next rusak (prerender-manifest.json hilang). Membersihkan...");
  rmSync(nextDir, { recursive: true, force: true });
  console.warn("[dev] Selesai. Dev server akan rebuild dari awal.");
}
