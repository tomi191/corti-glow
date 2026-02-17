import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Leaf, Sparkles } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "За Нас",
  description: "Запознайте се с LURA - марката за женско здраве.",
  alternates: { canonical: "https://luralab.eu/za-nas" },
  openGraph: {
    title: "За Нас | LURA",
    description:
      "Научно обоснован уелнес за модерната жена. Създадено от жени, за жени.",
  },
};

const values = [
  {
    icon: Heart,
    title: "Създадено от Жени",
    description:
      "LURA е основана от жени, които разбират предизвикателствата на модерния живот.",
  },
  {
    icon: Leaf,
    title: "Натурални Съставки",
    description:
      "Използваме само научно доказани, натурални съставки от най-високо качество.",
  },
  {
    icon: Sparkles,
    title: "Наука на Първо Място",
    description:
      "Всяка формула е базирана на клинични проучвания и съвременна наука.",
  },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "За Нас", url: "https://luralab.eu/za-nas" },
        ]}
      />
      {/* Hero */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[#B2D8C6] text-xs font-bold tracking-widest uppercase mb-4 block">
            За Нас
          </span>
          <h1 className="text-3xl md:text-6xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
            Мисията на LURA
          </h1>
          <p className="text-lg text-stone-600 font-light">
            Вярваме, че всяка жена заслужава да се чувства добре в тялото си.
            Създадохме LURA, за да предложим научно обосновани решения за
            хормонално здраве.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <Image
                src="/images/lifestyle-evening-mocktail.webp"
                alt="Вечерен ритуал с Corti-Glow моктейл"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-[#2D4A3E] mb-6">
                Нашата История
              </h2>
              <div className="space-y-4 text-stone-600">
                <p>
                  LURA започна от лично преживяване. След години на борба с
                  хронична умора, подуване и хормонален дисбаланс, основателката
                  ни реши да потърси алтернатива на традиционните подходи.
                </p>
                <p>
                  Работейки с нутриционисти и ендокринолози, разработихме
                  формула, която адресира първопричината - високия кортизол.
                </p>
                <p>
                  Днес LURA помага на хиляди жени в България да се чувстват
                  по-добре всеки ден.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-[#2D4A3E] text-center mb-8">
            Нашите Ценности
          </h2>
          <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden shadow-lg mb-12">
            <Image
              src="/images/za-nas-values.webp"
              alt="Натурални съставки — от природата с грижа"
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center p-8 bg-stone-50 rounded-3xl"
              >
                <div className="w-16 h-16 bg-[#B2D8C6]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-[#2D4A3E]" />
                </div>
                <h3 className="text-xl font-semibold text-[#2D4A3E] mb-3">
                  {value.title}
                </h3>
                <p className="text-stone-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
