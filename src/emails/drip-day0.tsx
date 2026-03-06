import { Section, Text, Link, Hr } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface DripDay0Props {
  firstName?: string;
}

export function DripDay0({ firstName }: DripDay0Props) {
  const greeting = firstName ? `Здравей, ${firstName}` : "Здравей";

  return (
    <BaseLayout previewText="Добре дошла в LURA — твоят вечерен ритуал за баланс">
      <Text
        className="email-text"
        style={{
          color: "#2D4A3E",
          fontSize: "22px",
          fontWeight: "bold",
          margin: "0 0 16px",
        }}
      >
        {greeting} 🌿
      </Text>

      <Text
        className="email-text-muted"
        style={{ color: "#666", margin: "0 0 16px", fontSize: "15px" }}
      >
        Радваме се, че си тук. LURA не е поредният бранд за добавки — ние
        създаваме ритуали, които работят с тялото ти, не срещу него.
      </Text>

      <Text
        className="email-text-muted"
        style={{ color: "#666", margin: "0 0 24px", fontSize: "15px" }}
      >
        Corti-Glow е вечерен моктейл със синергична формула от 7 активни
        съставки за по-нисък кортизол, по-добър сън и хормонален баланс.
      </Text>

      {/* 3 Key benefits */}
      <Section
        style={{
          backgroundColor: "#F5F2EF",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <Text
          className="email-text"
          style={{
            color: "#2D4A3E",
            fontWeight: 600,
            margin: "0 0 16px",
          }}
        >
          Какво прави Corti-Glow:
        </Text>
        <Text className="email-text" style={{ margin: "0 0 10px", color: "#444" }}>
          🧘 <strong>Ашваганда (5% витанолиди)</strong> — намалява кортизола
          с до 27% (300mg, клинична доза)
        </Text>
        <Text className="email-text" style={{ margin: "0 0 10px", color: "#444" }}>
          😴 <strong>Магнезий бисглицинат 670mg</strong> — най-усвоимата форма,
          успокоява мускулите за 20 минути
        </Text>
        <Text className="email-text" style={{ margin: "0 0 10px", color: "#444" }}>
          ⚖️ <strong>Myo-Inositol 2000mg</strong> — златният стандарт за
          хормонален баланс и инсулинова чувствителност
        </Text>
        <Text className="email-text" style={{ margin: 0, color: "#444" }}>
          🌿 <strong>Пребиотик Инулин 2500mg</strong> — от корен на цикория,
          за спокоен стомах и спокоен ум
        </Text>
      </Section>

      <Hr style={{ borderColor: "#eee", margin: "0 0 24px" }} />

      {/* CTA */}
      <Section style={{ textAlign: "center", marginBottom: "16px" }}>
        <Link
          href="https://luralab.eu/produkt/corti-glow"
          style={{
            display: "inline-block",
            backgroundColor: "#2D4A3E",
            color: "white",
            padding: "14px 32px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "15px",
          }}
        >
          Разгледай Corti-Glow →
        </Link>
      </Section>

      <Text
        className="email-text-muted"
        style={{
          color: "#999",
          textAlign: "center",
          fontSize: "13px",
          margin: 0,
        }}
      >
        P.S. Следващия път ще ти разкажем за науката зад формулата.
      </Text>
    </BaseLayout>
  );
}
