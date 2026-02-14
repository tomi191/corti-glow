// Glow Guide Quiz - Questions, Options, Weights, Variant Mapping

export interface QuizOption {
  label: string;
  value: number; // 0-4 score
}

export interface QuizQuestion {
  id: string;
  category: "stress" | "sleep" | "skin" | "diet" | "body" | "mood";
  question: string;
  subtitle?: string;
  options: QuizOption[];
  accentColor: string; // brand accent for this question
}

export interface QuizVariant {
  id: string;
  name: string;
  price: number;
  tagline: string;
  description: string;
}

// Category weights for final score (must sum to 1.0)
export const CATEGORY_WEIGHTS: Record<string, number> = {
  stress: 0.25,
  sleep: 0.20,
  skin: 0.15,
  diet: 0.15,
  body: 0.15,
  mood: 0.10,
};

// Score thresholds for variant mapping
export const SCORE_THRESHOLDS = {
  starter: { min: 0, max: 35 },
  glow: { min: 36, max: 65 },
  restart: { min: 66, max: 100 },
} as const;

// Variant recommendations
export const QUIZ_VARIANTS: Record<string, QuizVariant> = {
  starter: {
    id: "starter-box",
    name: "Старт",
    price: 49.99,
    tagline: "Имаш добра база, опитай за оптимизация",
    description:
      "Ти се справяш добре, но Corti-Glow може да ти помогне да оптимизираш съня и енергията. 30 саше за 1 месец.",
  },
  glow: {
    id: "glow-bundle",
    name: "Glow Пакет",
    price: 85.99,
    tagline: "Нуждаеш се от видими резултати за 2 месеца",
    description:
      "Стресът вече засяга кожата и енергията ти. С 2-месечния курс ще видиш реална промяна в сиянието и настроението.",
  },
  restart: {
    id: "restart-bundle",
    name: "Пълен Рестарт",
    price: 119.99,
    tagline: "Пълен хормонален рестарт за 3 месеца",
    description:
      "Тялото ти подава ясни сигнали за кортизолен дисбаланс. 3-месечният курс е твоят пълен рестарт — сън, кожа, енергия, фигура.",
  },
};

// Quiz questions (6 total)
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "stress",
    category: "stress",
    question: "Как се чувстваш повечето дни?",
    subtitle: "Бъди честна — няма грешен отговор.",
    accentColor: "#B2D8C6",
    options: [
      { label: "Спокойна съм, справям се добре", value: 0 },
      { label: "Стресирана съм понякога, но се овладявам", value: 1 },
      { label: "Чувствам постоянно напрежение", value: 3 },
      { label: "На ръба съм — тревожна, изтощена, разсеяна", value: 4 },
    ],
  },
  {
    id: "sleep",
    category: "sleep",
    question: "Как спиш?",
    subtitle: "Съня е огледалото на кортизола.",
    accentColor: "#FFC1CC",
    options: [
      { label: "Заспивам лесно, спя 7-8 часа", value: 0 },
      { label: "Заспивам трудно или се будя 1-2 пъти", value: 2 },
      { label: "Събуждам се уморена, дори след 7+ часа", value: 3 },
      { label: "Безсъние, нощно изпотяване или тревожни сънища", value: 4 },
    ],
  },
  {
    id: "skin",
    category: "skin",
    question: "Какво виждаш в огледалото?",
    subtitle: "Кожата казва много за хормоните.",
    accentColor: "#F4E3B2",
    options: [
      { label: "Чиста, сияйна кожа без проблеми", value: 0 },
      { label: "Леко подпухнало лице сутрин", value: 1 },
      { label: "Суха кожа, тъмни кръгове, матен тен", value: 3 },
      { label: "Акне, зачервявания или ускорено стареене", value: 4 },
    ],
  },
  {
    id: "diet",
    category: "diet",
    question: "Колко кафе и захар на ден?",
    subtitle: "Кафето и захарта директно влияят на кортизола.",
    accentColor: "#B2D8C6",
    options: [
      { label: "1 кафе, малко захар — нямам нужда от повече", value: 0 },
      { label: "2-3 кафета, сладко следобед за енергия", value: 2 },
      { label: "4+ кафета, постоянно ми се яде сладко", value: 3 },
      { label: "Без кафе не функционирам, сладкото е навик", value: 4 },
    ],
  },
  {
    id: "body",
    category: "body",
    question: "Разпознаваш ли тези симптоми?",
    subtitle: "Избери това, което най-добре те описва.",
    accentColor: "#FFC1CC",
    options: [
      { label: "Нищо от тези — чувствам се добре", value: 0 },
      { label: "Леко подуване и задържане на вода", value: 2 },
      { label: "Мазнини около кръста, които не отиват", value: 3 },
      { label: "Косопад, подуване, ПМС, нередовен цикъл", value: 4 },
    ],
  },
  {
    id: "mood",
    category: "mood",
    question: "Как е настроението ти следобед?",
    subtitle: "Следобедният спад разкрива кортизоловия ритъм.",
    accentColor: "#F4E3B2",
    options: [
      { label: "Стабилна енергия целия ден", value: 0 },
      { label: "Лек спад 14-16ч, но се справям", value: 1 },
      { label: "Раздразнителна, искам захар и кафе", value: 3 },
      { label: "Пълно изтощение, мъгла в главата, нулева мотивация", value: 4 },
    ],
  },
];
