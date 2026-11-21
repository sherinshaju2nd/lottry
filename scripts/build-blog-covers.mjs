// Renders blog cover sources into public/blog/ as:
//   {slug}.webp  – 1200×630 card/hero image
//   {slug}.jpg   – 1200×630 Open Graph / JSON-LD image (SVG/WebP are not reliably accepted by social crawlers)
// Sources, per slug:
//   scripts/blog-covers/photos/{slug}.jpg – real photo (wins when present), cropped to 1200×630
//   scripts/blog-covers/{slug}.svg        – illustrated cover
// Photo credits (CC BY-SA, Wikimedia Commons) live in data/blogs.ts → coverCredit.
// Usage: node scripts/build-blog-covers.mjs
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(root, "blog-covers");
const photoDir = path.join(srcDir, "photos");
const outDir = path.join(root, "..", "public", "blog");
const SIZE = { width: 1200, height: 630 };

/**
 * Per-photo framing (defaults to an "attention" cover crop):
 *   position – sharp crop focus
 *   band     – keep this vertical slice first (fractions of the photo height)
 *   contain  – show the whole photo on a blurred copy of itself (very wide/tall photos)
 */
const PHOTO_FRAMING = {
  "kerala-lottery-agent-commission-on-winning-tickets": { position: "top" },
  "surrender-kerala-lottery-winning-ticket-through-bank": { band: { top: 0.29, height: 0.525 } },
  "pooja-bumper-lottery-2026": { contain: true },
};

const write = async (slug, base) => {
  await Promise.all([
    base.clone().webp({ quality: 86 }).toFile(path.join(outDir, `${slug}.webp`)),
    base.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(outDir, `${slug}.jpg`)),
  ]);
};

const framePhoto = async (file, { position = sharp.strategy.attention, band, contain = false } = {}) => {
  const input = await sharp(file).rotate().toBuffer();
  const { width = 0, height = 0 } = await sharp(input).metadata();
  const source = band
    ? await sharp(input)
        .extract({ left: 0, top: Math.round(height * band.top), width, height: Math.round(height * band.height) })
        .toBuffer()
    : input;
  if (!contain) return sharp(source).resize({ ...SIZE, fit: "cover", position });

  const backdrop = await sharp(source).resize({ ...SIZE, fit: "cover" }).blur(24).modulate({ brightness: 0.7 }).toBuffer();
  const front = await sharp(source).resize({ width: SIZE.width - 80, height: SIZE.height - 80, fit: "inside" }).toBuffer();
  return sharp(backdrop).composite([{ input: front, gravity: "centre" }]);
};

const renderPhoto = async (slug) => {
  const framed = await framePhoto(path.join(photoDir, `${slug}.jpg`), PHOTO_FRAMING[slug]);
  const base = sharp(await framed.toBuffer()).modulate({ saturation: 1.05 }).sharpen({ sigma: 0.6 });
  await write(slug, base);
  console.log(`[blog-covers] ${slug} (photo)`);
};

const renderSvg = async (slug) => {
  const svg = await readFile(path.join(srcDir, `${slug}.svg`));
  await write(slug, sharp(svg, { density: 144 }).resize(SIZE.width, SIZE.height));
  console.log(`[blog-covers] ${slug} (svg)`);
};

const slugsIn = async (dir, ext) => {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith(ext)).map((f) => path.basename(f, ext));
  } catch (err) {
    console.warn(`[blog-covers] skipping ${dir}: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
};

try {
  await mkdir(outDir, { recursive: true });
  const photos = new Set(await slugsIn(photoDir, ".jpg"));
  const svgs = (await slugsIn(srcDir, ".svg")).filter((slug) => !photos.has(slug));
  for (const slug of photos) await renderPhoto(slug);
  for (const slug of svgs) await renderSvg(slug);
} catch (err) {
  console.error(`[blog-covers] failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
