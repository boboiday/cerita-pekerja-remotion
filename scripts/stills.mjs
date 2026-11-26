#!/usr/bin/env node
/**
 * Stills SATU PANGGILAN — storyboard + cover dari satu template episode.
 *
 *   npm run stills -- <compositionId>   (default: EP19Test)
 *
 * Satu perintah ini:
 *   1. Merender satu frame per shot (remotion still) ke stills/frames/.
 *   2. Merender satu frame cover ke stills/frames/cover.jpg.
 *   3. Menyusun stills/storyboard.png (1 halaman, 8 panel + label) dan
 *      stills/cover.jpg (frame cover + band hook + pill pasal + handle)
 *      lewat scripts/compose_stills.py (PIL).
 *
 * Frame + label tiap komposisi tinggal di scripts/stills.json — tambah
 * entri baru untuk episode berikutnya, tanpa mengubah script ini.
 * Output TIDAK di-commit (lihat .gitignore); workflow Stills mengunggah
 * folder stills/ sebagai artifact.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const composition = process.argv[2] ?? "EP19Test";

const manifestPath = join(root, "scripts", "stills.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
const entry = manifest[composition];
if (!entry) {
  console.error(`No stills entry for composition "${composition}" in scripts/stills.json`);
  process.exit(1);
}

const outDir = join(root, "stills");
const framesDir = join(outDir, "frames");
mkdirSync(framesDir, { recursive: true });

const run = (args) => {
  console.log(`$ ${args.join(" ")}`);
  execFileSync(args[0], args.slice(1), { cwd: root, stdio: "inherit" });
};

// 1+2. Frame per shot + frame cover, semua dari template yang sama.
const jobs = [
  ...entry.shots.map((s, i) => ({ name: `shot-${String(i + 1).padStart(2, "0")}`, frame: s.frame })),
  { name: "cover", frame: entry.cover.frame },
];
for (const job of jobs) {
  run([
    "npx", "remotion", "still", "src/index.ts", composition,
    join("stills", "frames", `${job.name}.jpg`),
    `--frame=${job.frame}`, "--image-format=jpeg", "--overwrite",
  ]);
}

// 3. Susun storyboard.png + cover.jpg dari frame-frame tadi.
run(["python3", join("scripts", "compose_stills.py"), composition]);

console.log(`\nDone: stills/storyboard.png + stills/cover.jpg (${composition})`);
if (!existsSync(join(outDir, "storyboard.png")) || !existsSync(join(outDir, "cover.jpg"))) {
  console.error("ERROR: expected outputs missing");
  process.exit(1);
}
