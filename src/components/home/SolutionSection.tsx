import { Droplets, Brain, Scale } from "lucide-react";
import { features } from "@/data/products";

const iconMap: Record<string, React.ElementType> = {
  droplets: Droplets,
  brain: Brain,
  scale: Scale,
};

export function SolutionSection() {
  return (
    <section
      className="py-20 md:py-28 bg-[#2D4A3E] text-white overflow-hidden relative"
      id="science"
    >
      {/* Abstract Bg */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B2D8C6] opacity-10 blur-[100px] rounded-full" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#B2D8C6] text-xs font-bold tracking-widest uppercase mb-4 block">
            Антидотът
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
            3-в-1 Моктейл Ритуал
          </h2>
          <p className="text-stone-300 font-light text-lg">
            Замени вечерното вино с функционален бленд, създаден да успокои
            нервната система и да изчисти възпаленията.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Droplets;
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    backgroundColor: `${feature.iconColor}20`,
                    color: feature.iconColor,
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
