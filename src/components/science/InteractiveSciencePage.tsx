"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Brain,
  Droplets,
  Moon,
  Scale,
  Sparkles,
  ChevronRight,
  ArrowRight,
  TrendingDown,
  Clock,
  Beaker,
  Award,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedHeading } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ingredients } from "@/data/products";

const sections = [
  { id: "cortisol", title: "Какво е Кортизол?", icon: Brain },
  { id: "cycle", title: "Порочният Кръг", icon: Clock },
  { id: "solution", title: "Решението", icon: Sparkles },
  { id: "ingredients", title: "Съставки", icon: Beaker },
  { id: "studies", title: "Проучвания", icon: Award },
];

// Interactive Cortisol Graph Component
function CortisolGraph() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const data = [
    { day: 0, normal: 85, withProduct: 85 },
    { day: 7, normal: 82, withProduct: 72 },
    { day: 14, normal: 80, withProduct: 65 },
    { day: 21, normal: 78, withProduct: 60 },
    { day: 30, normal: 75, withProduct: 55 },
  ];

  return (
    <div ref={ref} className="relative bg-white rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#2D4A3E]">
          Нива на Кортизол (nmol/L)
        </h3>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-stone-300" />
            <span className="text-stone-500">Без Corti-Glow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#B2D8C6]" />
            <span className="text-stone-500">С Corti-Glow</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative h-64">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="40"
              y1={180 - y * 1.6}
              x2="380"
              y2={180 - y * 1.6}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {[50, 60, 70, 80, 90].map((val, i) => (
            <text
              key={val}
              x="30"
              y={180 - i * 32}
              fontSize="10"
              fill="#9ca3af"
              textAnchor="end"
            >
              {val}
            </text>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={d.day}
              x={60 + i * 80}
              y="195"
              fontSize="10"
              fill="#9ca3af"
              textAnchor="middle"
            >
              Ден {d.day}
            </text>
          ))}

          {/* Normal line (gray) */}
          <motion.path
            d={`M ${data.map((d, i) => `${60 + i * 80},${180 - (d.normal - 50) * 3.2}`).join(" L ")}`}
            fill="none"
            stroke="#d1d5db"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isAnimated ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Product line (green) */}
          <motion.path
            d={`M ${data.map((d, i) => `${60 + i * 80},${180 - (d.withProduct - 50) * 3.2}`).join(" L ")}`}
            fill="none"
            stroke="#B2D8C6"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isAnimated ? 1 : 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          />

          {/* Interactive dots */}
          {data.map((d, i) => (
            <g key={d.day}>
              {/* Normal dot */}
              <motion.circle
                cx={60 + i * 80}
                cy={180 - (d.normal - 50) * 3.2}
                r={hoveredDay === i ? 8 : 5}
                fill="#d1d5db"
                initial={{ scale: 0 }}
                animate={{ scale: isAnimated ? 1 : 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
                className="cursor-pointer"
              />
              {/* Product dot */}
              <motion.circle
                cx={60 + i * 80}
                cy={180 - (d.withProduct - 50) * 3.2}
                r={hoveredDay === i ? 8 : 5}
                fill="#B2D8C6"
                initial={{ scale: 0 }}
                animate={{ scale: isAnimated ? 1 : 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
                className="cursor-pointer"
              />
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredDay !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bg-[#2D4A3E] text-white px-4 py-2 rounded-lg text-sm shadow-xl"
              style={{
                left: `${15 + hoveredDay * 20}%`,
                top: "20%",
              }}
            >
              <p className="font-semibold">Ден {data[hoveredDay].day}</p>
              <p className="text-[#B2D8C6]">
                -{data[hoveredDay].normal - data[hoveredDay].withProduct}% с Corti-Glow
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isAnimated ? 1 : 0, y: isAnimated ? 0 : 20 }}
        transition={{ delay: 1.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-[#B2D8C6]/20 to-[#FFC1CC]/20 rounded-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <TrendingDown className="w-6 h-6 text-[#2D4A3E]" />
          <span className="font-medium text-[#2D4A3E]">Намаление на кортизола</span>
        </div>
        <span className="text-2xl font-bold text-[#2D4A3E]">-27%</span>
      </motion.div>
    </div>
  );
}

// Sticky Table of Contents
function StickyToC({ activeSection }: { activeSection: string }) {
  return (
    <nav className="hidden lg:block sticky top-32 w-64 shrink-0">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
        Съдържание
      </p>
      <ul className="space-y-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-[#2D4A3E] text-white shadow-lg"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <section.icon className={`w-4 h-4 ${isActive ? "text-[#B2D8C6]" : ""}`} />
                <span className="text-sm font-medium">{section.title}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Quick CTA */}
      <div className="mt-8 p-4 bg-gradient-to-br from-[#B2D8C6]/20 to-[#FFC1CC]/20 rounded-2xl">
        <p className="text-sm text-[#2D4A3E] font-medium mb-3">
          Готова да опиташ?
        </p>
        <Link
          href="/produkt"
          className="flex items-center gap-2 text-sm text-[#2D4A3E] font-semibold hover:gap-3 transition-all"
        >
          Виж продукта
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}

export function InteractiveSciencePage() {
  const [activeSection, setActiveSection] = useState("cortisol");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="bg-white">
      {/* Hero */}
      <section className="relative py-12 md:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F2EF] to-white" />
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[#B2D8C6]/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <ScrollReveal animation="blur-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg text-[#2D4A3E] text-sm font-medium mb-8">
              <Beaker className="w-4 h-4" />
              Базирано на Наука
            </span>
          </ScrollReveal>

          <ScrollReveal animation="blur-slide" delay={0.1}>
            <AnimatedHeading>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
                Науката зад
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC]">
                  Corti-Glow
                </span>
              </h1>
            </AnimatedHeading>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.2}>
            <p className="text-base md:text-xl text-stone-600 font-light max-w-2xl mx-auto">
              Разбери как хроничният стрес влияе на тялото ти и как нашата формула
              помага да възстановиш баланса.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content with Sticky ToC */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        <div className="flex gap-8 lg:gap-16">
          <StickyToC activeSection={activeSection} />

          {/* Content */}
          <div className="flex-1 max-w-3xl">
            {/* Section: What is Cortisol */}
            <section id="cortisol" className="mb-12 md:mb-24 scroll-mt-32">
              <ScrollReveal animation="fade-up">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#2D4A3E] mb-6 md:mb-8">
                  Какво е Кортизол?
                </h2>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={0.1}>
                <p className="text-lg text-stone-600 leading-relaxed mb-8">
                  Кортизолът е хормон, произвеждан от надбъбречните жлези. Известен е
                  като &quot;хормонът на стреса&quot;, защото се отделя в отговор на стрес и
                  ниска кръвна захар.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Brain, title: "Когнитивна функция", desc: "Влияе на паметта и концентрацията" },
                    { icon: Moon, title: "Сън", desc: "Регулира циркадния ритъм" },
                    { icon: Droplets, title: "Метаболизъм", desc: "Контролира как тялото използва енергия" },
                    { icon: Scale, title: "Тегло", desc: "Влияе на разпределението на мазнини" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-5 bg-stone-50 rounded-2xl flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#B2D8C6]/30 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[#2D4A3E]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#2D4A3E]">{item.title}</h4>
                        <p className="text-sm text-stone-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </section>

            {/* Section: The Vicious Cycle */}
            <section id="cycle" className="mb-12 md:mb-24 scroll-mt-32">
              <ScrollReveal animation="fade-up">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#2D4A3E] mb-6 md:mb-8">
                  Порочният Кръг на Стреса
                </h2>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={0.1}>
                <div className="relative">
                  {/* Cycle visualization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { num: 1, title: "Стрес", desc: "Хроничен стрес от работа, семейство, социални мрежи", color: "#ef4444" },
                      { num: 2, title: "Висок кортизол", desc: "Надбъбречните жлези отделят повече кортизол", color: "#f97316" },
                      { num: 3, title: "Симптоми", desc: "Подуване, безсъние, глад за захар, умора", color: "#eab308" },
                      { num: 4, title: "Лош сън", desc: "Липсата на сън повишава още кортизола", color: "#6366f1" },
                    ].map((step, i) => (
                      <motion.div
                        key={step.num}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative p-6 bg-white rounded-2xl border border-stone-100 shadow-lg"
                      >
                        <div
                          className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: step.color }}
                        >
                          {step.num}
                        </div>
                        <h4 className="font-semibold text-[#2D4A3E] mt-2 mb-1">{step.title}</h4>
                        <p className="text-sm text-stone-500">{step.desc}</p>
                        {i < 3 && (
                          <ChevronRight
                            className="absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-300 hidden md:block"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </section>

            {/* Section: The Solution */}
            <section id="solution" className="mb-12 md:mb-24 scroll-mt-32">
              <ScrollReveal animation="fade-up">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#2D4A3E] mb-6 md:mb-8">
                  Решението: Corti-Glow
                </h2>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={0.1}>
                <p className="text-lg text-stone-600 leading-relaxed mb-8">
                  Corti-Glow е създаден да прекъсне порочния кръг на стреса с клинично
                  доказани съставки, които работят синергично.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="scale-up" delay={0.2}>
                <CortisolGraph />
              </ScrollReveal>
            </section>

            {/* Section: Ingredients */}
            <section id="ingredients" className="mb-12 md:mb-24 scroll-mt-32">
              <ScrollReveal animation="fade-up">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#2D4A3E] mb-6 md:mb-8">
                  Клинично Доказани Съставки
                </h2>
              </ScrollReveal>

              {/* Ingredients Flat Lay Image */}
              <ScrollReveal animation="scale-up" delay={0.1}>
                <div className="relative w-full aspect-[16/9] mb-8 md:mb-12 rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/ingredients-flatlay.webp"
                    alt="Corti-Glow ingredients - ashwagandha, lime, strawberry"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E]/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white/90 text-lg font-medium">
                      Натурални съставки в перфектен баланс
                    </p>
                    <p className="text-white/70 text-sm mt-1">
                      Ашваганда • Магнезий • Инозитол • Бромелаин
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <div className="space-y-4 md:space-y-6">
                {ingredients.map((ing, i) => (
                  <ScrollReveal key={ing.name} animation="fade-left" delay={i * 0.1}>
                    <div className="group p-6 bg-white rounded-2xl border border-stone-100 hover:shadow-xl hover:border-[#B2D8C6]/50 transition-all duration-300">
                      <div className="flex items-start gap-6">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${ing.color}20`, color: ing.color }}
                        >
                          {ing.symbol}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-[#2D4A3E]">
                              {ing.name}
                            </h3>
                            <span
                              className="px-3 py-1 rounded-full text-sm font-bold"
                              style={{ backgroundColor: `${ing.color}20`, color: ing.color }}
                            >
                              {ing.dosage}
                            </span>
                          </div>
                          <p className="text-stone-600">{ing.description}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>

            {/* Section: Studies */}
            <section id="studies" className="mb-12 md:mb-24 scroll-mt-32">
              <ScrollReveal animation="fade-up">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#2D4A3E] mb-6 md:mb-8">
                  Клинични Проучвания
                </h2>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={0.1}>
                <div className="space-y-6">
                  {[
                    {
                      title: "KSM-66® Ashwagandha Study",
                      journal: "Journal of Clinical Medicine, 2019",
                      result: "27.9% намаление на кортизола след 60 дни",
                      participants: "60 участника",
                    },
                    {
                      title: "Magnesium and Sleep Quality",
                      journal: "Journal of Research in Medical Sciences, 2012",
                      result: "Подобрен сън и намален стрес",
                      participants: "46 участника",
                    },
                    {
                      title: "Myo-Inositol for PCOS",
                      journal: "European Review for Medical and Pharmacological Sciences, 2017",
                      result: "Подобрен хормонален баланс",
                      participants: "50 участника",
                    },
                  ].map((study, i) => (
                    <div
                      key={study.title}
                      className="p-6 bg-gradient-to-r from-stone-50 to-white rounded-2xl border border-stone-100"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#2D4A3E] flex items-center justify-center text-white font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#2D4A3E] mb-1">{study.title}</h4>
                          <p className="text-sm text-stone-400 mb-2">{study.journal}</p>
                          <p className="text-[#2D4A3E] font-medium">{study.result}</p>
                          <p className="text-xs text-stone-400 mt-1">{study.participants}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </section>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <section className="py-12 md:py-20 bg-[#2D4A3E] relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, #B2D8C6 0%, transparent 50%)",
          }}
        />

        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <ScrollReveal animation="blur-in">
            <h2 className="text-2xl md:text-5xl font-semibold text-white mb-6">
              Готова да Прекъснеш Цикъла?
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.1}>
            <p className="text-lg text-white/70 mb-6 md:mb-8">
              Започни своя път към хормонален баланс с клинично доказани съставки.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="scale-up" delay={0.2}>
            <MagneticButton
              variant="secondary"
              size="lg"
              href="/produkt"
              className="bg-white text-[#2D4A3E]"
            >
              Виж Продукта
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
