import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { COMPANY, SOCIAL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[#2D4A3E] text-[#F7F4F0] pt-24 pb-[calc(110px+env(safe-area-inset-bottom))] md:pb-12 w-full overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">

        {/* Top Section */}
        <div className="font-serif italic text-2xl mb-24 md:mb-32">
          LURA <span className="not-italic font-sans text-sm tracking-widest uppercase ml-2 px-2 py-1 border border-[#F7F4F0]/30 rounded-full">Lab</span>
        </div>

        {/* Middle Navigation & Info */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-6 md:gap-8 border-b border-[#F7F4F0]/10 pb-16 md:pb-24 mb-12">

          <div className="col-span-2 md:col-span-5">
            <h3 className="text-3xl md:text-5xl font-serif font-light leading-tight mb-8">
              Научно обоснован <br />
              <span className="italic text-[#B2D8C6]">уелнес.</span>
            </h3>
            <p className="text-[#F7F4F0]/60 max-w-sm font-light text-lg">
              Революция в женския хормонален баланс. Край на компромисите със съня и подуването.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2 md:col-start-8">
            <h4 className="font-bold tracking-[0.2em] uppercase text-[#F7F4F0] text-xs mb-8 flex items-center gap-2">
              Разгледай <ArrowUpRight className="w-3 h-3 opacity-50" />
            </h4>
            <ul className="space-y-4">
              <li><a href="#science-section" className="text-[#F7F4F0]/60 hover:text-white transition-colors text-sm font-light">Наука</a></li>
              <li><a href="#checkout-section" className="text-[#F7F4F0]/60 hover:text-white transition-colors text-sm font-light">Магазин</a></li>
              <li><Link href="/pwa" className="text-[#F7F4F0]/60 hover:text-white transition-colors text-sm font-light">The App</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold tracking-[0.2em] uppercase text-[#F7F4F0] text-xs mb-8 flex items-center gap-2">
              Социални <ArrowUpRight className="w-3 h-3 opacity-50" />
            </h4>
            <ul className="space-y-4">
              <li><a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="text-[#F7F4F0]/60 hover:text-white transition-colors text-sm font-light">Instagram</a></li>
              <li><a href={SOCIAL.facebook} target="_blank" rel="noreferrer" className="text-[#F7F4F0]/60 hover:text-white transition-colors text-sm font-light">Facebook</a></li>
              <li><a href="#" className="text-[#F7F4F0]/60 hover:text-white transition-colors text-sm font-light">TikTok</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Legal */}
        <div className="flex flex-col items-center pt-8 border-t border-[#F7F4F0]/10 mt-12">
          <div className="w-full flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#F7F4F0]/40 gap-6">
            <div>
              <span>© {new Date().getFullYear()} {COMPANY.name}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 items-center">
              <Link href="/poveritelnost" className="hover:text-white transition-colors">Поверителност</Link>
              <Link href="/obshti-usloviya" className="hover:text-white transition-colors">Общи условия</Link>
              <a href="https://level8.bg" target="_blank" rel="noopener noreferrer" className="text-[#B2D8C6] hover:text-white transition-colors flex items-center gap-1">
                Designed with Level8.bg <ArrowUpRight className="w-3 h-3 opacity-50" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Decorative gigantic background blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[50vh] bg-[#B2D8C6]/5 blur-[120px] rounded-t-full pointer-events-none" />
    </footer>
  );
}
