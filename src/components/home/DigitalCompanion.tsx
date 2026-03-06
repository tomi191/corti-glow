"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Activity, Heart, ArrowRight } from "lucide-react";

export function DigitalCompanion() {
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const appY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
    const cardsY = useTransform(scrollYProgress, [0, 1], ["50%", "-50%"]);

    return (
        <section ref={containerRef} className="relative w-full py-24 md:py-40 bg-[#F7F4F0] overflow-hidden text-[#2D4A3E]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-center">

                {/* Header content */}
                <div className="text-center max-w-2xl mb-20 relative z-10">
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#2D4A3E]/50 mb-4 block">
                        Дигитална Екосистема
                    </span>
                    <h2 className="text-[clamp(3rem,5vw,4.5rem)] font-serif font-light leading-[0.9] tracking-[-0.02em] mb-6">
                        Повече от саше. <br />
                        <span className="italic">Цялостен тракър.</span>
                    </h2>
                    <p className="text-lg md:text-xl font-light text-[#2D4A3E]/70 leading-relaxed">
                        Corti-Glow отключва безплатен достъп до The LURA App. Проследявай цикъла си, нивата на стрес и качеството на съня в синхрон с приема на съставките.
                    </p>
                </div>

                {/* Cinematic App Presentation */}
                <div className="relative w-full max-w-5xl aspect-auto md:aspect-[2/1] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0 mt-10 p-4 md:p-0">

                    {/* Background decorative elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl rounded-[100%] bg-gradient-to-r from-[#B2D8C6]/30 to-[#2D4A3E]/5 blur-[120px] pointer-events-none" />

                    {/* Left Flow Card */}
                    <motion.div
                        style={{ y: cardsY }}
                        className="hidden md:flex flex-col gap-4 w-64 absolute left-[5%] top-[10%] z-20"
                    >
                        <div className="bg-white/60 backdrop-blur-xl border border-[#2D4A3E]/10 p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#2D4A3E]/5 rounded-full text-[#2D4A3E]">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="text-xs font-semibold uppercase tracking-widest text-[#2D4A3E]/50">
                                    Фаза
                                </div>
                            </div>
                            <div className="text-2xl font-serif text-[#2D4A3E]">Лутеална</div>
                            <div className="text-xs text-[#2D4A3E]/60 mt-1">Остават 8 дни до период</div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl border border-[#2D4A3E]/10 p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-4 h-4 text-[#B2D8C6]" />
                                <div className="text-[10px] font-bold uppercase tracking-widest text-[#2D4A3E]/60">
                                    Инсайт
                                </div>
                            </div>
                            <p className="text-sm text-[#2D4A3E]/80 leading-relaxed">
                                Кортизолът е естествено висок днес. Ашвагандата ще помогне да се успокоиш.
                            </p>
                        </div>
                    </motion.div>

                    {/* Center Main App Device Mockup */}
                    <motion.div
                        style={{ y: appY }}
                        className="relative w-full max-w-[320px] bg-white rounded-[3rem] p-2 shadow-[0_30px_60px_rgba(45,74,62,0.15)] border border-[#2D4A3E]/5 z-10"
                    >
                        {/* Screen Inner */}
                        <div className="relative w-full aspect-[1/2.1] bg-[#F9F8F6] rounded-[2.5rem] overflow-hidden flex flex-col border border-stone-100">

                            {/* Dynamic Island / Notch area */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white rounded-b-2xl shadow-sm z-30" />

                            {/* App UI Simulation */}
                            <div className="pt-14 px-6 pb-6 flex-1 flex flex-col">
                                <div className="font-serif text-2xl text-[#2D4A3E] mb-1">Овулация &middot; Ден 14</div>
                                <div className="text-xs text-[#2D4A3E]/50 mb-8">Пик на енергията</div>

                                {/* Simulated Glow Ring */}
                                <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-full border-[6px] border-[#B2D8C6]/20 border-t-[#2D4A3E] rotate-45" />
                                    <div className="absolute inset-1 rounded-full border-[6px] border-dashed border-[#B2D8C6]/40 -rotate-12" />
                                    <div className="text-center">
                                        <div className="text-3xl font-light font-serif text-[#2D4A3E]">92</div>
                                        <div className="text-[9px] uppercase tracking-widest font-semibold text-[#2D4A3E]/50">Glow Score</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                                        <Heart className="w-4 h-4 text-brand-forest mb-2 opacity-60" />
                                        <div className="text-lg font-semibold text-[#2D4A3E]">8/10</div>
                                        <div className="text-[9px] uppercase tracking-widest text-[#2D4A3E]/40 font-bold mt-1">Сън</div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                                        <Activity className="w-4 h-4 text-brand-forest mb-2 opacity-60" />
                                        <div className="text-lg font-semibold text-[#2D4A3E]">95%</div>
                                        <div className="text-[9px] uppercase tracking-widest text-[#2D4A3E]/40 font-bold mt-1">Баланс</div>
                                    </div>
                                </div>

                                <div className="mt-auto bg-[#2D4A3E] text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
                                    <span className="text-sm font-semibold">Запиши ритуала</span>
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* Right Flow Card */}
                    <motion.div
                        style={{ y: cardsY }}
                        className="hidden md:flex flex-col w-64 absolute right-[5%] bottom-[15%] z-20"
                    >
                        <div className="bg-[#2D4A3E] border border-white/10 p-6 rounded-3xl shadow-[0_30px_60px_rgba(45,74,62,0.3)] text-white">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B2D8C6] mb-3">
                                Ежедневен Съвет
                            </div>
                            <div className="text-lg font-serif mb-2 leading-tight">Без кофеин след 14:00</div>
                            <p className="text-xs text-white/60 leading-relaxed">
                                Полуживотът на кофеина е 5 часа. Комбинирай почивката с магнезий за перфектен дълбок сън.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
