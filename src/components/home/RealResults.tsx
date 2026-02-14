"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const clinicalRefs = [
  {
    text: "KSM-66® Ашваганда намалява серумния кортизол с 27.9% за 60 дни",
    source: "Journal of the American Nutraceutical Association, 2008",
  },
  {
    text: "Магнезият подобрява качеството на съня и намалява инсомнията",
    source: "Journal of Research in Medical Sciences, 2012",
  },
  {
    text: "L-Теанинът повишава алфа мозъчните вълни за 40 минути след прием",
    source: "Nutritional Neuroscience, 2008",
  },
];

const ugcResults = [
  {
    metric: "-3 см талия",
    quote: "След 2 седмици подуването просто изчезна. Дрехите ми стоят различно.",
    author: "Елена К.",
    verified: true,
  },
  {
    metric: "По-дълбок сън",
    quote: "Заспивам за минути вместо за часове. Събуждам се с енергия.",
    author: "Даниела М.",
    verified: true,
  },
  {
    metric: "Чиста кожа",
    quote: "Акнето по челюстта спря за 3 седмици. Не очаквах толкова бързо.",
    author: "Виктория С.",
    verified: true,
  },
];

const timeline = [
  { day: "Ден 3", result: "По-лесно заспиване" },
  { day: "Ден 7", result: "Намалено подуване" },
  { day: "Ден 14", result: "Видимо по-сияйна кожа" },
  { day: "Ден 30", result: "Пълен хормонален баланс" },
];

export function RealResults() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-[#F5F2EF]/50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-[#B2D8C6] mb-3 block">
            Реални Резултати
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D4A3E]">
            Науката + Клиентски Истории
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Clinical references */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
              Клинични Изследвания
            </h3>
            {clinicalRefs.map((ref, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-stone-100"
              >
                <p className="text-sm text-[#2D4A3E] font-medium mb-1">
                  {ref.text}
                </p>
                <p className="text-xs text-stone-400 italic">{ref.source}</p>
              </div>
            ))}
            <Link
              href="/nauka"
              className="inline-flex items-center gap-1.5 text-sm text-[#2D4A3E] font-medium hover:underline mt-2"
            >
              Виж пълните изследвания
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Right: UGC results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider mb-4">
              Клиентски Отзиви
            </h3>
            {ugcResults.map((result, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-stone-100"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-[#2D4A3E]">
                    {result.metric}
                  </span>
                  {result.verified && (
                    <span className="flex items-center gap-1 text-xs text-[#B2D8C6]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Верифициран
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-600 italic mb-1.5">
                  &ldquo;{result.quote}&rdquo;
                </p>
                <p className="text-xs text-stone-400">— {result.author}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider text-center mb-6">
            Времева Линия на Резултатите
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeline.map((item, i) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center p-4 rounded-xl bg-white border border-stone-100"
              >
                <div className="text-sm font-bold text-[#2D4A3E] mb-1">
                  {item.day}
                </div>
                <div className="text-xs text-stone-500">{item.result}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
