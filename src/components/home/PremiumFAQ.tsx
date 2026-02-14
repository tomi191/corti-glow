"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { HelpCircle, Plus, Minus, MessageCircle } from "lucide-react";
import { AnimatedHeading } from "@/components/ui/AnimatedText";
import { homepageFaqs } from "@/data/homepage-faqs";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homepageFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function PremiumFAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={ref} className="py-16 md:py-32 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#2D4A3E]/5 to-white" />

      <div className="max-w-4xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6"
          >
            <HelpCircle className="w-4 h-4" />
            Често Задавани Въпроси
          </motion.span>

          <AnimatedHeading delay={0.2}>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
              Имаш Въпроси?
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC]">
                Имаме Отговори.
              </span>
            </h2>
          </AnimatedHeading>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {homepageFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div
                className={`rounded-2xl overflow-hidden transition-all duration-500 ${
                  openIndex === index
                    ? "bg-white shadow-[0_20px_60px_rgba(45,74,62,0.1)]"
                    : "bg-white/60 hover:bg-white/80"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span
                    className={`font-medium transition-colors duration-300 ${
                      openIndex === index ? "text-[#2D4A3E]" : "text-stone-700"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      openIndex === index
                        ? "bg-[#2D4A3E] text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {openIndex === index ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      id={`faq-answer-${index}`}
                      role="region"
                    >
                      <div className="px-8 pb-6">
                        <div className="h-px bg-gradient-to-r from-transparent via-[#B2D8C6]/50 to-transparent mb-6" />
                        <p className="text-stone-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-[#B2D8C6]/20 via-white to-[#FFC1CC]/20 border border-white/50 shadow-lg">
            <MessageCircle className="w-6 h-6 text-[#2D4A3E]" />
            <div className="text-left">
              <p className="text-sm text-stone-500">Не намери отговор?</p>
              <a
                href="mailto:contact@luralab.eu"
                className="font-medium text-[#2D4A3E] hover:underline"
              >
                Пиши ни на contact@luralab.eu
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
