// Génère les illustrations SVG des produits de démonstration dans public/products.
// Usage : node scripts/generate-product-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const items = [
  ["samsung-galaxy-a56-5g", "phone", "#1e3a8a", "#60a5fa"],
  ["tecno-spark-30-pro", "phone", "#065f46", "#34d399"],
  ["infinix-hot-50", "phone", "#4c1d95", "#a78bfa"],
  ["iphone-15-reconditionne", "phone", "#831843", "#f9a8d4"],
  ["xiaomi-redmi-note-14", "phone", "#7c2d12", "#fdba74"],
  ["samsung-galaxy-tab-a9-plus", "tablet", "#1f2937", "#9ca3af"],
  ["ipad-10e-generation", "tablet", "#0c4a6e", "#7dd3fc"],
  ["oraimo-freepods-4", "earbuds", "#14532d", "#86efac"],
  ["jbl-flip-6", "speaker", "#9a3412", "#fb923c"],
  ["xiaomi-redmi-watch-5-active", "watch", "#111827", "#6b7280"],
  ["chargeur-rapide-usb-c-25w", "charger", "#374151", "#e5e7eb"],
  ["powerbank-oraimo-20000", "powerbank", "#065f46", "#6ee7b7"],
  ["coque-antichoc-galaxy-a56", "case", "#475569", "#cbd5e1"],
  ["cable-usb-c-tresse-2m", "cable", "#7c2d12", "#fed7aa"],
];

const shapes = {
  phone: (d, l) => `
    <rect x="150" y="60" width="200" height="380" rx="32" fill="${d}"/>
    <rect x="162" y="72" width="176" height="356" rx="24" fill="url(#screen)"/>
    <rect x="225" y="82" width="50" height="10" rx="5" fill="${d}"/>
    <circle cx="250" cy="250" r="46" fill="${l}" opacity="0.35"/>`,
  tablet: (d) => `
    <rect x="70" y="100" width="360" height="300" rx="28" fill="${d}"/>
    <rect x="84" y="114" width="332" height="272" rx="18" fill="url(#screen)"/>
    <circle cx="250" cy="107" r="4" fill="#fff" opacity="0.6"/>`,
  earbuds: (d, l) => `
    <rect x="135" y="230" width="230" height="150" rx="70" fill="${d}"/>
    <rect x="135" y="230" width="230" height="40" rx="20" fill="${l}" opacity="0.5"/>
    <ellipse cx="195" cy="170" rx="38" ry="44" fill="#fff"/><rect x="185" y="180" width="20" height="70" rx="10" fill="#fff"/>
    <ellipse cx="305" cy="170" rx="38" ry="44" fill="#fff"/><rect x="295" y="180" width="20" height="70" rx="10" fill="#fff"/>`,
  speaker: (d, l) => `
    <rect x="80" y="170" width="340" height="160" rx="80" fill="${d}"/>
    <circle cx="160" cy="250" r="50" fill="${l}" opacity="0.6"/><circle cx="340" cy="250" r="50" fill="${l}" opacity="0.6"/>
    <rect x="200" y="235" width="100" height="30" rx="15" fill="#fff" opacity="0.85"/>`,
  watch: (d, l) => `
    <rect x="205" y="50" width="90" height="400" rx="30" fill="${d}"/>
    <rect x="160" y="150" width="180" height="200" rx="44" fill="#0f172a"/>
    <rect x="174" y="164" width="152" height="172" rx="34" fill="url(#screen)"/>
    <text x="250" y="262" font-family="Arial" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">10:24</text>
    <rect x="340" y="220" width="10" height="40" rx="5" fill="${l}"/>`,
  charger: (d) => `
    <rect x="160" y="150" width="180" height="200" rx="36" fill="#f8fafc" stroke="${d}" stroke-width="6"/>
    <rect x="215" y="90" width="18" height="70" rx="6" fill="#94a3b8"/><rect x="267" y="90" width="18" height="70" rx="6" fill="#94a3b8"/>
    <rect x="225" y="290" width="50" height="20" rx="10" fill="${d}"/>`,
  powerbank: (d, l) => `
    <rect x="120" y="110" width="260" height="290" rx="34" fill="${d}"/>
    <rect x="160" y="160" width="180" height="70" rx="12" fill="#0f172a"/>
    <text x="250" y="208" font-family="Arial" font-size="38" font-weight="700" fill="${l}" text-anchor="middle">100%</text>
    <rect x="190" y="360" width="40" height="14" rx="4" fill="#0f172a"/><rect x="270" y="360" width="40" height="14" rx="4" fill="#0f172a"/>`,
  case: (d, l) => `
    <rect x="150" y="60" width="200" height="380" rx="36" fill="${l}" opacity="0.55" stroke="${d}" stroke-width="8"/>
    <rect x="180" y="90" width="70" height="90" rx="20" fill="none" stroke="${d}" stroke-width="6"/>`,
  cable: (d, l) => `
    <path d="M110 380 C 110 120, 390 380, 390 120" fill="none" stroke="${d}" stroke-width="22" stroke-linecap="round"/>
    <rect x="90" y="370" width="40" height="70" rx="10" fill="${l}" stroke="${d}" stroke-width="4"/>
    <rect x="370" y="60" width="40" height="70" rx="10" fill="${l}" stroke="${d}" stroke-width="4"/>`,
};

mkdirSync("public/products", { recursive: true });
for (const [slug, shape, dark, light] of items) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7ed"/><stop offset="1" stop-color="#ecfdf5"/></linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${light}"/></linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(#bg)"/>${shapes[shape](dark, light)}
</svg>
`;
  writeFileSync(`public/products/${slug}.svg`, svg);
}
console.log(`${items.length} illustrations générées.`);
