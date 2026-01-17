import type { Metadata } from "next";
import Image from "next/image";
import { ChevronDown, CheckCircle } from "lucide-react";
import { productVariants, productInfo, ingredients } from "@/data/products";
import { faqs } from "@/data/faqs";
import { formatPrice } from "@/lib/utils";
import { ProductBundles } from "./ProductBundles";

export const metadata: Metadata = {
  title: "Corti-Glow - Анти-Стрес Моктейл",
  description:
    "Corti-Glow е вкусен моктейл с Горска Ягода и Лайм, който понижава кортизола, премахва подуването и подобрява съня.",
};

export default function ProductPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square bg-stone-50 rounded-3xl overflow-hidden border border-stone-100">
                <Image
                  src={productInfo.image}
                  alt={productInfo.name}
                  width={600}
                  height={600}
                  priority
                  className="w-full h-full object-contain p-8"
                />
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#B2D8C6]" />
                  Без Захар
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#B2D8C6]" />
                  Веган
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#B2D8C6]" />
                  Без ГМО
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[#B2D8C6] font-medium uppercase tracking-wider mb-2">
                  LURA Wellness
                </p>
                <h1 className="text-4xl md:text-5xl font-semibold text-[#2D4A3E] tracking-tight">
                  {productInfo.name}
                </h1>
                <p className="text-stone-500 mt-2">{productInfo.tagline}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-[#F4E3B2]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-stone-500">
                  4.9/5 (10,000+ отзива)
                </span>
              </div>

              {/* Bundle Selection */}
              <ProductBundles variants={productVariants} />

              {/* Product Details Accordion */}
              <div className="space-y-3 pt-6 border-t border-stone-100">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer py-3">
                    <span className="font-medium text-stone-800">
                      Съставки
                    </span>
                    <ChevronDown className="w-5 h-5 text-stone-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pb-4 space-y-3">
                    {ingredients.map((ing) => (
                      <div
                        key={ing.name}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor: `${ing.color}20`,
                            color: ing.color,
                          }}
                        >
                          {ing.symbol}
                        </span>
                        <div>
                          <p className="font-medium text-stone-800">
                            {ing.name}{" "}
                            <span className="text-stone-400">
                              ({ing.dosage})
                            </span>
                          </p>
                          <p className="text-stone-500 text-xs">
                            {ing.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer py-3">
                    <span className="font-medium text-stone-800">
                      Как да използвам
                    </span>
                    <ChevronDown className="w-5 h-5 text-stone-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pb-4 text-sm text-stone-600">
                    <p>
                      Разтвори 1 саше в 250мл студена вода. Разбъркай добре.
                      Пий веднъж дневно, за предпочитане вечер преди сън. За
                      най-добри резултати, използвай минимум 30 дни.
                    </p>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer py-3">
                    <span className="font-medium text-stone-800">
                      Доставка
                    </span>
                    <ChevronDown className="w-5 h-5 text-stone-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pb-4 text-sm text-stone-600">
                    <p>
                      Безплатна доставка за поръчки над 160 лв. Доставка с
                      Еконт или Спиди за 1-2 работни дни. Плащане при
                      доставка или с карта.
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-semibold mb-8 text-center text-[#2D4A3E]">
            Често задавани въпроси
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-4 bg-white rounded-xl cursor-pointer shadow-sm"
              >
                <summary className="flex justify-between items-center font-medium text-stone-800">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-[#B2D8C6] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-stone-500 text-sm mt-3 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
