// Merged packing list: shared checklist + PDF (incl. handwritten notes).
// Tuple: [name, qty, buy, priceINR, priceEUR, options, bestTime, notes]
// buy: 'IN' = buy/carry from India, 'DE' = buy in Germany, 'HAVE' = already own, just pack

export type SeedItem = {
  name: string;
  category: string;
  qty: string;
  buy: 'IN' | 'DE' | 'HAVE';
  priceINR: string;
  priceEUR: string;
  options: string;
  bestTime: string;
  notes: string;
  packed: boolean;
  order: number;
};

type Row = [string, string?, ('IN' | 'DE' | 'HAVE')?, string?, string?, string?, string?, string?];

const DATA: Record<string, Row[]> = {
  'Documents & Certificates': [
    ['Passport + visa', '1', 'HAVE', '', '', '', 'Before flight', 'Carry in cabin bag, never check in'],
    ['RWTH Aachen admission letter', 'original + copies', 'HAVE', '', '', '', 'Before flight', ''],
    ['CAS / admission documents', 'all', 'HAVE', '', '', '', 'Before flight', ''],
    ['Degree certificate (original)', '1', 'HAVE', '', '', '', 'Before flight', 'All original study certificates'],
    ['Semester marksheets (all)', 'originals', 'HAVE', '', '', '', 'Before flight', ''],
    ['Blocked account documents', 'all', 'HAVE', '', '', '', 'Before flight', ''],
    ['Health insurance documents', 'all', 'HAVE', '', '', '', 'Before flight', ''],
    ['Travel insurance documents', 'all', 'HAVE', '', '', '', 'Before flight', ''],
    ['Loan documents', 'all', 'HAVE', '', '', '', 'Before flight', ''],
    ['Accommodation contract', '1', 'HAVE', '', '', '', 'Before flight', ''],
    ['Fee payment receipts', 'all', 'HAVE', '', '', '', 'Before flight', ''],
    ['Air ticket', '1', 'HAVE', '', '', '', 'Before flight', ''],
    ['Currency exchange receipt', '1', 'HAVE', '', '', '', 'After forex purchase', ''],
    ['Aadhaar + PAN copies', '2 each', 'IN', '₹20–50', '', 'Any print shop', 'Before flight', ''],
    ['Passport-size photographs', '32 copies', 'IN', '₹250–500', '', 'Local photo studio, Passport Photo app + print', '1–2 weeks before flight', 'German biometric size 35×45mm — get both sizes'],
    ['Physical + digital copies of all documents', '2 sets + cloud', 'IN', '₹100–300', '', 'Print shop; scan to Google Drive', 'Before flight', 'Keep one set in each bag'],
    ['International driving permit', 'if applicable', 'IN', '₹1,000–1,500', '', 'RTO / state transport dept', '3–4 weeks before flight', 'Valid 1 year in Germany'],
    ['Vaccination records', 'all', 'HAVE', '', '', '', 'Before flight', 'Needed for RWTH hospital access'],
    ['Blood group information', '1', 'HAVE', '', '', '', 'Before flight', ''],
    ['Prescription records (ongoing medication)', 'all', 'HAVE', '', '', '', 'Before flight', 'Required at customs for medicines'],
  ],
  Financial: [
    ['Niyo Global card', '1', 'IN', 'Free', '', 'Niyo app (SBM/DCB)', '3–4 weeks before flight — KYC takes time', 'Zero forex markup, best for Germany'],
    ['Euros in cash', '€1,500–1,800', 'IN', '~₹1.4–1.7L', '€1,500–1,800', 'BookMyForex, Thomas Cook, bank branch', '1 week before flight — compare rates daily', 'Handwritten note: 1500–1800 is enough, not 2000–2500'],
    ['Banking documents for German account', 'all', 'HAVE', '', '', '', 'Before flight', 'For opening Sparkasse/N26 account'],
    ['International debit/credit card (backup)', '1', 'HAVE', '', '', '', 'Before flight', 'Enable international usage in bank app'],
  ],
  Clothing: [
    ['Black t-shirt', '1', 'IN', '₹300–600', '', 'Myntra, H&M, Zara', 'Myntra EORS sale (Jun/Dec)', 'For interviews/part-time work'],
    ['White t-shirt', '1', 'IN', '₹300–600', '', 'Myntra, H&M, Zara', 'Myntra EORS sale (Jun/Dec)', ''],
    ['Black shirt', '1', 'IN', '₹600–1,200', '', 'Myntra, Van Heusen, Arrow', 'Myntra EORS sale', ''],
    ['White shirt', '1', 'IN', '₹600–1,200', '', 'Myntra, Van Heusen, Arrow', 'Myntra EORS sale', ''],
    ['Black trousers', '1', 'IN', '₹800–1,500', '', 'Myntra, Peter England', 'Myntra EORS sale', ''],
    ['Full suit set (blazer + trouser)', '1 set', 'IN', '₹4,000–10,000', '', 'Raymond, Peter England, Blackberrys', 'Festive/EORS sales; tailored takes 2 weeks', 'PDF note: 1 full suit set for interviews'],
    ['Tie', '1', 'IN', '₹200–500', '', 'Amazon, Myntra', 'Anytime', ''],
    ['Black formal shoes', '1 pair', 'IN', '₹1,500–3,500', '', 'Bata, Hush Puppies, Red Tape', 'Amazon/Myntra sale', 'PDF note: 1 formal pair for presentations/interviews'],
    ['Running/walking shoes (Puma/Adidas)', '1 pair', 'IN', '₹2,500–5,000', '', 'Puma, Adidas, Decathlon', 'Brand EOSS (Jan/Jul), Amazon sale', 'Aachen involves a lot of walking'],
    ['Thermal innerwear full sets', '2 sets', 'IN', '₹1,000–1,600/set', '', 'Jockey (preferred), Decathlon, Marks & Spencer', 'Sep–Oct (winter stock arrives)', 'PDF note: 2 full sets, prefer Jockey'],
    ['Gloves', '1 pair', 'IN', '₹300–600', '', 'Decathlon, Amazon', 'Sep–Oct', 'Touchscreen-friendly recommended'],
    ['Beanie / woolen cap', '1', 'IN', '₹200–500', '', 'Decathlon, Amazon', 'Sep–Oct', ''],
    ['Scarf / muffler', '1', 'IN', '₹300–700', '', 'Decathlon, Amazon', 'Sep–Oct', ''],
    ['Traditional outfit', '1–2 sets', 'IN', '₹1,500–4,000', '', 'FabIndia, Manyavar, local', 'Anytime', 'For festivals/events in Germany'],
    ['Home slippers', '1 pair', 'IN', '₹200–500', '', 'Bata, Amazon', 'Anytime', ''],
    ['Good quality socks', '5 pairs', 'IN', '₹500–900', '', 'Jockey, Decathlon', 'Anytime', ''],
    ['Jeans', '6–8 pairs', 'IN', '₹1,000–2,500 each', '', 'Levi’s, Myntra, Pepe', 'Myntra EORS / Levi’s sale', ''],
    ['Hoodies', '1–2', 'IN', '₹800–1,800', '', 'H&M, Decathlon, Myntra', 'EORS sale', ''],
    ['Inners', '5 pairs', 'IN', '₹1,000–1,500', '', 'Jockey', 'Anytime', ''],
    ['Towels', '1–2', 'IN', '₹400–800', '', 'Amazon, local', 'Anytime', ''],
    ['Daily wear clothes', '8–10 pairs', 'HAVE', '', '', '', 'Before flight', 'Use what you own, don’t buy new'],
  ],
  Electronics: [
    ['Laptop + charger', '1', 'HAVE', '', '', '', 'Before flight', 'Cabin bag only'],
    ['Mobile phone + charger', '1', 'HAVE', '', '', '', 'Before flight', ''],
    ['USB drives / SSD for backups', '1–2', 'IN', '₹1,500–4,000 (1TB SSD)', '', 'Amazon: SanDisk, Crucial', 'Amazon Great Indian Festival (Oct) / Prime Day (Jul)', ''],
    ['Pendrive', '1', 'IN', '₹300–600', '', 'Amazon: SanDisk 64/128GB', 'Amazon sale', ''],
    ['Ethernet cable', '1 (2–3m)', 'IN', '₹150–300', '', 'Amazon', 'Anytime', 'Useful in student housing'],
    ['Universal travel adapters', '3', 'IN', '₹250–450 each', '', 'Amazon, Croma', 'Amazon sale', 'PDF note: 3 adapters. Germany uses Type C/F, 230V'],
    ['Extension board', '1', 'IN', '₹500–900', '', 'GM, Anchor on Amazon', 'Anytime', 'Check 240V rating; pair with one adapter = many Indian plugs'],
    ['Power bank', '1 (10–20k mAh)', 'IN', '₹1,200–2,500', '', 'Mi, Ambrane, Anker on Amazon', 'Amazon sale', 'PDF note. Cabin bag only — not allowed in check-in'],
    ['Trimmer set (Philips)', '1', 'IN', '₹1,500–3,000', '', 'Philips on Amazon/Flipkart', 'Amazon Great Indian Festival (Oct)', 'PDF note: prefer Philips. Works on 230V = Germany-compatible'],
    ['Travel iron', '1', 'IN', '₹700–1,500', '', 'Philips, Bajaj travel iron on Amazon', 'Amazon sale', 'Small travel iron, not full-size'],
    ['Spare charging cables', '2–3', 'IN', '₹200–500 each', '', 'Amazon: boAt, Ambrane', 'Anytime', ''],
  ],
  Kitchen: [
    ['Pressure cooker 2–3 litre', '1', 'IN', '₹1,500–2,500', '', 'Prestige, Hawkins', 'Amazon/Flipkart sale', 'PDF note: 2–3 litre one. Induction-base if hob unknown'],
    ['Mixer grinder with 3 jars', '1', 'IN', '₹2,500–4,500', '', 'Bajaj, Philips, Preethi', 'Amazon Great Indian Festival (Oct)', 'PDF note: standard one, 3 jars. 230V works in Germany'],
    ['Spice box + small containers', 'a few', 'IN', '₹300–600', '', 'Amazon, local steel shop', 'Anytime', 'PDF note: a few for initial days'],
    ['Indian spices (all varieties)', '50–100g each, sealed', 'IN', '₹500–1,000 total', '', 'Supermarket sealed packs (customs-safe)', 'Last week before flight', 'PDF note: small packs for initial days; Indian stores exist in Aachen'],
    ['Home sweets & pickles', 'sealed packs', 'IN', '₹300–800', '', 'Supermarket sealed packs preferred', 'Last week before flight', 'Sealed = no customs issues'],
    ['Indian coffee / tea packs', '2–3', 'IN', '₹200–500', '', 'Supermarket', 'Last week before flight', ''],
    ['Plates', '2', 'IN', '₹200–400', '', 'Local steel shop; or IKEA later', 'Anytime', 'Steel = unbreakable in luggage'],
    ['Bowls', '2–3', 'IN', '₹150–300', '', 'Local steel shop', 'Anytime', ''],
    ['Glass / tumbler', '1–2', 'IN', '₹100–200', '', 'Local steel shop', 'Anytime', ''],
    ['Coffee mugs', '2', 'IN', '₹150–300', '', 'Amazon, local', 'Anytime', ''],
    ['Spoons, forks, butter knife', '1 set', 'IN', '₹200–400', '', 'Amazon, local', 'Anytime', ''],
    ['Knife + peeler + grater', '1 each', 'IN', '₹300–500', '', 'Amazon, local', 'Anytime', ''],
    ['Strainer (tea + big)', '2', 'IN', '₹150–300', '', 'Local', 'Anytime', ''],
    ['Pan (small non-stick)', '1', 'IN', '₹500–900', '', 'Prestige, Amazon', 'Amazon sale', ''],
    ['Small pot for boiling', '1', 'IN', '₹300–600', '', 'Local steel shop', 'Anytime', ''],
    ['Ladle, spatula, tongs', '1 each', 'IN', '₹200–400', '', 'Local', 'Anytime', ''],
    ['Chopping board', '1', 'IN', '₹200–400', '', 'Amazon', 'Anytime', ''],
    ['Fridge containers', '3–4', 'IN', '₹300–600', '', 'Amazon, local', 'Anytime', ''],
    ['Water bottle (reusable)', '1', 'IN', '₹300–700', '', 'Milton, Decathlon', 'Anytime', 'Tap water is drinkable in Germany'],
    ['Kitchen napkins + wipes', 'small pack', 'IN', '₹100–200', '', 'Local', 'Anytime', 'Refill at DM/Lidl later'],
  ],
  Toiletries: [
    ['Toiletries bag', '1', 'IN', '₹300–600', '', 'Amazon, Decathlon', 'Anytime', ''],
    ['Toothbrush + toothpaste', '2 + 1', 'IN', '₹150–300', '', 'Local', 'Anytime', 'Refills at DM/Rossmann €1–2'],
    ['Shampoo + conditioner (small)', '1 each', 'IN', '₹200–400', '', 'Local', 'Anytime', 'Buy big bottles at DM later'],
    ['Body wash + cleanser (small)', '1 each', 'IN', '₹200–400', '', 'Local', 'Anytime', ''],
    ['Moisturiser', '1 big', 'IN', '₹300–600', '', 'Nivea, Cetaphil', 'Anytime', 'German winter = very dry skin, worth carrying'],
    ['Sunscreen', '1', 'IN', '₹400–700', '', 'Amazon, local pharmacy', 'Anytime', ''],
    ['Lip balm', '2', 'IN', '₹100–300', '', 'Nivea, Himalaya', 'Anytime', 'Essential for winter'],
    ['Hair oil', '1 small', 'IN', '₹100–300', '', 'Local', 'Anytime', 'Expensive/rare in Germany'],
    ['Perfume + deodorant', '1 each', 'IN', '₹500–1,200', '', 'Amazon, local', 'Anytime', 'Deos are cheap at DM (€2–3) — carry small'],
    ['Shaving blades / razor', '1 set + refills', 'IN', '₹300–600', '', 'Gillette on Amazon', 'Amazon sale', 'Blade refills are pricey in Germany'],
    ['Nail cutter', '1', 'IN', '₹50–150', '', 'Local', 'Anytime', ''],
    ['Scissors (small)', '1', 'IN', '₹100–200', '', 'Local', 'Anytime', 'Check-in bag only'],
    ['Comb + hairband', '1 each', 'IN', '₹100–200', '', 'Local', 'Anytime', ''],
    ['Ear buds / cleaner', '1 pack', 'IN', '₹50–150', '', 'Local', 'Anytime', ''],
    ['Handwash (small)', '1', 'IN', '₹50–100', '', 'Local', 'Anytime', 'Refill at DM €1'],
    ['Sanitizer', '1 small', 'IN', '₹50–150', '', 'Local', 'Anytime', 'Max 100ml in cabin'],
  ],
  Cleaning: [
    ['Bath mug', '1', 'IN', '₹50–100', '', 'Local', 'Anytime', 'Genuinely hard to find in Germany — carry it'],
    ['Dish soap', 'small', 'DE', '', '€1–2', 'DM, Lidl, Action', 'First week in Germany', 'Heavy liquid — don’t waste luggage weight'],
    ['Scrubs / sponges', '2–3', 'IN', '₹50–150', '', 'Local', 'Anytime', 'Light, carry a few'],
    ['Bathroom cleaner', '1', 'DE', '', '€1–3', 'DM, Rossmann, Action', 'First week in Germany', ''],
    ['Bathroom brush', '1', 'DE', '', '€2–4', 'Action, IKEA', 'First week in Germany', ''],
    ['Cleaning cloths', '3–4', 'IN', '₹100–200', '', 'Local', 'Anytime', ''],
    ['Shoe cleaner', '1', 'DE', '', '€2–4', 'DM, Deichmann', 'When needed', ''],
    ['Washing machine powder/pods', 'starter pack', 'DE', '', '€3–5', 'Lidl, DM', 'First week in Germany', 'German machines need low-suds detergent anyway'],
    ['Room freshener', '1', 'DE', '', '€2–3', 'DM, Action', 'First week in Germany', ''],
  ],
  Stationery: [
    ['Pens', '5–10', 'IN', '₹100–200', '', 'Local', 'Anytime', 'Expensive in Germany (€1–2 each)'],
    ['Notebooks', '2–3', 'IN', '₹150–300', '', 'Local', 'Anytime', ''],
    ['Pencils + eraser + sharpener', '1 set', 'IN', '₹50–100', '', 'Local', 'Anytime', ''],
    ['Markers + highlighters', '2–3', 'IN', '₹150–300', '', 'Local', 'Anytime', ''],
    ['Stapler + staples', '1', 'IN', '₹100–200', '', 'Local', 'Anytime', ''],
    ['Fevicol / glue stick', '1', 'IN', '₹50–100', '', 'Local', 'Anytime', ''],
    ['Paper clips + sticky notes', '1 pack each', 'IN', '₹100–150', '', 'Local', 'Anytime', ''],
    ['Scale (ruler)', '1', 'IN', '₹20–50', '', 'Local', 'Anytime', ''],
    ['Puncher', '1', 'IN', '₹150–250', '', 'Local', 'Anytime', 'German docs love 2-hole punching + folders'],
    ['Paper files / folders', '3–4', 'IN', '₹100–200', '', 'Local', 'Anytime', 'One per: uni, visa, bank, insurance'],
    ['Calculator', '1', 'HAVE', '', '', '', 'Before flight', 'Check if allowed model for exams'],
    ['Cello tape', '1', 'IN', '₹30–60', '', 'Local', 'Anytime', ''],
  ],
  Bedding: [
    ['Bed sheet full sets (king size)', '2 sets', 'IN', '₹1,000–2,000/set', '', 'Amazon, Bombay Dyeing', 'Amazon sale', 'PDF note: 2 full king-size sets'],
    ['Pillow covers', '2', 'IN', '₹200–400', '', 'Amazon, local', 'Anytime', 'Usually included in sheet sets'],
    ['Travel pillow', '1', 'IN', '₹300–600', '', 'Amazon, Decathlon', 'Anytime', 'For the flight itself'],
    ['Pillow', '1–2', 'DE', '', '€5–10', 'IKEA, Lidl', 'First week in Germany', 'Too bulky to carry'],
    ['Duvet / blanket', '1', 'DE', '', '€20–40', 'IKEA, Lidl, Action', 'First week in Germany', 'Listed in your buy-there list — correct call'],
    ['Laundry basket', '1', 'DE', '', '€5–10', 'IKEA, Action', 'First week in Germany', ''],
  ],
  Medicines: [
    ['Paracetamol / Dolo 650', '2–3 strips', 'IN', '₹50–100', '', 'Local pharmacy', 'Last week before flight', 'Carry prescription; pharmacy meds are 5–10x pricier in DE'],
    ['Ondem (nausea)', '1 strip', 'IN', '₹50–100', '', 'Pharmacy (needs prescription)', 'Last week', ''],
    ['Motion sickness tablets (Avomine)', '1 strip', 'IN', '₹30–60', '', 'Pharmacy', 'Last week', ''],
    ['Cold tablets (Cetirizine etc.)', '2 strips', 'IN', '₹30–80', '', 'Pharmacy', 'Last week', ''],
    ['Cough syrup', '1', 'IN', '₹80–150', '', 'Pharmacy', 'Last week', 'Under 100ml or check-in'],
    ['Strepsils', '2 packs', 'IN', '₹60–120', '', 'Pharmacy', 'Last week', ''],
    ['Lomotil (loose motion)', '1 strip', 'IN', '₹30–60', '', 'Pharmacy', 'Last week', ''],
    ['ENO / antacid', '1 pack', 'IN', '₹50–100', '', 'Pharmacy', 'Last week', ''],
    ['Vicks (balm + inhaler)', '1 each', 'IN', '₹100–200', '', 'Pharmacy', 'Last week', ''],
    ['Bandages + crepe bandage + cotton + dressing', '1 kit', 'IN', '₹200–400', '', 'Pharmacy', 'Last week', ''],
    ['Dettol antiseptic', '1 small', 'IN', '₹50–100', '', 'Pharmacy', 'Last week', ''],
    ['Soframycin + Burnol', '1 each', 'IN', '₹60–120', '', 'Pharmacy', 'Last week', ''],
    ['Dusting powder', '1', 'IN', '₹60–120', '', 'Pharmacy', 'Last week', ''],
    ['Relispray / Moov', '1 each', 'IN', '₹150–300', '', 'Pharmacy', 'Last week', ''],
    ['Thermometer', '1', 'IN', '₹150–300', '', 'Amazon, pharmacy', 'Anytime', 'Digital'],
    ['Heat bag + ice pack', '1 each', 'IN', '₹200–400', '', 'Amazon', 'Anytime', ''],
    ['Face masks', '10–20', 'IN', '₹100–200', '', 'Pharmacy', 'Last week', ''],
    ['Vitamin D supplements', '3–6 months', 'IN', '₹200–500', '', 'Pharmacy, Amazon', 'Last week', 'German winter = almost no sun; most students need these'],
    ['Prescription medicines', '3–6 months supply', 'IN', 'varies', '', 'Pharmacy with prescription', 'Last week before flight', 'Must carry prescription copy for customs'],
    ['Spectacles + spare pair', '1+1', 'IN', '₹1,500–4,000', '', 'Lenskart', '2–3 weeks before flight', 'Glasses cost €100+ in Germany'],
  ],
  Miscellaneous: [
    ['Baggage locks (small)', '2 locks, 3 keys each', 'IN', '₹200–400', '', 'Amazon', 'Anytime', 'PDF note: 2 small locks with 3 keys'],
    ['Umbrella (small)', '1', 'IN', '₹300–600', '', 'Amazon, local', 'Anytime', 'Aachen is famous for rain'],
    ['Backpack / daypack', '1', 'HAVE', '', '', '', 'Before flight', 'Doubles as cabin bag'],
    ['Hangers', '10–15', 'DE', '', '€2–5', 'IKEA, Action', 'First week in Germany', 'Bulky, dirt cheap at Action'],
    ['Thread and needle kit', '1', 'IN', '₹50–150', '', 'Local', 'Anytime', ''],
    ['Extra tempered glass (phone)', '2–3', 'IN', '₹200–400', '', 'Amazon', 'Anytime', '€10+ each in Germany'],
    ['Vacuum packaging bags with pump', '1 set', 'IN', '₹500–900', '', 'Amazon', '2 weeks before flight', 'Halves the volume of clothes in luggage'],
  ],
  'Buy in Germany': [
    ['Puffer jacket with hood (rain)', '1', 'DE', '', '€40–80', 'Decathlon, C&A, Uniqlo', 'Black Friday (Nov) / winter sale (Jan–Feb)', 'Your list: buy there — correct, better quality for the price'],
    ['Winter jacket (without hood)', '1', 'DE', '', '€50–120', 'C&A, TK Maxx, Jack Wolfskin outlet', 'Winter sale (Jan–Feb) for best price; Nov if arriving into winter', ''],
    ['Additional kitchen utensils', 'as needed', 'DE', '', '€1–5 each', 'IKEA, Action, Lidl middle aisle', 'First month', ''],
    ['Bulk toiletries (refills)', 'as needed', 'DE', '', '€1–3 each', 'DM, Rossmann', 'After arrival', ''],
    ['Extra winter clothing', 'as needed', 'DE', '', 'varies', 'C&A, H&M, TK Maxx', 'Winter sales (Jan–Feb)', 'Often better quality + cheaper than carrying from India'],
  ],
};

export function seedItems(): SeedItem[] {
  const items: SeedItem[] = [];
  let order = 0;
  for (const [category, rows] of Object.entries(DATA)) {
    for (const [name, qty = '1', buy = 'IN', priceINR = '', priceEUR = '', options = '', bestTime = '', notes = ''] of rows) {
      items.push({ name, category, qty, buy, priceINR, priceEUR, options, bestTime, notes, packed: false, order: order++ });
    }
  }
  return items;
}

export const CATEGORIES = Object.keys(DATA);
