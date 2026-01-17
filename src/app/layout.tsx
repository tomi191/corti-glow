import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/SmoothScroll";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luralab.eu"),
  title: {
    default: "LURA | Corti-Glow Ритуал - Анти-Стрес & Де-Блоут",
    template: "%s | LURA",
  },
  description:
    "Открий Corti-Glow – вкусният моктейл с Горска Ягода и Лайм, който понижава кортизола, премахва подуването и подобрява съня. Без захар. Натурални съставки.",
  keywords: [
    "кортизол",
    "стрес",
    "подуване",
    "хормонален баланс",
    "ашваганда",
    "магнезий",
    "добавки",
    "corti-glow",
  ],
  authors: [{ name: "LURA" }],
  openGraph: {
    type: "website",
    locale: "bg_BG",
    url: "https://luralab.eu",
    siteName: "LURA",
    title: "LURA | Corti-Glow Ритуал",
    description:
      "Изпий стреса. Прибери коремчето. 14-дневен ритуал за хормонален баланс.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "LURA Corti-Glow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://luralab.eu",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><circle cx=%2216%22 cy=%2216%22 r=%2214%22 fill=%22%232D4A3E%22/><path d=%22M16 8c-3 2-5 6-5 10 0 2 1 4 3 5 1-2 2-5 2-8 0 3 1 6 2 8 2-1 3-3 3-5 0-4-2-8-5-10z%22 fill=%22%23B2D8C6%22/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className="scroll-smooth">
      <body className={`${plusJakarta.variable} antialiased font-sans bg-white`}>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
