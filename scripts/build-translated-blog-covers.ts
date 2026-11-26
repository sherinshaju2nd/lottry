// Renders a cover for every translated guide page into public/blog/{slug}.{jpg,webp}:
// the guide's title in that language on the left, the English cover artwork framed on the right.
// Titles come from data/blogTranslations (via data/blogPages), so covers always match the page title.
// Text is shaped by Pango, so an Indic font must be installed: Nirmala UI (Windows) or
// Noto Sans Malayalam / Devanagari / Tamil / Telugu (Linux, macOS).
// Usage: npx tsx scripts/build-translated-blog-covers.ts [slug-filter]
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { getAllBlogPages } from "../data/blogPages";
import { BLOG_LANGUAGES } from "../data/blogTranslations/types";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "..", "public", "blog");

const WIDTH = 1200;
const HEIGHT = 630;
const TEXT_X = 64;
const TEXT_WIDTH = 500;
const TITLE_TOP = 150;
const TITLE_MAX_HEIGHT = 330;
const ART = { left: 600, top: 150, width: 560, height: 294, radius: 18 };
const FONT = "Nirmala UI";

const escapeXml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const background = (badge: string): Buffer =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B3C5D"/><stop offset="0.6" stop-color="#1E40AF"/><stop offset="1" stop-color="#0F766E"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.35" r="0.6">
      <stop offset="0" stop-color="#93C5FD" stop-opacity="0.3"/><stop offset="1" stop-color="#93C5FD" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <g stroke="#FFFFFF" stroke-width="1" opacity="0.06">
    <path d="M0 105 H1200 M0 210 H1200 M0 315 H1200 M0 420 H1200 M0 525 H1200"/>
    <path d="M150 0 V630 M300 0 V630 M450 0 V630 M600 0 V630 M750 0 V630 M900 0 V630 M1050 0 V630"/>
  </g>
  <rect x="${ART.left - 8}" y="${ART.top - 8}" width="${ART.width + 16}" height="${ART.height + 16}" rx="${ART.radius + 6}" fill="#FFFFFF" opacity="0.92"/>
  <rect x="${TEXT_X}" y="64" width="${badge.length * 22 + 56}" height="50" rx="25" fill="#FDE68A"/>
  <text x="${TEXT_X + 28}" y="98" font-family="${FONT}, sans-serif" font-size="25" font-weight="700" fill="#0B3C5D">${escapeXml(badge)}</text>
  <text x="${TEXT_X}" y="586" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF" opacity="0.75" letter-spacing="1">keralalotteryresultstoday.in</text>
</svg>`);

/** Title as a transparent PNG, wrapped to TEXT_WIDTH; shrinks the font until it fits. */
const renderTitle = async (title: string): Promise<{ buffer: Buffer; height: number }> => {
  for (let size = 46; size >= 26; size -= 2) {
    const { data, info } = await sharp({
      text: {
        text: `<span foreground="#FFFFFF">${escapeXml(title)}</span>`,
        font: `${FONT} Bold ${size}`,
        width: TEXT_WIDTH,
        dpi: 72,
        rgba: true,
        wrap: "word",
        spacing: Math.round(size * 0.35),
      },
    })
      .png()
      .toBuffer({ resolveWithObject: true });
    // Pango cannot break a single long word, so also shrink when a word overflows the text column.
    const fits = info.height <= TITLE_MAX_HEIGHT && info.width <= TEXT_WIDTH;
    if (fits || size === 26) return { buffer: data, height: info.height };
  }
  throw new Error(`Could not fit title: ${title}`);
};

const framedArt = async (sourceSlug: string): Promise<Buffer> => {
  const mask = Buffer.from(
    `<svg width="${ART.width}" height="${ART.height}"><rect width="${ART.width}" height="${ART.height}" rx="${ART.radius}"/></svg>`,
  );
  const art = await readFile(path.join(outDir, `${sourceSlug}.jpg`));
  return sharp(art).resize(ART.width, ART.height).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
};

const main = async () => {
  const filter = process.argv[2] ?? "";
  const pages = getAllBlogPages().filter(({ translationOf, slug }) => translationOf && slug.includes(filter));
  for (const { slug, title, language = "en", translationOf = "" } of pages) {
    const { buffer: titlePng, height } = await renderTitle(title);
    const titleTop = TITLE_TOP + Math.max(0, Math.round((TITLE_MAX_HEIGHT - height) / 2));
    const accent = Buffer.from(`<svg width="96" height="6"><rect width="96" height="6" rx="3" fill="#FDE68A"/></svg>`);
    const base = sharp(background(BLOG_LANGUAGES[language].nativeName)).composite([
      { input: await framedArt(translationOf), left: ART.left, top: ART.top },
      { input: titlePng, left: TEXT_X, top: titleTop },
      { input: accent, left: TEXT_X, top: Math.min(titleTop + height + 22, 540) },
    ]);
    const flat = await base.png().toBuffer();
    await Promise.all([
      sharp(flat).webp({ quality: 86 }).toFile(path.join(outDir, `${slug}.webp`)),
      sharp(flat).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(outDir, `${slug}.jpg`)),
    ]);
    console.log(`[translated-covers] ${slug}`);
  }
};

main().catch((err: unknown) => {
  console.error(`[translated-covers] failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
