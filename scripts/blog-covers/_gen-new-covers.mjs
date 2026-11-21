// One-off generator for the November 2026 guide covers (agent commission, social impact, minimum age, tax).
// Writes {slug}.svg next to this file; then run `node scripts/build-blog-covers.mjs`.
// Usage: node scripts/blog-covers/_gen-new-covers.mjs
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const FONT = "Arial, Helvetica, sans-serif";
const MONO = "'Courier New', Courier, monospace";

/** Guilloche-style security waves across the ticket body. */
const waves = (w, h, color, seed) =>
  Array.from({ length: 7 }, (_, i) => {
    const pts = Array.from({ length: Math.ceil(w / 8) + 1 }, (_, k) => {
      const x = k * 8;
      const y =
        h / 2 +
        Math.sin(x / (38 + i * 6) + seed + i) * (h * 0.22) +
        Math.cos(x / (23 + i * 3) + i * 1.7) * (h * 0.09);
      return `L${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    return `<path d="M0 ${h / 2} ${pts}" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.28"/>`;
  }).join("");

const barcode = (x0, y, n = 31) =>
  Array.from({ length: n }, (_, i) => {
    const w = i % 3 === 2 ? 1 : 2;
    return `<rect x="${(x0 + i * 5.4).toFixed(1)}" y="${y}" width="${w}" height="30" fill="#111827"/>`;
  }).join("");

/** A 520×260 Kerala State Lotteries ticket specimen. */
const ticket = ({ id, name, draw, date, number, prize, price = "₹50", light, dark, ink, accent, x, y, rot }) => `
  <g transform="translate(${x} ${y}) rotate(${rot} 260 130)" filter="url(#shadow)">
    <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs>
    <clipPath id="${id}"><rect width="520" height="260" rx="14"/></clipPath>
    <rect width="520" height="260" rx="14" fill="url(#${id}-g)"/>
    <g clip-path="url(#${id})">${waves(520, 280, dark, name.length)}</g>
    <g clip-path="url(#${id})">
      <rect width="520" height="38" fill="${dark}"/>
      <text x="300" y="25" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="3">KERALA STATE LOTTERIES</text>
      <rect y="236" width="520" height="24" fill="${dark}" opacity="0.9"/>
      <text x="300" y="253" text-anchor="middle" font-family="${FONT}" font-size="11" fill="#FFFFFF" letter-spacing="1">DRAW AT GORKY BHAVAN, THIRUVANANTHAPURAM · 3:00 PM</text>
    </g>
    <line x1="96" y1="40" x2="96" y2="236" stroke="${ink}" stroke-width="2" stroke-dasharray="4 5" opacity="0.6"/>
    <text transform="translate(40 214) rotate(-90)" font-family="${MONO}" font-size="22" font-weight="700" fill="#DC2626">${number}</text>
    <text transform="translate(74 214) rotate(-90)" font-family="${FONT}" font-size="13" font-weight="700" fill="${ink}">${draw} · ${price}</text>
    <circle cx="140" cy="88" r="30" fill="none" stroke="${ink}" stroke-width="2.5" opacity="0.75"/>
    <circle cx="140" cy="88" r="23" fill="none" stroke="${ink}" stroke-width="1" stroke-dasharray="2 3" opacity="0.75"/>
    <path d="M140 70 l5 11 l12 1 l-9 8 l3 12 l-11 -6 l-11 6 l3 -12 l-9 -8 l12 -1 Z" fill="${dark}" opacity="0.85"/>
    <text x="186" y="80" font-family="${FONT}" font-size="${name.length > 13 ? 22 : 26}" font-weight="900" fill="${ink}" letter-spacing="1">${name}</text>
    <text x="186" y="104" font-family="${FONT}" font-size="14" font-weight="700" fill="${ink}" opacity="0.85">DRAW No. ${draw}  ·  ${date}</text>
    <rect x="114" y="126" width="104" height="54" rx="8" fill="${dark}"/>
    <text x="166" y="146" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="#FFFFFF">1st PRIZE</text>
    <text x="166" y="170" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="900" fill="#FDE68A">${prize}</text>
    <rect x="228" y="126" width="270" height="56" rx="8" fill="#FFFFFF" opacity="0.9" stroke="${ink}" stroke-opacity="0.3"/>
    <text x="236" y="168" font-family="${MONO}" font-size="40" font-weight="700" fill="#DC2626" letter-spacing="2">${number}</text>
    <text x="114" y="206" font-family="${FONT}" font-size="13" font-weight="700" fill="${ink}">Price ${price} (incl. GST)</text>
    <text x="114" y="224" font-family="${FONT}" font-size="10.5" fill="${ink}" opacity="0.8">Claim within 90 days · Agent seal on reverse</text>
    ${barcode(330, 194)}
    <text x="300" y="150" text-anchor="middle" font-family="${FONT}" font-size="64" font-weight="900" fill="${ink}" opacity="0.07" transform="rotate(-14 300 150)" letter-spacing="10">SPECIMEN</text>
  </g>`;

const frame = ({ bg, glow = "#FDE68A", title, subtitle, body }) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg[0]}"/><stop offset="0.55" stop-color="${bg[1]}"/><stop offset="1" stop-color="${bg[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.42" r="0.6">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.26"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="12"/><feOffset dx="0" dy="14" result="b"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g font-family="${FONT}">
    ${title.map((line, i) => `<text x="60" y="${92 + i * 54}" font-size="48" font-weight="900" fill="#FFFFFF">${line}</text>`).join("")}
    <text x="62" y="${92 + title.length * 54 - 8}" font-size="20" font-weight="700" fill="#FDE68A">${subtitle}</text>
  </g>
  ${body}
</svg>
`;

const pill = (x, y, w, text, fill, rot = 0) => `
  <g filter="url(#shadow)" transform="rotate(${rot} ${x + w / 2} ${y + 26})">
    <rect x="${x}" y="${y}" width="${w}" height="52" rx="26" fill="${fill}"/>
    <text x="${x + w / 2}" y="${y + 35}" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="900" fill="#FFFFFF" letter-spacing="1">${text}</text>
  </g>`;

const COVERS = {
  // 1. Agent commission: lottery stall counter with tickets, agent seal and commission slip
  "kerala-lottery-agent-commission-on-winning-tickets": frame({
    bg: ["#14532D", "#166534", "#065F46"],
    title: ["Kerala Lottery Agent", "Commission on Winners"],
    subtitle: "How local retail agents earn on sales and winning tickets",
    body: `
    ${ticket({ id: "a1", name: "SUVARNA KERALAM", draw: "SK-78", date: "20-11-2026", number: "RN 418273", prize: "₹1 Crore", light: "#F0FDF4", dark: "#15803D", ink: "#14532D", accent: "#BBF7D0", x: 640, y: 210, rot: 7 })}
    ${ticket({ id: "a2", name: "SAMRUDHI", draw: "SM-28", date: "15-11-2026", number: "MB 562904", prize: "₹1 Crore", light: "#FFF7ED", dark: "#C2410C", ink: "#7C2D12", accent: "#FED7AA", x: 50, y: 300, rot: -5 })}
    <!-- agent seal stamp -->
    <g transform="rotate(-14 1060 170)" opacity="0.95">
      <circle cx="1060" cy="170" r="74" fill="rgba(255,255,255,0.06)" stroke="#FDE68A" stroke-width="5"/>
      <circle cx="1060" cy="170" r="60" fill="none" stroke="#FDE68A" stroke-width="1.5" stroke-dasharray="3 4"/>
      <text x="1060" y="150" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="900" fill="#FDE68A" letter-spacing="2">AUTHORISED</text>
      <text x="1060" y="180" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="900" fill="#FDE68A">AGENT</text>
      <text x="1060" y="204" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" fill="#FDE68A">REG. No. TVM-0418</text>
    </g>
    ${pill(345, 236, 250, "AGENT SEAL ✓", "#16A34A", -3)}
    <!-- commission coins -->
    <g filter="url(#shadow)">
      ${[0, 1, 2, 3].map((i) => `<ellipse cx="${620}" cy="${560 - i * 12}" rx="46" ry="14" fill="#CA8A04" stroke="#FDE68A" stroke-width="2"/>`).join("")}
      <text x="620" y="530" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="900" fill="#FEF9C3">₹</text>
    </g>`,
  }),

  // 2. Social impact: Karunya ticket with healthcare heart and hospital
  "kerala-lottery-social-impact-karunya-benevolent-fund": frame({
    bg: ["#0C4A6E", "#075985", "#0E7490"],
    glow: "#A7F3D0",
    title: ["Kerala Lottery Social Impact", "&amp; Karunya Benevolent Fund"],
    subtitle: "How lottery revenue supports healthcare and livelihoods",
    body: `
    ${ticket({ id: "k1", name: "KARUNYA", draw: "KR-731", date: "14-11-2026", number: "KC 309817", prize: "₹1 Crore", light: "#F7FEE7", dark: "#4D7C0F", ink: "#365314", accent: "#D9F99D", x: 50, y: 300, rot: -5 })}
    ${ticket({ id: "k2", name: "KARUNYA PLUS", draw: "KN-597", date: "19-11-2026", number: "PH 724150", prize: "₹1 Crore", light: "#ECFEFF", dark: "#0E7490", ink: "#164E63", accent: "#A5F3FC", x: 600, y: 330, rot: 5 })}
    <!-- heart with medical cross -->
    <g filter="url(#shadow)" transform="translate(905 175)">
      <path d="M0 40 C0 -10 -70 -20 -80 30 C-88 70 -40 100 0 135 C40 100 88 70 80 30 C70 -20 0 -10 0 40 Z" fill="#F43F5E"/>
      <rect x="-12" y="28" width="24" height="64" rx="4" fill="#FFFFFF"/>
      <rect x="-32" y="48" width="64" height="24" rx="4" fill="#FFFFFF"/>
    </g>
    <!-- hospital -->
    <g filter="url(#shadow)" opacity="0.95">
      <rect x="1040" y="120" width="120" height="150" rx="6" fill="#F8FAFC"/>
      <rect x="1080" y="95" width="40" height="30" rx="4" fill="#F8FAFC"/>
      <rect x="1094" y="100" width="12" height="20" fill="#DC2626"/><rect x="1090" y="104" width="20" height="12" fill="#DC2626"/>
      ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${1054 + c * 34}" y="${140 + r * 34}" width="22" height="20" rx="3" fill="#BAE6FD"/>`).join("")).join("")}
      <rect x="1088" y="236" width="24" height="34" fill="#0E7490"/>
    </g>
    ${pill(330, 238, 280, "KARUNYA FUND ♥", "#E11D48", -3)}`,
  }),

  // 3. Minimum age: 18+ badge, ID card, ticket
  "minimum-age-to-buy-kerala-lottery-ticket": frame({
    bg: ["#312E81", "#3730A3", "#581C87"],
    title: ["Minimum Age to Buy a", "Kerala Lottery Ticket"],
    subtitle: "Why lottery tickets are for adults only · play responsibly",
    body: `
    ${ticket({ id: "m1", name: "BHAGYATHARA", draw: "BT-31", date: "16-11-2026", number: "BN 640582", prize: "₹1 Crore", light: "#FAF5FF", dark: "#7E22CE", ink: "#581C87", accent: "#E9D5FF", x: 50, y: 300, rot: -5 })}
    <!-- ID card -->
    <g filter="url(#shadow)" transform="rotate(6 830 430)">
      <rect x="650" y="320" width="360" height="220" rx="16" fill="#F8FAFC"/>
      <rect x="650" y="320" width="360" height="44" rx="16" fill="#1E3A8A"/><rect x="650" y="346" width="360" height="18" fill="#1E3A8A"/>
      <text x="830" y="350" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="900" fill="#FFFFFF" letter-spacing="2">IDENTITY CARD</text>
      <rect x="672" y="384" width="96" height="120" rx="8" fill="#CBD5E1"/>
      <circle cx="720" cy="428" r="24" fill="#94A3B8"/><path d="M682 500 C690 462 750 462 758 500 Z" fill="#94A3B8"/>
      <rect x="790" y="392" width="190" height="12" rx="6" fill="#CBD5E1"/>
      <rect x="790" y="416" width="150" height="12" rx="6" fill="#E2E8F0"/>
      <text x="790" y="462" font-family="${FONT}" font-size="15" font-weight="700" fill="#334155">DOB: 04-08-2008</text>
      <text x="790" y="490" font-family="${FONT}" font-size="15" font-weight="900" fill="#16A34A">AGE: 18 ✓</text>
    </g>
    <!-- 18+ badge -->
    <g filter="url(#shadow)">
      <circle cx="1030" cy="200" r="98" fill="#DC2626"/>
      <circle cx="1030" cy="200" r="84" fill="none" stroke="#FFFFFF" stroke-width="6"/>
      <text x="1030" y="232" text-anchor="middle" font-family="${FONT}" font-size="92" font-weight="900" fill="#FFFFFF">18+</text>
    </g>
    ${pill(330, 238, 270, "ADULTS ONLY", "#DC2626", -3)}`,
  }),

  // 4. Tax: ticket + prize payment slip showing 30% TDS
  "kerala-lottery-tax-deduction-on-winnings": frame({
    bg: ["#7C2D12", "#9A3412", "#78350F"],
    title: ["Kerala Lottery Tax:", "TDS on Prize Winnings"],
    subtitle: "Why the advertised prize is not your take-home amount",
    body: `
    ${ticket({ id: "t1", name: "DHANALEKSHMI", draw: "DL-28", date: "18-11-2026", number: "DA 871346", prize: "₹1 Crore", light: "#FFFBEB", dark: "#B45309", ink: "#78350F", accent: "#FDE68A", x: 50, y: 300, rot: -5 })}
    <!-- prize payment statement -->
    <g filter="url(#shadow)" transform="rotate(4 900 380)">
      <rect x="690" y="150" width="430" height="440" rx="14" fill="#FFFFFF"/>
      <rect x="690" y="150" width="430" height="58" rx="14" fill="#1E293B"/><rect x="690" y="186" width="430" height="22" fill="#1E293B"/>
      <text x="905" y="187" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="900" fill="#FDE68A" letter-spacing="1">PRIZE PAYMENT STATEMENT</text>
      <text x="714" y="248" font-family="${FONT}" font-size="15" fill="#475569">Prize amount (1st prize)</text>
      <text x="1096" y="248" text-anchor="end" font-family="${MONO}" font-size="18" font-weight="700" fill="#0F172A">₹1,00,00,000</text>
      <text x="714" y="290" font-family="${FONT}" font-size="15" fill="#475569">Agent commission (10%)</text>
      <text x="1096" y="290" text-anchor="end" font-family="${MONO}" font-size="18" font-weight="700" fill="#B45309">− ₹10,00,000</text>
      <text x="714" y="332" font-family="${FONT}" font-size="15" fill="#475569">Prize after commission</text>
      <text x="1096" y="332" text-anchor="end" font-family="${MONO}" font-size="18" font-weight="700" fill="#0F172A">₹90,00,000</text>
      <text x="714" y="374" font-family="${FONT}" font-size="15" fill="#475569">TDS @ 30% (Sec. 194B)</text>
      <text x="1096" y="374" text-anchor="end" font-family="${MONO}" font-size="18" font-weight="700" fill="#DC2626">− ₹27,00,000</text>
      <text x="714" y="416" font-family="${FONT}" font-size="15" fill="#475569">Surcharge + 4% cess</text>
      <text x="1096" y="416" text-anchor="end" font-family="${MONO}" font-size="18" font-weight="700" fill="#DC2626">extra</text>
      <line x1="714" y1="440" x2="1096" y2="440" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="6 5"/>
      <text x="714" y="482" font-family="${FONT}" font-size="17" font-weight="900" fill="#0F172A">Approx. before</text>
      <text x="714" y="504" font-family="${FONT}" font-size="17" font-weight="900" fill="#0F172A">surcharge &amp; cess</text>
      <text x="1096" y="494" text-anchor="end" font-family="${MONO}" font-size="26" font-weight="700" fill="#16A34A">₹63,00,000</text>
      <text x="905" y="560" text-anchor="middle" font-family="${FONT}" font-size="12" fill="#94A3B8">Illustrative only · final tax depends on surcharge, cess and your return</text>
    </g>
    ${pill(330, 238, 240, "30% TDS", "#DC2626", -3)}`,
  }),
};

try {
  await Promise.all(
    Object.entries(COVERS).map(([slug, svg]) => writeFile(path.join(dir, `${slug}.svg`), svg, "utf8")),
  );
  console.log(`[blog-covers] wrote ${Object.keys(COVERS).length} SVGs`);
} catch (err) {
  console.error(`[blog-covers] generator failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
