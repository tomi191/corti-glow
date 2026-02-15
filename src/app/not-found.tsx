import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-[#B2D8C6] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#2D4A3E] mb-4">
          Страницата не е намерена
        </h2>
        <p className="text-stone-600 mb-8 max-w-md mx-auto">
          Съжаляваме, но страницата, която търсите, не съществува или е била
          преместена.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition-all"
          >
            <Home className="w-4 h-4" />
            Към Началото
          </Link>
          <Link
            href="/magazin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#2D4A3E] text-[#2D4A3E] rounded-full font-medium hover:bg-stone-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Към Магазина
          </Link>
        </div>
      </div>
    </div>
  );
}
