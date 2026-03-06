"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function BrandEthos() {
    return (
        <section className="bg-[#EAE7E1] py-32 md:py-48 text-[#2D4A3E]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-start justify-between gap-16 md:gap-24">

                {/* Left Side: Text Content */}
                <div className="md:w-1/2 flex flex-col items-start gap-12">
                    <div className="font-serif italic text-2xl">
                        LURA <span className="not-italic font-sans text-sm tracking-widest uppercase ml-2 px-2 py-1 border border-[#2D4A3E]/30 rounded-full">Lab</span>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h2 className="text-[clamp(3rem,6vw,5.5rem)] font-serif font-light leading-[0.9] tracking-[-0.03em]">
                            Ти си екосистема.
                        </h2>
                        <p className="text-xl md:text-2xl font-light text-[#2D4A3E]/80 max-w-lg leading-relaxed">
                            Тялото ти не е просто машина — то е дом на милиарди клетки, които управляват енергията, съня и стреса ти.
                            Отдели няколко минути, за да разбереш как техният баланс променя всичко.
                        </p>
                    </div>

                    <button className="group mt-4 flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
                        <span>Открий Науката</span>
                        <div className="w-12 h-12 rounded-full border border-[#2D4A3E] flex items-center justify-center bg-[#2D4A3E] text-white group-hover:bg-transparent group-hover:text-[#2D4A3E] transition-all duration-300">
                            <Play className="w-4 h-4 ml-1 fill-current" />
                        </div>
                    </button>
                </div>

                {/* Right Side: Big Square Video/Visual */}
                <div className="md:w-1/2 w-full relative">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2D4A3E]/50 mb-6 border-b border-[#2D4A3E]/10 pb-4">
                        <span>Cortisol 101</span>
                        <span className="text-[#2D4A3E]">— Произход на стреса</span>
                    </div>

                    <div className="w-full aspect-square bg-[#DCD8D0] rounded-3xl overflow-hidden relative group cursor-pointer">
                        <video
                            src="https://stream.mux.com/87tnV011w6GkwNzl7dxntQSNhpcVSJNgSQaqlj3iLTK00.m3u8"
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Fallback image if video fails or is just local placeholder */}
                        <img
                            src="https://images.unsplash.com/photo-1615486171306-ddfe46aa8625?auto=format&fit=crop&q=80"
                            alt="Microbiome representation"
                            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 grayscale group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Play overlay overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors duration-500">
                            <div className="w-20 h-20 rounded-full backdrop-blur-md bg-white/20 flex items-center justify-center border border-white/50 text-white transform group-hover:scale-110 transition-transform duration-500">
                                <Play className="w-8 h-8 ml-1 fill-current" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
