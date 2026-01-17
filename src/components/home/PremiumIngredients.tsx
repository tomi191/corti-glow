"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Leaf, FlaskConical, Award, ChevronRight, Gem, Cherry, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedHeading } from "@/components/ui/AnimatedText";

const ingredients: {
  id: string;
  name: string;
  dose: string;
  icon: LucideIcon;
  color: string;
  description: string;
  benefits: string[];
  studies: string;
}[] = [
  {
    id: "ashwagandha",
    name: "KSM-66® Ашваганда",
    dose: "600mg",
    icon: Leaf,
    color: "#B2D8C6",
    description: "Златният стандарт в адаптогените. Клинично доказано понижава кортизола с до 27%.",
    benefits: ["Намалява стреса", "Подобрява съня", "Повишава енергията"],
    studies: "24 клинични проучвания",
  },
  {
    id: "magnesium",
    name: "Магнезий бисглицинат",
    dose: "300mg",
    icon: Gem,
    color: "#FFC1CC",
    description: "Най-усвоимата форма магнезий. Успокоява нервната система и мускулите.",
    benefits: ["Отпуска мускулите", "Подкрепя нервите", "Подобрява съня"],
    studies: "Биодостъпност 80%+",
  },
  {
    id: "inositol",
    name: "Мио-инозитол",
    dose: "2000mg",
    icon: FlaskConical,
    color: "#F4E3B2",
    description: "Клинична доза за хормонален баланс. Особено ефективен при PCOS.",
    benefits: ["Балансира хормоните", "Регулира цикъла", "Намалява тревожността"],
    studies: "Препоръчван от ендокринолози",
  },
  {
    id: "bromelain",
    name: "Бромелаин",
    dose: "500mg",
    icon: Cherry,
    color: "#B2D8C6",
    description: "Естествен ензим от ананас. Премахва подуването и подпомага храносмилането.",
    benefits: ["Де-блоут ефект", "Подобрява храносмилането", "Противовъзпалителен"],
    studies: "Действа за 24 часа",
  },
];

export function PremiumIngredients() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIngredient, setActiveIngredient] = useState(ingredients[0]);

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F2EF] via-white to-[#B2D8C6]/10" />
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #B2D8C6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #FFC1CC 0%, transparent 50%)",
            backgroundSize: "100% 100%",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6"
          >
            <FlaskConical className="w-4 h-4" />
            Научно Доказани Съставки
          </motion.span>

          <AnimatedHeading delay={0.2}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
              Всяка Съставка
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] via-[#2D4A3E] to-[#FFC1CC]">
                с Мисия
              </span>
            </h2>
          </AnimatedHeading>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-stone-600 font-light"
          >
            Премиум съставки в клинични дози. Без компромиси.
          </motion.p>
        </div>

        {/* Interactive Ingredients Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left - Ingredient List */}
          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <motion.div
                key={ingredient.id}
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <button
                  onClick={() => setActiveIngredient(ingredient)}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-500 group ${
                    activeIngredient.id === ingredient.id
                      ? "bg-white shadow-[0_20px_60px_rgba(45,74,62,0.15)]"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${ingredient.color}30` }}
                    >
                      <ingredient.icon className="w-6 h-6" style={{ color: ingredient.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#2D4A3E]">
                          {ingredient.name}
                        </h3>
                        <span
                          className="text-sm font-bold px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: `${ingredient.color}30`,
                            color: "#2D4A3E",
                          }}
                        >
                          {ingredient.dose}
                        </span>
                      </div>
                      <p className="text-stone-500 text-sm mt-1">
                        {ingredient.studies}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${
                        activeIngredient.id === ingredient.id
                          ? "rotate-90 text-[#2D4A3E]"
                          : ""
                      }`}
                    />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Right - Active Ingredient Detail */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:sticky lg:top-32"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIngredient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8 bg-white/80" hover={false}>
                  {/* Icon & Name */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${activeIngredient.color}30` }}
                    >
                      <activeIngredient.icon className="w-10 h-10" style={{ color: activeIngredient.color }} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#2D4A3E]">
                        {activeIngredient.name}
                      </h3>
                      <p
                        className="text-lg font-semibold"
                        style={{ color: activeIngredient.color }}
                      >
                        {activeIngredient.dose} на доза
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-stone-600 leading-relaxed mb-8">
                    {activeIngredient.description}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-3 mb-8">
                    <h4 className="text-sm font-semibold text-[#2D4A3E] uppercase tracking-wider">
                      Ползи
                    </h4>
                    {activeIngredient.benefits.map((benefit, i) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: activeIngredient.color }}
                        />
                        <span className="text-stone-700">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Badge */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2D4A3E]/5">
                    <Award className="w-5 h-5 text-[#2D4A3E]" />
                    <span className="text-sm text-[#2D4A3E] font-medium">
                      {activeIngredient.studies}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Quality Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-6 mt-20"
        >
          {[
            { icon: Leaf, label: "100% Натурално" },
            { icon: FlaskConical, label: "Лабораторно Тествано" },
            { icon: Award, label: "GMP Сертифицирано" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg"
            >
              <badge.icon className="w-5 h-5 text-[#2D4A3E]" />
              <span className="text-sm font-medium text-[#2D4A3E]">
                {badge.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
