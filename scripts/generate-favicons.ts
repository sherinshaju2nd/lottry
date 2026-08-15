import sharp from "sharp";
import fs from "fs";
import path from "path";

async function generateFavicons() {
  const sourceLogo = path.join(__dirname, "../public/logo-round-1024.png");
  if (!fs.existsSync(sourceLogo)) {
    console.error("Source logo not found:", sourceLogo);
    return;
  }

  console.log("Generating favicons from:", sourceLogo);

  const publicDir = path.join(__dirname, "../public");
  const appDir = path.join(__dirname, "../app");

  const sizes = [
    { name: "icon-16x16.png", size: 16 },
    { name: "icon-32x32.png", size: 32 },
    { name: "icon-48x48.png", size: 48 },
    { name: "icon-64x64.png", size: 64 },
    { name: "icon-128x128.png", size: 128 },
    { name: "icon-192x192.png", size: 192 },
    { name: "icon-256x256.png", size: 256 },
    { name: "icon-512x512.png", size: 512 },
    { name: "apple-touch-icon-180x180.png", size: 180 },
    { name: "icon-maskable-192x192.png", size: 192 },
    { name: "icon-maskable-512x512.png", size: 512 },
  ];

  for (const { name, size } of sizes) {
    const dest = path.join(publicDir, name);
    await sharp(sourceLogo)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(dest);
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  // Generate ICO format buffer (PNG-based multi-resolution ICO standard)
  const icoSizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    icoSizes.map((size) =>
      sharp(sourceLogo)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  // Build ICO header + directory entries + image data
  // Header: 2 bytes reserved (0), 2 bytes type (1 for ICO), 2 bytes count (icoSizes.length)
  const count = icoSizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries: Buffer[] = [];

  for (let i = 0; i < count; i++) {
    const size = icoSizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset of image data
    entries.push(entry);
    offset += buf.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...pngBuffers]);

  // Write to both frontend/app/favicon.ico and frontend/public/favicon.ico
  const appFavicon = path.join(appDir, "favicon.ico");
  const publicFavicon = path.join(publicDir, "favicon.ico");

  fs.writeFileSync(appFavicon, icoBuffer);
  fs.writeFileSync(publicFavicon, icoBuffer);

  console.log(`✓ Successfully updated ${appFavicon} (${icoBuffer.length} bytes)`);
  console.log(`✓ Successfully updated ${publicFavicon} (${icoBuffer.length} bytes)`);
}

generateFavicons().catch(console.error);
