"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function GlowGuidePromo() {
    return (
        <section className="bg-[#F7F4F0] py-16 md:py-24">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-[#2D4A3E] text-[#F7F4F0] p-10 md:p-16 lg:p-24 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">

                    {/* Aesthetic Background Effect */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#B2D8C6]/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/5 blur-[60px] rounded-full pointer-events-none" />

                    {/* Text Content */}
                    <div className="max-w-2xl relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-[#B2D8C6]" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#B2D8C6]">
                                Персонализиран Анализ
                            </span>
                        </div>

                        <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-serif font-light leading-[1.0] mb-6">
                            Какъв е твоят <br /> <span className="italic">Stress Score?</span>
                        </h2>

                        <p className="text-lg text-[#F7F4F0]/70 font-light leading-relaxed max-w-xl mb-10">
                            Не си сигурна дали Corti-Glow е точно за теб? Направи нашия безплатен двуминутен клиничен тест и разбери как нивата ти на кортизол влияят на съня, кожата и хормоналния ти баланс. Получи персонална AI препоръка.
                        </p>

                        <Link
                            href="/glow-guide"
                            className="inline-flex items-center gap-4 bg-[#F7F4F0] text-[#2D4A3E] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#B2D8C6] transition-colors duration-500 shadow-lg group"
                        >
                            <span>Започни теста</span>
                            <div className="w-8 h-8 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center group-hover:bg-[#2D4A3E]/20 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    </div>

                    {/* Visual Elements */}
                    <div className="relative z-10 hidden md:flex flex-col gap-4 w-full max-w-sm">
                        <div className="bg-[#1E332B] border border-white/10 rounded-3xl p-6 shadow-xl relative animate-[float_6s_ease-in-out_infinite]">
                            <div className="flex gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-[#B2D8C6]/20 flex items-center justify-center">
                                    <span className="text-[#B2D8C6] text-xs font-serif">A</span>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-2xl p-4">
                                    <p className="text-xs text-[#F7F4F0]/80">Събуждаш ли се между 2:00 и 4:00 сутринта?</p>
                                </div>
                            </div>
                            <div className="ml-11 flex flex-col gap-2">
                                <div className="bg-[#B2D8C6] text-[#2D4A3E] rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-wider w-max">Да, често</div>
                                <div className="bg-white/5 text-[#F7F4F0]/40 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-wider w-max">Не, спя дълбоко</div>
                            </div>
                        </div>

                        <div className="bg-[#1E332B] border border-white/10 rounded-3xl p-5 shadow-xl ml-12 animate-[float_6s_ease-in-out_infinite_1s]">
                            <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 rounded-full border border-dashed border-[#B2D8C6]/40 flex items-center justify-center">
                                    <span className="text-xl font-serif text-[#B2D8C6]">86</span>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#F7F4F0]/60">Твоят резултат</div>
                                    <div className="text-sm font-serif">Висок нощен кортизол</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
