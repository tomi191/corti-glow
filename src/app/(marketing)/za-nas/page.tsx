import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Leaf, Sparkles, Award, FlaskConical, Users } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "За Нас",
  description:
    "Запознайте се с LURA — марката за женско здраве, създадена от жени, за жени. Научно обосновани формули с натурални съставки за хормонален баланс и анти-стрес.",
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
    color: "#FFC1CC",
    title: "Създадено от Жени",
    description:
      "LURA е основана от жени, които разбират предизвикателствата на модерния живот.",
  },
  {
    icon: Leaf,
    color: "#B2D8C6",
    title: "Натурални Съставки",
    description:
      "Използваме само научно доказани, натурални съставки от най-високо качество.",
  },
  {
    icon: Sparkles,
    color: "#F4E3B2",
    title: "Наука на Първо Място",
    description:
      "Всяка формула е базирана на клинични проучвания и съвременна наука.",
  },
];

const stats = [
  { value: "7", label: "Активни съставки", icon: FlaskConical },
  { value: "500+", label: "Доволни клиентки", icon: Users },
  { value: "24", label: "Клинични проучвания", icon: Award },
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
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F2EF] via-white to-[#B2D8C6]/10" />
        <div className="absolute top-0 right-0 w-[50%] h-[60%] bg-gradient-to-bl from-[#B2D8C6]/15 via-[#FFC1CC]/10 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" />
            За Нас
          </span>
          <h1 className="text-4xl md:text-7xl font-serif font-light text-[#2D4A3E] tracking-tight mb-6 leading-tight">
            Мисията на <span className="italic font-normal">LURA</span>
          </h1>
          <div className="h-[3px] w-16 bg-[#B2D8C6] rounded-full mx-auto mb-6" />
          <p className="text-lg text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
            Вярваме, че всяка жена заслужава да се чувства добре в тялото си.
            Създадохме LURA, за да предложим научно обосновани решения за
            хормонално здраве.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-stone-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 text-[#B2D8C6] mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-bold text-[#2D4A3E]">
                  {stat.value}
                </div>
                <div className="text-xs text-stone-500 uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(45,74,62,0.15)]">
              <Image
                src="/images/lifestyle-evening-mocktail.webp"
                alt="Вечерен ритуал с Corti-Glow моктейл"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E]/20 to-transparent" />
            </div>
            <div>
              <span className="text-[#B2D8C6] text-xs font-bold tracking-widest uppercase mb-4 block">
                Нашата История
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-[#2D4A3E] mb-6 leading-tight">
                От лично преживяване
                <br />
                <span className="italic">към мисия.</span>
              </h2>
              <div className="space-y-4 text-stone-600 font-light leading-relaxed">
                <p>
                  LURA започна от лично преживяване. След години на борба с
                  хронична умора, подуване и хормонален дисбаланс, основателката
                  ни реши да потърси алтернатива на традиционните подходи.
                </p>
                <p>
                  Работейки с нутриционисти и ендокринолози, разработихме
                  формула, която адресира първопричината — високия кортизол.
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
      <section className="py-16 md:py-24 bg-[#F5F2EF]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#B2D8C6] text-xs font-bold tracking-widest uppercase mb-4 block">
              Принципи
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-[#2D4A3E] leading-tight">
              Нашите <span className="italic">Ценности</span>
            </h2>
          </div>

          <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(45,74,62,0.15)] mb-12">
            <Image
              src="/images/za-nas-values.webp"
              alt="Натурални съставки — от природата с грижа"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E]/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${value.color}20` }}
                >
                  <value.icon className="w-8 h-8" style={{ color: value.color }} />
                </div>
                <h3 className="text-xl font-semibold text-[#2D4A3E] mb-3">
                  {value.title}
                </h3>
                <p className="text-stone-600 font-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
