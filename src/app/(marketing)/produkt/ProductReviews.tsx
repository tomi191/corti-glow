"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Verified, ChevronDown, Quote, TrendingUp } from "lucide-react";

const reviews = [
  {
    id: 1,
    rating: 5,
    title: "Животът ми се промени!",
    content:
      "След 3 седмици с Corti-Glow забелязах огромна разлика. Подуването изчезна, спя като бебе, и колегите ме питат какво правя различно. Кожата ми сияе!",
    author: "Мария К.",
    location: "София",
    date: "преди 2 дни",
    verified: true,
    helpful: 47,
    stat: "-4 см талия",
  },
  {
    id: 2,
    rating: 5,
    title: "Скептична бях, но...",
    content:
      "Честно казано, не вярвах че ще работи. Но след 2 седмици дрехите ми стоят различно, чувствам се по-спокойна. Вече съм на третата кутия!",
    author: "Петя Д.",
    location: "Стара Загора",
    date: "преди 1 седмица",
    verified: true,
    helpful: 32,
  },
  {
    id: 3,
    rating: 5,
    title: "Хормоните ми са балансирани",
    content:
      "Имах проблеми с PCOS години. Инозитолът в тази доза е точно това, което ми препоръча ендокринологът. Corti-Glow го прави лесно и вкусно.",
    author: "Габриела Т.",
    location: "Бургас",
    date: "преди 3 дни",
    verified: true,
    helpful: 28,
    stat: "2000mg инозитол",
  },
  {
    id: 4,
    rating: 5,
    title: "Вечерният ми ритуал",
    content:
      "Чакам го всяка вечер като награда след дълъг ден. Вкусът е невероятен, а ефектът върху съня ми е очевиден от първата седмица.",
    author: "Ева М.",
    location: "Варна",
    date: "преди 5 дни",
    verified: true,
    helpful: 21,
  },
  {
    id: 5,
    rating: 5,
    title: "Край на безсънието",
    content:
      "Години наред се бореше със заспиването. Магнезият в тази формула е различен - усещам как мускулите ми се отпускат след 20 минути.",
    author: "Ина Р.",
    location: "Пловдив",
    date: "преди 1 седмица",
    verified: true,
    helpful: 19,
  },
  {
    id: 6,
    rating: 5,
    title: "По-добро настроение",
    content:
      "След няколко седмици с Corti-Glow, спя като бебе, подуването ми изчезна и имам енергия за двама! Настроението ми е много по-добро. Препоръчвам го с две ръце!",
    author: "Елена П.",
    location: "София",
    date: "преди 4 дни",
    verified: true,
    helpful: 15,
    stat: "По-добър сън",
  },
  {
    id: 7,
    rating: 5,
    title: "Препоръчано от доктор",
    content:
      "Ендокринологът ми препоръча да взимам магнезий и ашваганда. Corti-Glow съдържа точно това, което ми трябва, и вкусът е бонус!",
    author: "Десислава М.",
    location: "Русе",
    date: "преди 6 дни",
    verified: true,
    helpful: 24,
  },
  {
    id: 8,
    rating: 4,
    title: "Добър продукт",
    content:
      "Харесва ми вкусът и се чувствам по-спокойна. Единствено бих искала по-голяма опаковка. Но определено ще поръчам пак.",
    author: "Радостина К.",
    location: "Плевен",
    date: "преди 2 седмици",
    verified: true,
    helpful: 8,
  },
  {
    id: 9,
    rating: 5,
    title: "Работи бързо!",
    content:
      "Очаквах да минат седмици, преди да усетя ефект. Но още от втория ден заспивам по-лесно. Магнезият е магия!",
    author: "Теодора С.",
    location: "Благоевград",
    date: "преди 3 дни",
    verified: true,
    helpful: 31,
    stat: "Резултат от ден 2",
  },
];

const stats = {
  average: 4.9,
  total: 487,
  distribution: [
    { stars: 5, percent: 89 },
    { stars: 4, percent: 8 },
    { stars: 3, percent: 2 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 0 },
  ],
};

export function ProductReviews() {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section className="py-16 bg-[#F5F2EF]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-3xl font-semibold text-[#2D4A3E] mb-2">
              Какво казват клиентите
            </h2>
            <p className="text-stone-600">
              Реални отзиви от реални жени
            </p>
          </div>

          {/* Stats Summary */}
          <div className="flex items-center gap-8 bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#2D4A3E]">
                {stats.average}
              </div>
              <div className="flex gap-0.5 justify-center my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-current text-[#F4E3B2]"
                  />
                ))}
              </div>
              <div className="text-xs text-stone-500">
                {stats.total.toLocaleString()} отзива
              </div>
            </div>

            <div className="hidden md:block space-y-1">
              {stats.distribution.map((d) => (
                <div key={d.stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-stone-500">{d.stars}</span>
                  <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F4E3B2] rounded-full"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-stone-400">{d.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {displayedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Rating */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-current text-[#F4E3B2]"
                    />
                  ))}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-[#2D4A3E] mb-2">
                  "{review.title}"
                </h3>

                {/* Content */}
                <p className="text-sm text-stone-600 mb-4 line-clamp-3">
                  {review.content}
                </p>

                {/* Stat badge */}
                {review.stat && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#B2D8C6]/20 mb-4">
                    <TrendingUp className="w-4 h-4 text-[#2D4A3E]" />
                    <span className="text-sm font-medium text-[#2D4A3E]">
                      {review.stat}
                    </span>
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#B2D8C6]/30 flex items-center justify-center text-xs font-bold text-[#2D4A3E]">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-[#2D4A3E]">
                          {review.author}
                        </span>
                        {review.verified && (
                          <Verified className="w-4 h-4 text-[#B2D8C6]" />
                        )}
                      </div>
                      <span className="text-xs text-stone-400">
                        {review.location} · {review.date}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-stone-400">
                    {review.helpful} намериха полезно
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show More Button */}
        {reviews.length > 3 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-full text-stone-600 font-medium hover:bg-stone-50 transition"
            >
              {showAll ? "Покажи по-малко" : `Виж всички ${reviews.length} отзива`}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
