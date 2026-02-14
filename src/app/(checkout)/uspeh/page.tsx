import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Package, Mail, HelpCircle } from "lucide-react";
import { PurchaseTracker } from "./PurchaseTracker";

export const metadata: Metadata = {
  title: "Поръчката е приета",
  description: "Благодарим за поръчката!",
  robots: { index: false, follow: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string; orderNumber?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId, orderNumber } = await searchParams;
  const displayOrderNumber = orderNumber || orderId;

  return (
    <div className="min-h-screen bg-stone-50 py-20">
      {displayOrderNumber && <PurchaseTracker orderNumber={displayOrderNumber} />}
      <div className="max-w-md mx-auto px-6 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-[#B2D8C6] rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-[#2D4A3E]" />
        </div>

        <h1 className="text-3xl font-semibold text-[#2D4A3E] mb-4">
          Поръчката е приета!
        </h1>

        {displayOrderNumber && (
          <p className="text-stone-500 mb-2">
            Номер на поръчка:{" "}
            <span className="font-mono font-bold text-stone-800">{displayOrderNumber}</span>
          </p>
        )}

        <p className="text-stone-600 mb-2">
          Благодарим ти, че избра LURA! Запази номера на поръчката, за да можеш
          да я проследиш.
        </p>
        <p className="text-sm text-stone-500 mb-8">
          Изпратихме потвърждение на имейла ти.
        </p>

        {/* Info Cards */}
        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-stone-100 flex items-start gap-3 text-left">
            <Package className="w-5 h-5 text-[#2D4A3E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-stone-800">Очаквай доставка</p>
              <p className="text-sm text-stone-500">
                1-2 работни дни с Еконт или Спиди
              </p>
            </div>
          </div>

          <Link
            href="/prosledi-porachka"
            className="bg-white rounded-xl p-4 border border-stone-100 flex items-start gap-3 text-left hover:border-[#B2D8C6] transition block"
          >
            <Mail className="w-5 h-5 text-[#2D4A3E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-stone-800">Проследи поръчката</p>
              <p className="text-sm text-stone-500">
                Виж статуса на доставката по всяко време
              </p>
            </div>
          </Link>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-xl p-4 border border-stone-100 flex items-start gap-3 text-left mb-8">
          <HelpCircle className="w-5 h-5 text-[#2D4A3E] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-stone-800">Имаш въпрос?</p>
            <p className="text-sm text-stone-500">
              Пиши ни на{" "}
              <a href="mailto:contact@luralab.eu" className="text-[#2D4A3E] underline">
                contact@luralab.eu
              </a>
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-4 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition-all"
        >
          Обратно към началото
        </Link>
      </div>
    </div>
  );
}
