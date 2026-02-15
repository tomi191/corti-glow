"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Check, X, Beaker, Award, Heart, Sparkles } from "lucide-react";

const comparisons = [
  {
    feature: "Клинично доказани дозировки",
    us: true,
    others: false,
  },
  {
    feature: "KSM-66® Ашваганда (300mg)",
    us: true,
    others: false,
  },
  {
    feature: "Магнезиев бисглицинат (най-усвоима форма)",
    us: true,
    others: false,
  },
  {
    feature: "Мио-инозитол 2000mg за PCOS",
    us: true,
    others: false,
  },
  {
    feature: "Без захар, без ГМО, веган",
    us: true,
    others: "частично",
  },
  {
    feature: "Вкусен (Горска Ягода & Лайм)",
    us: true,
    others: "рядко",
  },
  {
    feature: "14-дневна гаранция за връщане",
    us: true,
    others: false,
  },
];

const benefits = [
  {
    icon: Beaker,
    title: "5 Активни Съставки",
    description: "Научно подбрани за синергичен ефект",
  },
  {
    icon: Award,
    title: "Премиум Качество",
    description: "Използваме само патентовани екстракти",
  },
  {
    icon: Heart,
    title: "Създадено за Жени",
    description: "Формула, адресираща женските хормони",
  },
  {
    icon: Sparkles,
    title: "Резултати за 14 дни",
    description: "92% виждат подобрение в първите 2 седмици",
  },
];

export function WhyCortiGlow() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFC1CC]/20 text-[#2D4A3E] text-sm font-medium mb-4">
            Защо Corti-Glow?
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2D4A3E] mb-4">
            Не всички добавки са еднакви
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Corti-Glow използва само патентовани съставки в клинично доказани дозировки
          </p>
        </div>

        {/* Comparison Table with Image */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12 items-center">
          {/* Lifestyle Image */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg">
              <Image
                src="/images/product-glass-ready.webp"
                alt="Corti-Glow готов моктейл"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 0px, 40vw"
              />
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3 bg-gradient-to-br from-stone-50 to-white rounded-3xl p-8 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="col-span-1" />
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Corti-Glow
                </div>
              </div>
              <div className="text-center text-stone-500 text-sm font-medium">
                Други продукти
              </div>
            </div>

            <div className="space-y-3">
              {comparisons.map((item, index) => (
                <motion.div
                  key={index}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05 }}
                  className="grid grid-cols-3 gap-4 items-center py-3 border-b border-stone-100 last:border-0"
                >
                  <div className="text-sm text-stone-700">{item.feature}</div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#B2D8C6]">
                      <Check className="w-5 h-5 text-[#2D4A3E]" />
                    </div>
                  </div>
                  <div className="text-center">
                    {item.others === true ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : item.others === false ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                        <X className="w-5 h-5 text-red-500" />
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400">{item.others}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
              className="bg-stone-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-6 h-6 text-[#2D4A3E]" />
              </div>
              <h3 className="font-semibold text-[#2D4A3E] mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-stone-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
