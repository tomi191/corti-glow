"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function RawSocialProof() {
  return (
    <section className="bg-[#EAE7E1] py-32 md:py-48 text-[#2D4A3E]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col gap-16 md:gap-24">

        {/* Header content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 w-full">
          <div className="max-w-3xl">
            <h2 className="text-[clamp(3rem,6vw,5.5rem)] font-serif font-light leading-[0.9] tracking-[-0.03em] mb-6">
              Истинските <br />
              <span className="italic">резултати.</span>
            </h2>
            <p className="text-xl md:text-2xl font-light text-[#2D4A3E]/70 max-w-lg leading-relaxed">
              Без гръмки реклами. Реални отзиви от жени, които върнаха баланса и енергията си с Corti-Glow.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-5 h-5 fill-[#2D4A3E] text-[#2D4A3E]" />
              ))}
            </div>
            <p className="text-sm font-semibold tracking-widest uppercase opacity-60">
              4.9/5 Според 5,000+ клиента
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="relative -mx-6 md:mx-0">
          <Carousel
            opts={{ align: "center", containScroll: "trimSnaps", dragFree: true }}
            className="w-full pb-40 md:pb-0"
          >
            <CarouselContent className="flex md:grid md:grid-cols-12 md:auto-rows-[420px] md:gap-8 ml-0">
              {/* Item 1: Tall Vertical Image + Quote Overlay */}
              <CarouselItem className="pl-4 md:pl-0 basis-[85%] md:basis-auto col-span-4 row-span-2 flex first:pl-0 md:pr-6 lg:pr-0">
                <div className="w-full group relative rounded-[3rem] bg-[#2D4A3E] overflow-hidden shadow-sm flex flex-col h-[480px] md:h-auto">
                  <img
                    src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80"
                    alt="Woman relaxed"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen grayscale group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end text-[#F7F4F0]">
                    <div className="inline-block px-3 py-1.5 bg-[#F7F4F0]/20 rounded-full backdrop-blur-md w-max mb-6">
                      <span className="text-[10px] uppercase font-bold tracking-widest">
                        Дълбок Сън
                      </span>
                    </div>
                    <p className="text-2xl font-serif italic mb-4">
                      &quot;Заспивам за минути, вместо за часове. На сутринта имам енергия още преди първото кафе.&quot;
                    </p>
                    <span className="text-xs font-semibold uppercase tracking-widest opacity-60">
                      — Елена Петрова
                    </span>
                  </div>
                </div>
              </CarouselItem>

              {/* Item 2: Horizontal Small */}
              <CarouselItem className="pl-4 md:pl-0 basis-[85%] sm:basis-[60%] md:basis-auto col-span-4 flex">
                <div className="w-full rounded-[2.5rem] bg-white p-8 flex flex-col justify-center border border-[#2D4A3E]/5 shadow-sm hover:shadow-xl transition-shadow duration-500 h-[480px] md:h-auto">
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-[#B2D8C6] text-[#B2D8C6]" />)}
                  </div>
                  <p className="text-xl leading-relaxed text-[#2D4A3E] font-serif mb-6">
                    &quot;Първият цикъл без болки и подуване откакто се помня. Направо не повярвах, че е възможно.&quot;
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-[#EAE7E1] flex items-center justify-center font-serif text-lg">С</div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-widest text-[#2D4A3E]">София И.</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#2D4A3E]/50">Балансиран Цикъл</div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Item 3: Wide horizontal Image with button */}
              <CarouselItem className="pl-4 md:pl-0 basis-[85%] sm:basis-[60%] md:basis-auto col-span-4 flex">
                <div className="w-full group relative rounded-[2.5rem] bg-[#DCD8D0] overflow-hidden shadow-sm h-[480px] md:h-auto flex flex-col">
                  <img
                    src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80"
                    alt="Morning routine"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-60 grayscale group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-8 left-8">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-white/30 backdrop-blur-md rounded-full text-[#2D4A3E]">
                      Ежедневие
                    </span>
                  </div>
                  <p className="absolute bottom-8 left-8 right-8 text-xl font-serif text-[#2D4A3E]">
                    Хормоните най-после са в ритъм.
                  </p>
                </div>
              </CarouselItem>

              {/* Item 4: Wide Quote Panel */}
              <CarouselItem className="pl-4 md:pl-0 basis-[85%] md:basis-auto col-span-8 flex md:pr-6 lg:pr-0">
                <div className="w-full rounded-[2.5rem] bg-[#2D4A3E] p-10 md:p-14 flex flex-col justify-center text-[#F7F4F0] relative overflow-hidden shadow-sm h-[480px] md:h-auto">
                  <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#B2D8C6]/20 rounded-[100%] blur-[80px]" />
                  <div className="max-w-2xl relative z-10">
                    <h3 className="text-3xl md:text-5xl font-serif font-light leading-[1.2] tracking-tight text-[#B2D8C6] mb-8">
                      &quot;Най-накрая мога да си закопчая дънките вечер. Вечното подуване в стомаха просто изчезна на втората седмица.&quot;
                    </h3>
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#F7F4F0]/60">Мария Т.</span>
                      <span className="w-12 h-[1px] bg-[#F7F4F0]/20" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#F7F4F0]">Спад в кортизола</span>
                    </div>
                  </div>
                </div>
              </CarouselItem>

            </CarouselContent>

            <div className="flex justify-center gap-4 mt-6 md:hidden px-6">
              <CarouselPrevious className="static translate-y-0 translate-x-0 w-12 h-12 bg-white text-[#2D4A3E] border border-[#2D4A3E]/10 shadow-sm hover:bg-[#F7F4F0]" />
              <CarouselNext className="static translate-y-0 translate-x-0 w-12 h-12 bg-[#2D4A3E] text-white hover:bg-[#1E332B] border-none shadow-lg" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
