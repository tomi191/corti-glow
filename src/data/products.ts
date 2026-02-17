import type { ProductVariant } from "@/types";

export const productVariants: ProductVariant[] = [
  {
    id: "starter-box",
    name: "Старт",
    description: "Идеален за проба. 30 саше.",
    price: 49.99,
    quantity: 1,
    image: "/images/product-bundle-1.webp",
  },
  {
    id: "glow-bundle",
    name: "Glow Пакет",
    description: "За 2 месеца. Видими резултати.",
    price: 85.99,
    compareAtPrice: 99.98,
    quantity: 2,
    isBestSeller: true,
    savings: 14,
    image: "/images/product-bundle-2.webp",
  },
  {
    id: "restart-bundle",
    name: "Пълен Рестарт",
    description: "За 3 месеца. Пълен хормонален ресет.",
    price: 119.99,
    compareAtPrice: 149.97,
    quantity: 3,
    savings: 30,
    image: "/images/product-bundle-3.webp",
  },
];

export const productInfo = {
  name: "Corti-Glow",
  tagline: "Ритуалът за хормонален баланс",
  flavor: "Горска Ягода и Лайм",
  servings: 30,
  image: "/images/product-hero-box.webp",
};

export const ingredients = [
  {
    symbol: "Mg",
    name: "Магнезиев Бисглицинат",
    dosage: "300mg",
    description:
      "Най-усвоимата форма на магнезий. Успокоява мускулите и подобрява съня.",
    color: "#B2D8C6",
    image: "/images/ingredients-magnesium.webp",
  },
  {
    symbol: "KSM",
    name: "Ашваганда (KSM-66)",
    dosage: "300mg",
    description:
      "Клинично доказано намаляване на кортизола с до 27%. Златният стандарт.",
    color: "#FFC1CC",
    image: "/images/ingredients-ashwagandha.webp",
  },
  {
    symbol: "L-T",
    name: "L-Теанин",
    dosage: "200mg",
    description:
      "Аминокиселина от зелен чай. Насърчава алфа мозъчните вълни за спокойна концентрация.",
    color: "#F4E3B2",
    image: "/images/ingredients-l-theanine.webp",
  },
  {
    symbol: "MI",
    name: "Мио-инозитол",
    dosage: "2000mg",
    description:
      "Подкрепя инсулиновата чувствителност и хормоналния баланс при PCOS.",
    color: "#E5E5E5",
    image: "/images/ingredients-inositol.webp",
  },
  {
    symbol: "Br",
    name: "Бромелаин",
    dosage: "500mg",
    description:
      "Ензим от ананас. Премахва задържаната вода и подпомага храносмилането.",
    color: "#FFD4A3",
    image: "/images/ingredients-bromelain.webp",
  },
];

export const features = [
  {
    icon: "droplets",
    iconColor: "#B2D8C6",
    title: "Моментална Лекота",
    description:
      "Бромелаин (от ананас) и Магнезиев Бисглицинат работят заедно, за да изчистят задържаната вода и успокоят стомаха.",
  },
  {
    icon: "brain",
    iconColor: "#FFC1CC",
    title: "Дълбок Анти-Стрес",
    description:
      'KSM-66® Ашваганда и L-Теанин свалят нивата на кортизол с до 27%, превключвайки мозъка от "паника" на "спокойствие".',
  },
  {
    icon: "scale",
    iconColor: "#F4E3B2",
    title: "Хормонален Баланс",
    description:
      "Мио-инозитол подкрепя цикъла, овулацията и инсулиновата чувствителност — за по-лек ПМС и хормонален баланс.",
  },
];

export const howToUse = [
  {
    step: 1,
    title: "Отвори & Изсипи",
    description:
      "Изсипи едно саше в 250мл студена вода. Гледай как розовите минерали се разтварят.",
  },
  {
    step: 2,
    title: "Разбъркай & Добави Лед",
    description:
      "Разбъркай добре (без бучки, никога) и добави лед. Изстискай пресен лайм за още свежест.",
  },
  {
    step: 3,
    title: "Сияй & Релаксирай",
    description:
      "Отпивай бавно. Усети как магнезият успокоява мускулите в рамките на 20 минути.",
  },
];

