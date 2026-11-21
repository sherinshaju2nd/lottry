// Renders scripts/blog-covers/*.svg into public/blog/ as:
//   {slug}.webp  – 1200×630 card/hero image
//   {slug}.jpg   – 1200×630 Open Graph / JSON-LD image (SVG/WebP are not reliably accepted by social crawlers)
// Usage: node scripts/build-blog-covers.mjs
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(root, "blog-covers");
const outDir = path.join(root, "..", "public", "blog");

const render = async (file) => {
  const slug = path.basename(file, ".svg");
  const svg = await readFile(path.join(srcDir, file));
  const base = sharp(svg, { density: 144 }).resize(1200, 630);
  await Promise.all([
    base.clone().webp({ quality: 86 }).toFile(path.join(outDir, `${slug}.webp`)),
    base.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(outDir, `${slug}.jpg`)),
  ]);
  console.log(`[blog-covers] ${slug}`);
};

try {
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(srcDir)).filter((f) => f.endsWith(".svg"));
  for (const file of files) await render(file);
} catch (err) {
  console.error(`[blog-covers] failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
