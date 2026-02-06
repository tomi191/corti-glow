"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Star, Quote, Verified, TrendingUp } from "lucide-react";
import { AnimatedHeading } from "@/components/ui/AnimatedText";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";

const reviews = [
  {
    id: 1,
    size: "large", // Takes 2 columns
    rating: 5,
    title: "Животът ми се промени!",
    content:
      "След 3 седмици с Corti-Glow забелязах огромна разлика. Подуването изчезна, спя като бебе, и колегите ме питат какво правя различно. Кожата ми сияе!",
    author: "Мария К.",
    location: "София",
    verified: true,
    highlight: true,
    stat: { value: "-4 см", label: "талия" },
  },
  {
    id: 2,
    size: "medium",
    rating: 5,
    title: "Вечерният ми ритуал",
    content: "Чакам го всяка вечер като награда след дълъг ден.",
    author: "Ева М.",
    location: "Варна",
    verified: true,
    image: "/images/lifestyle-evening-mocktail.webp",
  },
  {
    id: 3,
    size: "small",
    rating: 5,
    title: "Спя отново",
    content: "Край на безсънието!",
    author: "Ина Р.",
    location: "Пловдив",
    verified: true,
  },
  {
    id: 4,
    size: "medium",
    rating: 5,
    title: "Хормоните ми са балансирани",
    content:
      "Имах проблеми с PCOS години. Инозитолът в тази доза е точно това, което ми препоръча ендокринологът.",
    author: "Габриела Т.",
    location: "Бургас",
    verified: true,
    stat: { value: "2000mg", label: "инозитол" },
  },
  {
    id: 5,
    size: "small",
    rating: 5,
    title: "Без подуване",
    content: "Резултат за 3 дни!",
    author: "Надя С.",
    location: "Русе",
    verified: true,
    image: "/images/lifestyle-nightstand-ritual.webp",
  },
  {
    id: 6,
    size: "large",
    rating: 5,
    title: "Скептична бях, но...",
    content:
      "Честно казано, не вярвах че ще работи. Но след 2 седмици дрехите ми стоят различно, чувствам се по-спокойна, и мъжът ми забеляза че съм по-щастлива. Вече съм на третата кутия!",
    author: "Петя Д.",
    location: "Стара Загора",
    verified: true,
    highlight: true,
  },
];

function ReviewCard({ review, index }: { review: typeof reviews[0]; index: number }) {
  const isLarge = review.size === "large";
  const isSmall = review.size === "small";
  const hasImage = !!review.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`
        group relative rounded-3xl overflow-hidden
        ${isLarge ? "md:col-span-2 md:row-span-1" : ""}
        ${isSmall ? "aspect-square md:aspect-auto" : ""}
        ${hasImage ? "min-h-[280px]" : ""}
        ${review.highlight
          ? "bg-gradient-to-br from-[#2D4A3E] to-[#1a2d25] text-white"
          : hasImage
          ? "bg-[#2D4A3E]"
          : "bg-white border border-stone-100"
        }
        shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(45,74,62,0.15)]
        transition-all duration-500
      `}
    >
      {/* Background Image */}
      {hasImage && (
        <>
          <Image
            src={review.image}
            alt={review.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E] via-[#2D4A3E]/60 to-transparent" />
        </>
      )}

      {/* Decorative gradient orb */}
      {review.highlight && !hasImage && (
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#B2D8C6]/20 rounded-full blur-3xl" />
      )}

      <div className={`relative p-6 ${isLarge ? "md:p-8" : ""} ${isSmall ? "p-5" : ""} h-full flex flex-col`}>
        {/* Quote icon for large cards */}
        {isLarge && (
          <Quote
            className={`w-10 h-10 mb-4 ${review.highlight ? "text-[#B2D8C6]/50" : "text-[#B2D8C6]"}`}
          />
        )}

        {/* Rating */}
        <div className="flex gap-0.5 mb-3">
          {[...Array(review.rating)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 fill-current ${review.highlight ? "text-[#F4E3B2]" : "text-[#F4E3B2]"}`}
            />
          ))}
        </div>

        {/* Title */}
        <h3
          className={`font-semibold mb-2 ${isLarge ? "text-xl" : isSmall ? "text-base" : "text-lg"} ${
            review.highlight || hasImage ? "text-white" : "text-[#2D4A3E]"
          }`}
        >
          &ldquo;{review.title}&rdquo;
        </h3>

        {/* Content */}
        {!isSmall && (
          <p
            className={`text-sm leading-relaxed flex-1 ${
              review.highlight || hasImage ? "text-white/80" : "text-stone-600"
            }`}
          >
            {review.content}
          </p>
        )}

        {/* Stat badge */}
        {review.stat && (
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl mt-4 ${
              review.highlight ? "bg-white/10" : "bg-[#B2D8C6]/20"
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${review.highlight ? "text-[#B2D8C6]" : "text-[#2D4A3E]"}`} />
            <span className={`font-bold ${review.highlight ? "text-white" : "text-[#2D4A3E]"}`}>
              {review.stat.value}
            </span>
            <span className={`text-xs ${review.highlight ? "text-white/60" : "text-stone-500"}`}>
              {review.stat.label}
            </span>
          </div>
        )}

        {/* Author */}
        <div className={`flex items-center gap-3 mt-4 pt-4 border-t ${
          review.highlight || hasImage ? "border-white/10" : "border-stone-100"
        }`}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              review.highlight || hasImage
                ? "bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] text-[#2D4A3E]"
                : "bg-gradient-to-br from-[#FFC1CC]/50 to-[#B2D8C6]/50 text-[#2D4A3E]"
            }`}
          >
            {review.author.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm ${review.highlight || hasImage ? "text-white" : "text-[#2D4A3E]"}`}>
                {review.author}
              </span>
              {review.verified && (
                <Verified className="w-4 h-4 text-[#B2D8C6]" />
              )}
            </div>
            <span className={`text-xs ${review.highlight || hasImage ? "text-white/70" : "text-stone-400"}`}>
              {review.location}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BentoReviews() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-32 relative overflow-hidden bg-[#F5F2EF]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-50">
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#2D4A3E" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal animation="blur-in">
            <span className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6">
              <Star className="w-4 h-4 fill-current text-[#F4E3B2]" />
              500+ Доволни Клиенти
            </span>
          </ScrollReveal>

          <ScrollReveal animation="blur-slide" delay={0.1}>
            <AnimatedHeading>
              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
                Истории на
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] via-[#2D4A3E] to-[#FFC1CC]">
                  Трансформация
                </span>
              </h2>
            </AnimatedHeading>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.2}>
            <p className="text-lg text-stone-600 font-light">
              Реални жени. Реални резултати. Без филтри.
            </p>
          </ScrollReveal>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>

        {/* Stats Row */}
        <ScrollReveal animation="fade-up" delay={0.5}>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-12 border-t border-stone-200">
            {[
              { value: "4.9", label: "Средна оценка", suffix: "/5" },
              { value: "500+", label: "Доволни клиенти", suffix: "" },
              { value: "92%", label: "Виждат резултат", suffix: "" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#2D4A3E]">
                  {stat.value}
                  <span className="text-[#B2D8C6]">{stat.suffix}</span>
                </div>
                <div className="text-sm text-stone-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
