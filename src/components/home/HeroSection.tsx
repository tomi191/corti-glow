import Image from "next/image";
import Link from "next/link";
import { Sparkles, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FFC1CC]/40 via-white to-[#B2D8C6]/30 -z-10" />

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#B2D8C6] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#2D4A3E]" />
            <span className="text-xs font-medium tracking-wide text-[#2D4A3E] uppercase">
              Най-Обсъжданият Ритуал на 2026
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tighter text-[#2D4A3E]">
            Пребори стреса.{" "}
            <span className="italic font-light text-stone-500">
              Забрави за подуването.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 font-light leading-relaxed max-w-md mx-auto md:mx-0">
            Запознай се с <span className="font-medium">Corti-Glow</span>.
            Ритуалът с вкус на горска ягода и лайм, който балансира хормоните,
            понижава кортизола и премахва подуването за 14 дни.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/produkt"
              className="inline-flex justify-center items-center px-8 py-4 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition-all shadow-lg shadow-[#2D4A3E]/20 text-sm tracking-wide"
            >
              Поръчай Corti-Glow
            </Link>
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-stone-500">
              <CheckCircle className="w-4 h-4 text-[#B2D8C6]" />
              Без Захар
              <CheckCircle className="w-4 h-4 text-[#B2D8C6] ml-2" />
              Научно Доказано
            </div>
          </div>
        </div>

        {/* Visual Component */}
        <div className="relative flex justify-center items-center">
          {/* Decorative Elements */}
          <div className="absolute w-64 h-64 bg-[#FFC1CC] rounded-full blur-3xl opacity-40 top-0 right-10 animate-pulse" />
          <div className="absolute w-72 h-72 bg-[#B2D8C6] rounded-full blur-3xl opacity-40 bottom-0 left-10" />

          {/* Product Image */}
          <div className="relative z-10 w-full max-w-md flex items-center justify-center">
            <Image
              src="/images/corti-glow.png"
              alt="Corti-Glow Box and Sachet"
              width={500}
              height={500}
              priority
              className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
