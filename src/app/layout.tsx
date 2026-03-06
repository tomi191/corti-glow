import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { bgBG } from "@clerk/localizations";
import { SmoothScrollProvider } from "@/components/providers/SmoothScroll";
import { WaitlistProvider } from "@/components/providers/WaitlistProvider";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luralab.eu"),
  title: {
    default: "LURA | Науката зад Красотата Без Стрес",
    template: "%s | LURA",
  },
  description:
    "Corti-Glow е вечерният моктейл с 7 активни съставки — ашваганда, магнезий бисглицинат, мио-инозитол и инулин — за по-нисък кортизол и хормонален баланс. Без захар.",
  keywords: [
    "кортизол",
    "стрес",
    "кожа",
    "сияние",
    "хормонален баланс",
    "ашваганда",
    "магнезий",
    "инозитол",
    "добавки",
    "corti-glow",
    "моктейл",
  ],
  authors: [{ name: "LURA" }],
  openGraph: {
    type: "website",
    locale: "bg_BG",
    url: "https://luralab.eu",
    siteName: "LURA",
    title: "LURA Corti-Glow — Вечерният Моктейл за Красота Без Стрес",
    description:
      "Corti-Glow — вечерният моктейл, който понижава кортизола и връща сиянието на кожата. 7 активни съставки, без захар.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LURA Corti-Glow — Вечерният Моктейл за Красота Без Стрес",
    description:
      "Corti-Glow — вечерният моктейл, който понижава кортизола и връща сиянието на кожата. 7 активни съставки, без захар.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://luralab.eu",
    languages: {
      bg: "https://luralab.eu",
      "x-default": "https://luralab.eu",
    },
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><circle cx=%2216%22 cy=%2216%22 r=%2214%22 fill=%22%232D4A3E%22/><path d=%22M16 8c-3 2-5 6-5 10 0 2 1 4 3 5 1-2 2-5 2-8 0 3 1 6 2 8 2-1 3-3 3-5 0-4-2-8-5-10z%22 fill=%22%23B2D8C6%22/></svg>",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LURA",
  legalName: '"ЛЕВЕЛ 8" ЕООД',
  url: "https://luralab.eu",
  logo: "https://luralab.eu/icon-512.png",
  email: "contact@luralab.eu",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@luralab.eu",
    contactType: "customer service",
    availableLanguage: "Bulgarian",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "ж.к. Възраждане, бл. 28, вх. 1, ет. 5, ап. 10",
    addressLocality: "Варна",
    postalCode: "9000",
    addressCountry: "BG",
  },
  sameAs: [
    "https://instagram.com/luralab",
    "https://facebook.com/luralab",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LURA",
  url: "https://luralab.eu",
  inLanguage: "bg",
  publisher: {
    "@type": "Organization",
    name: "LURA",
    url: "https://luralab.eu",
  },
};

const clerkAppearance = {
  cssLayerName: "clerk" as const,
  variables: {
    colorPrimary: "#2D4A3E",
    colorTextOnPrimaryBackground: "#fff",
    colorBackground: "#fff",
    colorInputBackground: "#fafaf9",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-plus-jakarta), sans-serif",
  },
  elements: {
    footerAction: { display: "none" as const },
    footer: { display: "none" as const },
  },
};

function ClerkWrapper({ children }: { children: React.ReactNode }) {
  // Skip ClerkProvider when publishable key is missing (e.g. during static build)
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  return <ClerkProvider appearance={clerkAppearance} localization={bgBG}>{children}</ClerkProvider>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkWrapper>
      <html lang="bg">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#2D4A3E" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
        </head>
        <body className={`${plusJakarta.variable} ${outfit.variable} ${cormorant.variable} antialiased font-sans bg-[#F7F4F0] overflow-x-hidden`}>
          <GoogleAnalytics />
          <WaitlistProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </WaitlistProvider>
          <CookieConsent />
        </body>
      </html>
    </ClerkWrapper>
  );
}
