"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";

export function TheImmersiveHero() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative h-screen w-full flex flex-col justify-between overflow-hidden"
        >
            {/* Navbar spacer */}
            <div className="h-24 md:h-32 w-full shrink-0" />

            {/* Main Content Area - Asymmetric 60/40 Split */}
            <div className="flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row relative z-10">

                {/* Left: Massive Typography (60%) */}
                <motion.div
                    style={{ y: y1, opacity }}
                    className="lg:w-[60%] flex flex-col justify-center pr-0 lg:pr-12"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="font-serif text-[4rem] sm:text-[5rem] md:text-[6.5rem] lg:text-[7.5rem] leading-[0.85] tracking-[-0.03em] text-brand-forest">
                            <span className="block font-light">Спри шума</span>
                            <span className="block font-light">в главата.</span>
                            <span className="block font-semibold italic mt-2 text-brand-forest/90">
                                Върни сиянието.
                            </span>
                        </h1>

                        <p className="mt-8 text-lg sm:text-xl text-brand-forest/70 font-light max-w-sm leading-relaxed">
                            Вечерният моктейл-ритуал, който натурално понижава кортизола и възстановява хормоналния баланс докато спиш.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Right: Immersive Visual (40%) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    className="lg:w-[40%] h-full mt-12 lg:mt-0 relative hidden md:flex items-center justify-center"
                >
                    {/* We will use a soft video loop or a very aesthetic image.
              Using a placeholder div with an extreme blur to simulate the visual for now until we plug the exact asset. */}
                    <div className="relative w-full aspect-[3/4] max-h-[70vh] rounded-[2rem] overflow-hidden">
                        {/* Simulating the water turning pink */}
                        <div className="absolute inset-0 bg-gradient-to-b from-brand-sage/20 via-brand-sand to-brand-blush/40 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-brand-forest/5 backdrop-blur-[2px]" />
                        <img
                            src="/images/product-hero-box.webp"
                            alt="Corti Glow"
                            className="w-full h-full object-cover opacity-90 mix-blend-multiply scale-110 object-center"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Bottom: Shop by Concern & Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="w-full pb-8 pt-12 md:pb-12 px-6 max-w-7xl mx-auto relative z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 h-auto shrink-0"
            >
                <div className="flex flex-col gap-3">
                    <p className="text-xs uppercase tracking-widest text-brand-forest/50 font-semibold font-display">
                        Твоят вечерен ритуал за
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {[
                            "Следобедно подуване",
                            "Трудно заспиване",
                            "Хормонален дисбаланс"
                        ].map((tag, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    // Scrolling logic will be injected here
                                    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-5 py-3 rounded-full border border-brand-forest/10 bg-white/50 backdrop-blur-md text-sm text-brand-forest/80 hover:bg-brand-forest hover:text-white transition-all duration-300 font-medium whitespace-nowrap"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="hidden sm:flex shrink-0 w-12 h-12 rounded-full border border-brand-forest/20 items-center justify-center text-brand-forest/50"
                >
                    <ArrowDown className="w-5 h-5" />
                </motion.div>
            </motion.div>
        </section>
    );
}
