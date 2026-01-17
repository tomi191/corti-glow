import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import { COMPANY, FOOTER_LINKS, SOCIAL } from "@/lib/constants";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="bg-[#2D4A3E] text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1">
            <Link
              href="/"
              className="text-2xl font-semibold tracking-widest text-white mb-6 block"
            >
              LURA
            </Link>
            <p className="text-stone-300 text-sm leading-relaxed mb-4">
              Научно обоснован уелнес за модерната жена. Правим хормоните
              щастливи от 2026.
            </p>
            <div className="text-xs text-stone-400">
              <p>{COMPANY.name}</p>
              <p>{COMPANY.address}</p>
              <p>{COMPANY.email}</p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-medium mb-4 text-[#B2D8C6]">Магазин</h4>
            <ul className="space-y-2 text-sm text-stone-300">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-medium mb-4 text-[#B2D8C6]">Помощ</h4>
            <ul className="space-y-2 text-sm text-stone-300">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-medium mb-4 text-[#B2D8C6]">
              Влез в Lura Club
            </h4>
            <p className="text-xs text-stone-300 mb-4">
              Вземи 10% отстъпка за първа поръчка + уелнес съвети.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400">
          <p>© 2026 Lura Wellness. Всички права запазени.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/poveritelnost" className="hover:text-white">
              Поверителност
            </Link>
            <Link href="/obshti-usloviya" className="hover:text-white">
              Общи условия
            </Link>
            <div className="flex gap-2 text-white">
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
