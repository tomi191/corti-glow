"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { reviews } from "@/data/reviews";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedHeading } from "@/components/ui/AnimatedText";

export function PremiumTestimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-[#2D4A3E]">
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#B2D8C6] blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#FFC1CC] blur-[120px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[#B2D8C6] text-sm font-medium uppercase tracking-widest mb-6"
          >
            <Star className="w-4 h-4 fill-current" />
            500+ Доволни Клиенти
          </motion.span>

          <AnimatedHeading delay={0.2}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
              Real Women.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC]">
                Real Glow.
              </span>
            </h2>
          </AnimatedHeading>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <GlassCard
                className="p-6 h-full bg-white/10 backdrop-blur-xl border-white/10"
                hover
              >
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-[#B2D8C6]/50 mb-4" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-[#F4E3B2] fill-current"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-white font-medium mb-2">
                  &ldquo;{review.title}&rdquo;
                </p>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {review.content}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFC1CC] to-[#B2D8C6]" />
                  <div>
                    <p className="text-white font-medium text-sm">
                      {review.author}
                    </p>
                    <p className="text-white/40 text-xs">Verified Buyer</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-8 mt-16 pt-16 border-t border-white/10"
        >
          {["VOGUE", "ELLE", "Women's Health", "COSMOPOLITAN"].map((pub) => (
            <span
              key={pub}
              className="text-2xl font-serif font-bold text-white/30 tracking-tighter"
            >
              {pub}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
