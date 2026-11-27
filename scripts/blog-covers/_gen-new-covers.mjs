// Generator for the November 2026 guide covers (agent commission, social impact, minimum age, tax,
// draw dates, digital platforms, responsible sharing, bumper draws).
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
const ticket = ({ id, name, draw, date, number, prize, price = "₹50", time = "3:00 PM", light, dark, ink, accent, x, y, rot }) => `
  <g transform="translate(${x} ${y}) rotate(${rot} 260 130)" filter="url(#shadow)">
    <defs><linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs>
    <clipPath id="${id}"><rect width="520" height="260" rx="14"/></clipPath>
    <rect width="520" height="260" rx="14" fill="url(#${id}-g)"/>
    <g clip-path="url(#${id})">${waves(520, 280, dark, name.length)}</g>
    <g clip-path="url(#${id})">
      <rect width="520" height="38" fill="${dark}"/>
      <text x="300" y="25" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="3">KERALA STATE LOTTERIES</text>
      <rect y="236" width="520" height="24" fill="${dark}" opacity="0.9"/>
      <text x="300" y="253" text-anchor="middle" font-family="${FONT}" font-size="11" fill="#FFFFFF" letter-spacing="1">DRAW AT GORKY BHAVAN, THIRUVANANTHAPURAM · ${time}</text>
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

  // 5. Draw dates: month calendar with marked draw days + weekly series list
  "how-kerala-lottery-draw-dates-are-decided": frame({
    bg: ["#0F172A", "#1E3A8A", "#0E7490"],
    glow: "#7DD3FC",
    title: ["How Kerala Lottery Draw", "Dates Are Decided"],
    subtitle: "Weekly schedules, advance notice and postponements explained",
    body: `
    ${ticket({ id: "d1", name: "WIN-WIN", draw: "W-842", date: "24-11-2026", number: "WB 274519", prize: "₹75 Lakh", light: "#EFF6FF", dark: "#1D4ED8", ink: "#1E3A8A", accent: "#BFDBFE", x: 50, y: 300, rot: -5 })}
    <!-- calendar -->
    <g filter="url(#shadow)" transform="rotate(4 900 370)">
      <rect x="680" y="150" width="440" height="420" rx="18" fill="#FFFFFF"/>
      <rect x="680" y="150" width="440" height="70" rx="18" fill="#DC2626"/><rect x="680" y="196" width="440" height="24" fill="#DC2626"/>
      <rect x="760" y="132" width="14" height="40" rx="7" fill="#334155"/><rect x="1026" y="132" width="14" height="40" rx="7" fill="#334155"/>
      <text x="900" y="198" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="900" fill="#FFFFFF" letter-spacing="2">DRAW CALENDAR</text>
      ${["S", "M", "T", "W", "T", "F", "S"].map((d, i) => `<text x="${722 + i * 59}" y="252" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="900" fill="#64748B">${d}</text>`).join("")}
      ${Array.from({ length: 35 }, (_, n) => {
        const c = n % 7;
        const r = Math.floor(n / 7);
        // November 2026 starts on a Sunday
        const day = n + 1;
        if (day > 30) return "";
        const cx = 722 + c * 59;
        const cy = 292 + r * 56;
        const isBumper = day === 28;
        return `<circle cx="${cx}" cy="${cy - 6}" r="${isBumper ? 22 : 20}" fill="${isBumper ? "#F59E0B" : "#DBEAFE"}"/><text x="${cx}" y="${cy}" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="800" fill="${isBumper ? "#FFFFFF" : "#1E3A8A"}">${day}</text>`;
      }).join("")}
      <text x="900" y="556" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="700" fill="#64748B">A weekly draw every day · orange = bumper draw</text>
    </g>
    ${pill(330, 238, 300, "OFFICIAL SCHEDULE", "#2563EB", -3)}`,
  }),

  // 6. Digital platforms: laptop + phone showing live results
  "how-digital-platforms-help-access-lottery-information": frame({
    bg: ["#082F49", "#0C4A6E", "#1E40AF"],
    glow: "#38BDF8",
    title: ["How Digital Platforms Help", "You Access Lottery Info"],
    subtitle: "Results, schedules, rules and ticket safety on any device",
    body: `
    <!-- laptop -->
    <g filter="url(#shadow)">
      <rect x="90" y="300" width="560" height="300" rx="16" fill="#1E293B"/>
      <rect x="108" y="318" width="524" height="264" rx="6" fill="#F8FAFC"/>
      <rect x="108" y="318" width="524" height="40" rx="6" fill="#0B3C5D"/><rect x="108" y="346" width="524" height="12" fill="#0B3C5D"/>
      <text x="126" y="344" font-family="${FONT}" font-size="15" font-weight="900" fill="#FFFFFF">Kerala Lottery Results Today</text>
      <circle cx="600" cy="338" r="6" fill="#22C55E"/><text x="590" y="343" text-anchor="end" font-family="${FONT}" font-size="12" font-weight="900" fill="#86EFAC">LIVE</text>
      <rect x="128" y="374" width="484" height="74" rx="10" fill="#0F172A"/>
      <text x="148" y="400" font-family="${FONT}" font-size="13" font-weight="900" fill="#FBBF24">1st PRIZE · ₹1 Crore</text>
      <text x="148" y="434" font-family="${MONO}" font-size="30" font-weight="700" fill="#FFFFFF" letter-spacing="2">SK 661942</text>
      ${["4012", "4337", "4431", "4538", "4966", "5527", "6410", "6582"].map((num, i) => `<rect x="${128 + (i % 4) * 122}" y="${464 + Math.floor(i / 4) * 52}" width="110" height="40" rx="8" fill="#F1F5F9" stroke="#E2E8F0"/><text x="${183 + (i % 4) * 122}" y="${490 + Math.floor(i / 4) * 52}" text-anchor="middle" font-family="${MONO}" font-size="18" font-weight="700" fill="#0F172A">${num}</text>`).join("")}
      <path d="M50 600 H690 L660 620 H80 Z" fill="#334155"/>
    </g>
    <!-- phone -->
    <g filter="url(#shadow)" transform="rotate(6 940 380)">
      <rect x="820" y="140" width="250" height="470" rx="34" fill="#0F172A"/>
      <rect x="834" y="156" width="222" height="438" rx="24" fill="#F8FAFC"/>
      <rect x="905" y="166" width="80" height="10" rx="5" fill="#0F172A"/>
      <rect x="850" y="194" width="190" height="64" rx="12" fill="#0B3C5D"/>
      <text x="945" y="220" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="900" fill="#FBBF24">TODAY'S RESULT</text>
      <text x="945" y="246" text-anchor="middle" font-family="${MONO}" font-size="20" font-weight="700" fill="#FFFFFF">SK 661942</text>
      ${[["Draw schedule", "#DBEAFE", "#1D4ED8"], ["Ticket checker", "#DCFCE7", "#15803D"], ["Claim guide", "#FEF3C7", "#B45309"], ["Tax &amp; TDS", "#FCE7F3", "#BE185D"], ["Result PDF", "#EDE9FE", "#6D28D9"]].map(([label, bgc, fg], i) => `<rect x="850" y="${274 + i * 60}" width="190" height="48" rx="10" fill="${bgc}"/><text x="868" y="${304 + i * 60}" font-family="${FONT}" font-size="16" font-weight="800" fill="${fg}">${label}</text>`).join("")}
    </g>
    ${pill(330, 238, 240, "LIVE 3 PM", "#16A34A", -3)}`,
  }),

  // 7. Responsible sharing: verified result vs fake prize message
  "responsible-online-lottery-information-sharing": frame({
    bg: ["#111827", "#1F2937", "#14532D"],
    glow: "#86EFAC",
    title: ["Responsible Online Lottery", "Information Sharing"],
    subtitle: "Verify results, avoid fake announcements and prize scams",
    body: `
    <!-- verified result card -->
    <g filter="url(#shadow)" transform="rotate(-4 330 450)">
      <rect x="70" y="310" width="500" height="270" rx="18" fill="#FFFFFF"/>
      <rect x="70" y="310" width="500" height="56" rx="18" fill="#15803D"/><rect x="70" y="344" width="500" height="22" fill="#15803D"/>
      <text x="96" y="346" font-family="${FONT}" font-size="19" font-weight="900" fill="#FFFFFF">OFFICIAL RESULT</text>
      <text x="544" y="346" text-anchor="end" font-family="${FONT}" font-size="15" font-weight="900" fill="#BBF7D0">Kerala State Lotteries</text>
      <text x="96" y="400" font-family="${FONT}" font-size="15" fill="#475569">Lottery · Draw No. · Date</text>
      <text x="544" y="400" text-anchor="end" font-family="${FONT}" font-size="15" font-weight="800" fill="#0F172A">SK-79 · 27-11-2026</text>
      <text x="96" y="440" font-family="${FONT}" font-size="15" fill="#475569">1st Prize</text>
      <text x="544" y="440" text-anchor="end" font-family="${MONO}" font-size="26" font-weight="700" fill="#DC2626">RK 661942</text>
      <line x1="96" y1="462" x2="544" y2="462" stroke="#E2E8F0" stroke-width="2"/>
      ${["Lottery name ✓", "Draw date ✓", "Ticket series ✓"].map((t, i) => `<text x="96" y="${496 + i * 28}" font-family="${FONT}" font-size="16" font-weight="800" fill="#16A34A">${t}</text>`).join("")}
      <g transform="translate(470 520)"><circle r="40" fill="#16A34A"/><path d="M-18 0 L-5 14 L20 -14" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>
    </g>
    <!-- fake message phone -->
    <g filter="url(#shadow)" transform="rotate(6 930 390)">
      <rect x="800" y="150" width="270" height="460" rx="34" fill="#0F172A"/>
      <rect x="814" y="166" width="242" height="428" rx="24" fill="#F1F5F9"/>
      <rect x="814" y="166" width="242" height="56" rx="24" fill="#475569"/><rect x="814" y="200" width="242" height="22" fill="#475569"/>
      <text x="935" y="202" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="900" fill="#FFFFFF">Unknown number</text>
      <rect x="832" y="240" width="206" height="96" rx="14" fill="#FFFFFF"/>
      <text x="846" y="268" font-family="${FONT}" font-size="14" font-weight="800" fill="#0F172A">You WON ₹25 lakh!</text>
      <text x="846" y="294" font-family="${FONT}" font-size="13" fill="#334155">Pay ₹4,999 "tax"</text>
      <text x="846" y="318" font-family="${FONT}" font-size="13" fill="#334155">to release prize</text>
      <rect x="832" y="350" width="206" height="70" rx="14" fill="#FFFFFF"/>
      <text x="846" y="380" font-family="${FONT}" font-size="13" fill="#334155">Send your OTP and</text>
      <text x="846" y="404" font-family="${FONT}" font-size="13" fill="#334155">bank details now</text>
      <rect x="832" y="440" width="206" height="44" rx="22" fill="#DC2626"/>
      <text x="935" y="468" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="900" fill="#FFFFFF">PAY NOW</text>
    </g>
    <g transform="rotate(-16 960 320)">
      <rect x="845" y="280" width="230" height="84" rx="12" fill="none" stroke="#F87171" stroke-width="7"/>
      <text x="960" y="340" text-anchor="middle" font-family="${FONT}" font-size="54" font-weight="900" fill="#F87171" letter-spacing="6">FAKE</text>
    </g>
    ${pill(330, 238, 260, "VERIFY FIRST ✓", "#16A34A", -3)}`,
  }),

  // 8. Bumper draws: Pooja Bumper BR-112 ticket + prize structure card
  "why-kerala-lottery-bumper-draws-attract-attention": frame({
    bg: ["#4C0519", "#831843", "#581C87"],
    glow: "#FDE68A",
    title: ["Why Kerala Bumper Draws", "Attract Public Attention"],
    subtitle: "Pooja Bumper 2026 (BR-112) · ₹300 ticket · ₹12 crore first prize",
    body: `
    ${ticket({ id: "b1", name: "POOJA BUMPER", draw: "BR-112", date: "28-11-2026", number: "JC 508213", prize: "₹12 Crore", price: "₹300", time: "2:00 PM", light: "#FFFBEB", dark: "#B45309", ink: "#78350F", accent: "#FCD34D", x: 50, y: 300, rot: -5 })}
    <!-- confetti -->
    ${[[620, 160, "#FBBF24"], [700, 120, "#F472B6"], [1150, 140, "#A78BFA"], [660, 600, "#FBBF24"], [1160, 600, "#F472B6"], [610, 300, "#34D399"], [1170, 330, "#FBBF24"]].map(([cx, cy, col], i) => `<rect x="${cx}" y="${cy}" width="14" height="22" rx="3" fill="${col}" transform="rotate(${i * 37} ${cx} ${cy})" opacity="0.9"/>`).join("")}
    <!-- prize structure card -->
    <g filter="url(#shadow)" transform="rotate(4 910 380)">
      <rect x="700" y="150" width="420" height="440" rx="16" fill="#FFFFFF"/>
      <rect x="700" y="150" width="420" height="60" rx="16" fill="#78350F"/><rect x="700" y="188" width="420" height="22" fill="#78350F"/>
      <text x="910" y="189" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="900" fill="#FDE68A" letter-spacing="1">PRIZE STRUCTURE</text>
      ${[["1st Prize", "₹12 Crore", "#B45309"], ["2nd Prize", "₹50 Lakh", "#0F172A"], ["3rd Prize", "₹5 Lakh", "#0F172A"], ["4th Prize", "₹3 Lakh", "#0F172A"], ["5th Prize", "₹2 Lakh", "#0F172A"], ["Consolation", "₹1 Lakh", "#0F172A"], ["6th – 9th", "₹5,000 – ₹300", "#0F172A"]].map(([label, amt, col], i) => `<text x="726" y="${250 + i * 44}" font-family="${FONT}" font-size="17" fill="#475569">${label}</text><text x="1094" y="${250 + i * 44}" text-anchor="end" font-family="${FONT}" font-size="${i === 0 ? 24 : 18}" font-weight="900" fill="${col}">${amt}</text>`).join("")}
      <line x1="726" y1="548" x2="1094" y2="548" stroke="#E2E8F0" stroke-width="2"/>
      <text x="910" y="574" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="800" fill="#64748B">Total prize pool ≈ ₹39.11 crore</text>
    </g>
    ${pill(330, 238, 250, "₹12 CRORE", "#D97706", -3)}`,
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
