import Image from "next/image";
import { Play } from "lucide-react";
import { howToUse } from "@/data/products";

export function HowToUseSection() {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#2D4A3E] mb-2">
                Вечерният Ритуал
              </h2>
              <p className="text-stone-500 font-light">
                Трансформирай рутината си за 30 секунди.
              </p>
            </div>

            <div className="space-y-8">
              {howToUse.map((step, index) => (
                <div key={step.step} className="flex gap-6 group">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium ${
                      index === 0
                        ? "border-[#2D4A3E] text-[#2D4A3E]"
                        : "border-stone-300 text-stone-400"
                    }`}
                  >
                    {step.step}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-stone-900 mb-1 group-hover:text-[#2D4A3E] transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-stone-500 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video/Image Placeholder */}
          <div className="relative h-[500px] w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-stone-200 border border-stone-100">
            <Image
              src="/images/lifestyle-relaxing-bath.webp"
              alt="Жена се отпуска с розов коктейл"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E]/30 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <button
                type="button"
                aria-label="Пусни видеото"
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center hover:scale-110 transition"
              >
                <Play className="w-4 h-4 text-white fill-white" />
              </button>
              <span className="text-white text-sm font-medium tracking-wide">
                Виж ритуала
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
