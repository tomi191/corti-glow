import type { Review } from "@/types";

export const reviews: Review[] = [
  {
    id: "1",
    rating: 5,
    title: "Подуването изчезна за 3 дни!",
    content:
      "Опитах всичко за кортизоловия си корем. Това е единственото нещо, което проработи, без да ме успива.",
    author: "Sarah J.",
  },
  {
    id: "2",
    rating: 5,
    title: "Вкус на летен коктейл",
    content:
      "Вкусът на ягода и лайм е невероятен. Очаквам го всяка вечер вместо вино.",
    author: "Elena M.",
  },
  {
    id: "3",
    rating: 5,
    title: "Спя като бебе",
    content:
      "Край на буденето в 3 през нощта. Магнезият е много качествен. Събудих се с прибран корем.",
    author: "Chloe R.",
  },
  {
    id: "4",
    rating: 5,
    title: "Заслужава си парите",
    content:
      "Бях скептична, но науката е истинска. Дрехите ми стоят по-добре само след 2 седмици.",
    author: "Priya K.",
  },
];

export const socialProof = {
  rating: 4.9,
  reviewCount: 500,
  publications: ["VOGUE", "ELLE", "Women'sHealth", "COSMOPOLITAN"],
};
