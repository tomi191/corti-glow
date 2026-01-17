import Image from "next/image";
import { AlertCircle, Wind, Cookie, Moon } from "lucide-react";

const problems = [
  {
    icon: Wind,
    color: "red",
    text: "Постоянно подуване, дори от вода",
  },
  {
    icon: Cookie,
    color: "orange",
    text: "Неконтролируем глад за сладко в 15:00",
  },
  {
    icon: Moon,
    color: "indigo",
    text: 'Събуждаш се уморена, а вечер си "напрегната"',
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative order-2 md:order-1">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-200 relative">
              <Image
                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop"
                alt="Woman feeling tired"
                fill
                className="object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-stone-900/10" />

              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur p-4 rounded-xl border border-white shadow-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                      Висок Кортизол
                    </p>
                    <p className="text-sm text-stone-600 leading-snug">
                      Стресът кара тялото да задържа вода и трупа мазнини около
                      талията.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="order-1 md:order-2 space-y-6">
            <span className="text-[#2D4A3E] text-xs font-bold tracking-widest uppercase">
              Първопричината
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-stone-900">
              Не са дебелина. <br />
              <span className="text-stone-400">Кортизол е.</span>
            </h2>
            <p className="text-stone-600 text-lg font-light leading-relaxed">
              Модерният живот държи тялото в режим &ldquo;бий се или бягай&rdquo;.
              Когато кортизолът скача, задържаш вода и трупаш мазнини за
              оцеляване. Коремните преси няма да го оправят.
            </p>

            <div className="space-y-4 pt-4">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-100 shadow-sm"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-${problem.color}-50 flex items-center justify-center text-${problem.color}-400`}
                  >
                    <problem.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-stone-700">
                    {problem.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
