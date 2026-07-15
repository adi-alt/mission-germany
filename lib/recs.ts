// Product recommendations, live-search links, and sale-calendar price forecasting.
// ponytail: recommendations are curated data + live search links, not scraped feeds —
// real-time scraping needs a backend (Keepa/SerpAPI); swap fetchers in here when one exists.

export type Tier = 'Budget' | 'Mid' | 'Premium';
export type Rec = { name: string; price: number; cur: '₹' | '€'; tier: Tier; where: string };

// Keyed by exact seed item name. Only meaningful purchases get picks —
// nobody needs a "best eraser" recommendation.
export const RECS: Record<string, Rec[]> = {
  'USB drives / SSD for backups': [
    { name: 'WD My Passport 1TB HDD', price: 4299, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'SanDisk Portable SSD 1TB', price: 5999, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'Samsung T7 SSD 1TB', price: 8999, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Power bank': [
    { name: 'Ambrane 10000mAh 20W', price: 799, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Mi Power Bank 4i 20000mAh', price: 1899, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'Anker PowerCore 20000 30W', price: 3499, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Trimmer set (Philips)': [
    { name: 'Philips BT1232', price: 1199, cur: '₹', tier: 'Budget', where: 'Amazon.in / Flipkart' },
    { name: 'Philips BT3441 (45 min cordless)', price: 1999, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'Philips MG7715 all-in-one 13-in-1', price: 3799, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Universal travel adapters': [
    { name: 'Portronics UniPlug', price: 349, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Belkin Universal Adapter', price: 899, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'GoTrippin Premium (dual USB)', price: 1299, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Extension board': [
    { name: 'GM 4+1 Spike Guard', price: 549, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Anchor by Panasonic 4-way', price: 699, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'Belkin 4-socket surge protector', price: 1499, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Travel iron': [
    { name: 'Bajaj DX-2 750W (compact)', price: 649, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Havells Travel Lite 700W', price: 1099, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'Philips GC101 foldable', price: 1449, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Pressure cooker 2–3 litre': [
    { name: 'Prestige Popular 3L', price: 1549, cur: '₹', tier: 'Budget', where: 'Amazon.in / Flipkart' },
    { name: 'Hawkins Classic 3L', price: 1675, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'Prestige Svachh 3L (induction base)', price: 2295, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Mixer grinder with 3 jars': [
    { name: 'Bajaj Rex 500W, 3 jars', price: 2499, cur: '₹', tier: 'Budget', where: 'Amazon.in / Flipkart' },
    { name: 'Philips HL7756 750W, 3 jars', price: 3999, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'Sujata Dynamix 900W, 3 jars', price: 4999, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Pan (small non-stick)': [
    { name: 'Prestige Omega Deluxe 24cm', price: 699, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Hawkins Futura 22cm', price: 1295, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
  ],
  'Running/walking shoes (Puma/Adidas)': [
    { name: 'Puma Smashic', price: 2199, cur: '₹', tier: 'Budget', where: 'Myntra / Puma.com' },
    { name: 'Adidas Duramo SL', price: 3299, cur: '₹', tier: 'Mid', where: 'Myntra / Adidas.co.in' },
    { name: 'Asics Gel-Contend 8', price: 4499, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Thermal innerwear full sets': [
    { name: 'Rupa Thermocot set', price: 699, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Jockey 2600/2520 thermal set', price: 1196, cur: '₹', tier: 'Mid', where: 'Amazon.in / Jockey store' },
    { name: 'M&S Heatgen set', price: 1999, cur: '₹', tier: 'Premium', where: 'Marks & Spencer' },
  ],
  'Black formal shoes': [
    { name: 'Bata Oxford', price: 1499, cur: '₹', tier: 'Budget', where: 'Bata store / Amazon.in' },
    { name: 'Red Tape Derby', price: 2499, cur: '₹', tier: 'Mid', where: 'Myntra' },
    { name: 'Hush Puppies leather', price: 4499, cur: '₹', tier: 'Premium', where: 'Myntra / brand store' },
  ],
  'Full suit set (blazer + trouser)': [
    { name: 'Peter England 2-piece', price: 5999, cur: '₹', tier: 'Budget', where: 'Myntra / brand store' },
    { name: 'Raymond ready-to-wear', price: 9999, cur: '₹', tier: 'Mid', where: 'Raymond store' },
    { name: 'Blackberrys slim fit', price: 14999, cur: '₹', tier: 'Premium', where: 'Myntra / brand store' },
  ],
  Jeans: [
    { name: 'Roadster (Myntra)', price: 999, cur: '₹', tier: 'Budget', where: 'Myntra' },
    { name: 'Wrangler regular', price: 1799, cur: '₹', tier: 'Mid', where: 'Myntra / Amazon.in' },
    { name: "Levi's 511", price: 2999, cur: '₹', tier: 'Premium', where: "Levi's store / Myntra" },
  ],
  Hoodies: [
    { name: 'Roadster fleece', price: 899, cur: '₹', tier: 'Budget', where: 'Myntra' },
    { name: 'H&M basic hoodie', price: 1499, cur: '₹', tier: 'Mid', where: 'H&M' },
    { name: 'Adidas Essentials', price: 2599, cur: '₹', tier: 'Premium', where: 'Myntra' },
  ],
  'Bed sheet full sets (king size)': [
    { name: 'Amazon Solimo king set', price: 899, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Bombay Dyeing king set', price: 1299, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
    { name: 'Spaces 210TC king set', price: 1999, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Travel pillow': [
    { name: 'Trajectory memory foam', price: 499, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'AmazonBasics memory foam', price: 999, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
  ],
  'Vacuum packaging bags with pump': [
    { name: 'Cheston 8pc + pump', price: 799, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'AmazonBasics 6-pack + pump', price: 1099, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
  ],
  'Baggage locks (small)': [
    { name: 'VIP TSA combination lock', price: 399, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'AmazonBasics TSA 2-pack', price: 599, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
  ],
  'Umbrella (small)': [
    { name: 'Sun Brand 3-fold', price: 499, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Wildcraft compact', price: 799, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
  ],
  'Extra tempered glass (phone)': [
    { name: 'Generic 2-pack', price: 199, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Spigen EZ Fit', price: 699, cur: '₹', tier: 'Premium', where: 'Amazon.in' },
  ],
  'Water bottle (reusable)': [
    { name: 'Milton Thermosteel 750ml', price: 649, cur: '₹', tier: 'Budget', where: 'Amazon.in' },
    { name: 'Borosil Hydra 1L', price: 999, cur: '₹', tier: 'Mid', where: 'Amazon.in' },
  ],
  'Spectacles + spare pair': [
    { name: 'Lenskart Air (2 for 1 offers)', price: 2000, cur: '₹', tier: 'Mid', where: 'Lenskart' },
    { name: 'Titan Eye+ ', price: 3500, cur: '₹', tier: 'Premium', where: 'Titan Eye+' },
  ],
  'Puffer jacket with hood (rain)': [
    { name: 'Decathlon Quechua NH500', price: 39, cur: '€', tier: 'Budget', where: 'Decathlon Aachen' },
    { name: 'Uniqlo Ultra Light Down hooded', price: 69, cur: '€', tier: 'Mid', where: 'Uniqlo / online' },
    { name: 'The North Face Quest', price: 120, cur: '€', tier: 'Premium', where: 'Amazon.de / TNF' },
  ],
  'Winter jacket (without hood)': [
    { name: 'C&A basic winter jacket', price: 59, cur: '€', tier: 'Budget', where: 'C&A Aachen' },
    { name: 'TK Maxx branded (varies)', price: 80, cur: '€', tier: 'Mid', where: 'TK Maxx' },
    { name: 'Jack Wolfskin insulated', price: 129, cur: '€', tier: 'Premium', where: 'Outlet / Amazon.de' },
  ],
  'Duvet / blanket': [
    { name: 'IKEA SMÅSPORRE', price: 17, cur: '€', tier: 'Budget', where: 'IKEA' },
    { name: 'Lidl Livarno duvet', price: 25, cur: '€', tier: 'Mid', where: 'Lidl' },
    { name: 'IKEA FJÄLLHAVRE (warm)', price: 49, cur: '€', tier: 'Premium', where: 'IKEA' },
  ],
  Pillow: [
    { name: 'Lidl basic pillow', price: 5, cur: '€', tier: 'Budget', where: 'Lidl' },
    { name: 'IKEA LUNDTRAV', price: 7, cur: '€', tier: 'Mid', where: 'IKEA' },
  ],
  'Laundry basket': [
    { name: 'Action foldable basket', price: 4, cur: '€', tier: 'Budget', where: 'Action' },
    { name: 'IKEA JÄLL', price: 5, cur: '€', tier: 'Mid', where: 'IKEA' },
  ],
  Hangers: [
    { name: 'IKEA BAGIS 8-pack', price: 2, cur: '€', tier: 'Budget', where: 'IKEA' },
    { name: 'Action velvet 10-pack', price: 4, cur: '€', tier: 'Mid', where: 'Action' },
  ],
};

// ---- Sale calendar (expected 2026 windows) ----
export type Sale = {
  name: string; market: 'IN' | 'DE';
  start: string; end: string; // ISO dates
  off: number; // typical max discount fraction
  cats?: string[]; // limit to categories, e.g. clothing-only sales
};

export const SALES: Sale[] = [
  { name: 'Amazon.de Prime Day', market: 'DE', start: '2026-07-14', end: '2026-07-15', off: 0.25 },
  { name: 'Amazon Prime Day (India)', market: 'IN', start: '2026-07-25', end: '2026-07-28', off: 0.25 },
  { name: 'Independence Day Sale', market: 'IN', start: '2026-08-06', end: '2026-08-10', off: 0.2 },
  { name: 'Flipkart Big Billion Days', market: 'IN', start: '2026-09-25', end: '2026-10-02', off: 0.3 },
  { name: 'Amazon Great Indian Festival', market: 'IN', start: '2026-09-26', end: '2026-10-15', off: 0.3 },
  { name: 'Diwali Sales', market: 'IN', start: '2026-11-01', end: '2026-11-08', off: 0.25 },
  { name: 'Myntra EORS', market: 'IN', start: '2026-12-19', end: '2026-12-25', off: 0.35, cats: ['Clothing', 'Bedding'] },
  { name: 'Black Friday Week', market: 'DE', start: '2026-11-23', end: '2026-11-30', off: 0.3 },
  { name: 'Winterschlussverkauf (winter sale)', market: 'DE', start: '2027-01-10', end: '2027-02-10', off: 0.4, cats: ['Buy in Germany', 'Clothing'] },
];

export type Forecast = { sale: Sale; est: number; days: number; live: boolean };

export function forecast(base: number, market: 'IN' | 'DE', category: string): Forecast[] {
  const now = Date.now();
  return SALES
    .filter((s) => s.market === market && +new Date(s.end) >= now && (!s.cats || s.cats.includes(category)))
    .map((s) => ({
      sale: s,
      est: Math.round(base * (1 - s.off)),
      days: Math.max(0, Math.ceil((+new Date(s.start) - now) / 86400000)),
      live: +new Date(s.start) <= now,
    }))
    .sort((a, b) => +new Date(a.sale.start) - +new Date(b.sale.start));
}

// Lowest price from recs, else parsed from the seed price string.
export function basePrice(name: string, priceINR: string, priceEUR: string): { v: number; cur: '₹' | '€' } | null {
  const recs = RECS[name];
  if (recs?.length) {
    const min = recs.reduce((m, r) => (r.price < m.price ? r : m));
    return { v: min.price, cur: min.cur };
  }
  const parse = (s: string) => { const m = s.replace(/,/g, '').match(/\d+/); return m ? +m[0] : null; };
  const inr = parse(priceINR); if (inr && inr > 20) return { v: inr, cur: '₹' };
  const eur = parse(priceEUR); if (eur) return { v: eur, cur: '€' };
  return null;
}

export function fmt(v: number, cur: '₹' | '€') {
  return cur === '₹' ? `₹${v.toLocaleString('en-IN')}` : `€${v}`;
}

// Detects what the user pasted into a product field: a store link or a brand/product name.
const PLATFORMS: [RegExp, string][] = [
  [/amazon\./i, 'Amazon'], [/flipkart\./i, 'Flipkart'], [/myntra\./i, 'Myntra'],
  [/idealo\./i, 'idealo'], [/ikea\./i, 'IKEA'], [/decathlon\./i, 'Decathlon'],
  [/google\./i, 'Google'], [/lenskart\./i, 'Lenskart'], [/croma\./i, 'Croma'],
];
export function parseProductInput(input: string): { url?: string; platform?: string; query?: string } {
  const s = input.trim();
  if (!s) return {};
  if (/^https?:\/\//i.test(s)) {
    const platform = PLATFORMS.find(([re]) => re.test(s))?.[1] ?? new URL(s).hostname.replace(/^www\./, '');
    return { url: s, platform };
  }
  return { query: s };
}

// Buy links for an item: the pasted link first (if any), then live searches —
// on the brand/product the user typed, falling back to the item name.
export function productLinks(name: string, buy: 'IN' | 'DE' | 'HAVE', input?: string) {
  const p = parseProductInput(input ?? '');
  const links = p.url ? [{ label: `Open on ${p.platform}`, url: p.url }] : [];
  return [...links, ...searchLinks(p.query || name, buy)];
}

export function searchLinks(name: string, buy: 'IN' | 'DE' | 'HAVE') {
  const q = encodeURIComponent(name);
  return buy === 'DE'
    ? [
        { label: 'Amazon.de', url: `https://www.amazon.de/s?k=${q}` },
        { label: 'idealo.de', url: `https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${q}` },
        { label: 'IKEA', url: `https://www.ikea.com/de/en/search/?q=${q}` },
      ]
    : [
        { label: 'Amazon.in', url: `https://www.amazon.in/s?k=${q}` },
        { label: 'Flipkart', url: `https://www.flipkart.com/search?q=${q}` },
        { label: 'Myntra', url: `https://www.myntra.com/${q}` },
      ];
}
