// Pre-launch Mode
export const IS_PRELAUNCH = process.env.NEXT_PUBLIC_PRELAUNCH === "true";

export const STATS = {
  rating: 4.9,
  clients: 500,
  results: 92,
  cortisol: 27,
};

// Brand Colors
export const COLORS = {
  forest: "#2D4A3E",
  sage: "#B2D8C6",
  blush: "#FFC1CC",
  cream: "#F4E3B2",
  sand: "#F5F2EF",
} as const;

// Shipping
export const SHIPPING_THRESHOLD = 80; // EUR for free shipping
export const DELIVERY_DAYS = "1-2";
export const CARRIERS = ["Спиди", "Еконт"] as const;

// Company Info
export const COMPANY = {
  name: '"Лура Лаб" ЕООД',
  address: 'гр. София, бул. "Витоша" 10',
  email: "contact@luralab.eu",
  phone: "+359 88 XXX XXXX", // TODO: Replace with real phone number
  eik: "207712345", // TODO: Replace with real ЕИК
} as const;

// Social Links
export const SOCIAL = {
  instagram: "https://instagram.com/luralab",
  facebook: "https://facebook.com/luralab",
} as const;

// Site Config
export const SITE_CONFIG = {
  name: "LURA",
  url: "https://luralab.eu",
  locale: "bg_BG",
} as const;

// Navigation Links
export const NAV_LINKS = [
  { href: "/magazin", label: "Магазин" },
  { href: "/glow-guide", label: "Glow Guide" },
  { href: "/nauka", label: "Наука" },
  { href: "/blog", label: "Блог" },
] as const;

// Footer Links
export const FOOTER_LINKS = {
  shop: [
    { href: "/magazin", label: "Магазин" },
    { href: "/produkt/corti-glow", label: "Corti-Glow" },
    { href: "/produkt/corti-glow#bundles", label: "Пакети" },
    { href: "/blog", label: "Блог" },
  ],
  help: [
    { href: "/pomosht", label: "Контакт" },
    { href: "/dostavka-i-vrashtane", label: "Доставка & Връщане" },
    { href: "/prosledi-porachka", label: "Проследи Поръчка" },
    { href: "/akount", label: "Моят Акаунт" },
    { href: "/app", label: "LURA Навигатор" },
  ],
  legal: [
    { href: "/obshti-usloviya", label: "Общи условия" },
    { href: "/poveritelnost", label: "Поверителност" },
  ],
} as const;
