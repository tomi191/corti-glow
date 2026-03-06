import { Section, Text, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface WelcomeProps {
  shopUrl?: string;
}

export function Welcome({ shopUrl = "https://luralab.eu/magazin" }: WelcomeProps) {
  return (
    <BaseLayout previewText="Добре дошла в LURA! Твоят код за 10% отстъпка">
      <Text
        className="email-text"
        style={{
          color: "#2D4A3E",
          fontSize: "22px",
          fontWeight: "bold",
          margin: "0 0 16px",
        }}
      >
        Добре дошла в LURA! 🌿
      </Text>

      <Text
        className="email-text-muted"
        style={{ color: "#666", margin: "0 0 16px", fontSize: "15px" }}
      >
        Радваме се, че си тук! В LURA вярваме, че всяка жена заслужава да
        се чувства добре в тялото си — изпълнена с енергия, спокойствие и
        баланс.
      </Text>

      <Text
        className="email-text-muted"
        style={{ color: "#666", margin: "0 0 24px", fontSize: "15px" }}
      >
        Като знак на благодарност, ти подготвихме специален подарък:
      </Text>

      {/* Discount Box */}
      <Section
        style={{
          background: "linear-gradient(135deg, #B2D8C6 0%, #FFC1CC 100%)",
          borderRadius: "12px",
          padding: "28px",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        <Text
          style={{
            color: "#2D4A3E",
            margin: "0 0 8px",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Твоят код за отстъпка
        </Text>
        <Text
          style={{
            color: "#2D4A3E",
            margin: "0 0 8px",
            fontSize: "32px",
            fontWeight: "bold",
            letterSpacing: "4px",
          }}
        >
          WELCOME10
        </Text>
        <Text style={{ color: "#2D4A3E", margin: 0, fontSize: "15px" }}>
          10% отстъпка за първа поръчка
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center", marginBottom: "16px" }}>
        <Link
          href={shopUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#2D4A3E",
            color: "white",
            padding: "16px 40px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          Разгледай Магазина →
        </Link>
      </Section>

      <Text
        className="email-text-muted"
        style={{
          color: "#999",
          margin: 0,
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        Кодът е валиден 30 дни. Не може да се комбинира с други отстъпки.
      </Text>
    </BaseLayout>
  );
}