// Full product for Admin demo (matches database schema)
export const demoProducts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    slug: "corti-glow",
    sku: "CG-001",
    barcode: "3800123456789",
    name: "Corti-Glow",
    tagline: "Ритуалът за хормонален баланс",
    description:
      "Corti-Glow е иновативна формула, създадена специално за жени, които искат да възстановят хормоналния си баланс по естествен начин. Комбинира 5 научно доказани съставки за намаляване на кортизола, подобряване на съня и цялостно благосъстояние.",
    flavor: "Горска Ягода и Лайм",
    servings: 30,
    price: 49.99,
    compare_at_price: null,
    cost_price: 14.57,
    image: "/images/product-hero-box.webp",
    images: [
      "/images/product-hero-box.webp",
      "/images/product-sachet-marble.webp",
      "/images/product-sachet-open.webp",
      "/images/product-pouring.webp",
      "/images/product-glass-ready.webp",
      "/images/product-hand-sachet.webp",
      "/images/product-splash-pour.webp",
      "/images/lifestyle-evening-mocktail.webp",
      "/images/lifestyle-sofa-mocktail.webp",
      "/images/lifestyle-nightstand-ritual.webp",
      "/images/mocktail-ashwagandha-flatlay.webp",
    ],
    stock: 247,
    low_stock_threshold: 20,
    track_inventory: true,
    status: "active" as const,
    badge: "Бестселър",
    features: [
      {
        icon: "droplets",
        icon_color: "#B2D8C6",
        title: "Моментална Лекота",
        description:
          "Бромелаин (от ананас) и Магнезиев Бисглицинат работят заедно, за да изчистят задържаната вода и успокоят стомаха.",
      },
      {
        icon: "brain",
        icon_color: "#FFC1CC",
        title: "Дълбок Анти-Стрес",
        description:
          "KSM-66 Ашваганда и L-Теанин свалят нивата на кортизол с до 27%, превключвайки мозъка от паника на спокойствие.",
      },
      {
        icon: "scale",
        icon_color: "#F4E3B2",
        title: "Хормонален Баланс",
        description:
          "Мио-инозитол подкрепя цикъла, овулацията и инсулиновата чувствителност — за по-лек ПМС и хормонален баланс.",
      },
    ],
    ingredients: [
      {
        symbol: "Mg",
        name: "Магнезиев Бисглицинат",
        dosage: "300mg",
        description:
          "Най-усвоимата форма на магнезий. Успокоява мускулите и подобрява съня.",
        color: "#B2D8C6",
      },
      {
        symbol: "KSM",
        name: "Ашваганда (KSM-66)",
        dosage: "300mg",
        description:
          "Клинично доказано намаляване на кортизола с до 27%. Златният стандарт.",
        color: "#FFC1CC",
      },
      {
        symbol: "L-T",
        name: "L-Теанин",
        dosage: "200mg",
        description:
          "Аминокиселина от зелен чай. Насърчава алфа мозъчните вълни за спокойна концентрация.",
        color: "#F4E3B2",
      },
      {
        symbol: "MI",
        name: "Мио-инозитол",
        dosage: "2000mg",
        description:
          "Подкрепя инсулиновата чувствителност и хормоналния баланс при PCOS.",
        color: "#E5E5E5",
      },
      {
        symbol: "Br",
        name: "Бромелаин",
        dosage: "500mg",
        description:
          "Ензим от ананас. Премахва задържаната вода и подпомага храносмилането.",
        color: "#FFD4A3",
      },
    ],
    variants: [
      {
        id: "starter-box",
        name: "Старт",
        description: "Идеален за проба. 30 саше.",
        price: 49.99,
        quantity: 1,
      },
      {
        id: "glow-bundle",
        name: "Glow Пакет",
        description: "За 2 месеца. Видими резултати.",
        price: 85.99,
        compare_at_price: 99.98,
        quantity: 2,
        is_best_seller: true,
        savings: 14,
      },
      {
        id: "restart-bundle",
        name: "Пълен Рестарт",
        description: "За 3 месеца. Пълен хормонален ресет.",
        price: 119.99,
        compare_at_price: 149.97,
        quantity: 3,
        savings: 30,
      },
    ],
    how_to_use: [
      {
        step: 1,
        title: "Отвори & Изсипи",
        description:
          "Изсипи едно саше в 250мл студена вода. Гледай как розовите минерали се разтварят.",
      },
      {
        step: 2,
        title: "Разбъркай & Добави Лед",
        description:
          "Разбъркай добре (без бучки, никога) и добави лед. Изстискай пресен лайм за още свежест.",
      },
      {
        step: 3,
        title: "Сияй & Релаксирай",
        description:
          "Отпивай бавно. Усети как магнезият успокоява мускулите в рамките на 20 минути.",
      },
    ],
    meta_title: "Corti-Glow | Хормонален Баланс за Жени | LuraLab",
    meta_description:
      "Открий Corti-Glow - иновативна формула с Ашваганда KSM-66, Магнезий и Мио-инозитол за намаляване на кортизола и хормонален баланс. Безплатна доставка над 80 €.",
    weight: 0.45,
    dimensions: { length: 18, width: 12, height: 8 },
    created_at: "2024-01-15T10:00:00Z",
    updated_at: new Date().toISOString(),
    published: true,
  },
];
