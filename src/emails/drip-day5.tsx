import { Section, Text, Link, Hr } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface DripDay5Props {
  firstName?: string;
}

export function DripDay5({ firstName }: DripDay5Props) {
  const greeting = firstName ? `${firstName}, ` : "";

  return (
    <BaseLayout previewText="Запази своята кутия Corti-Glow — лимитирана първа партида">
      <Text
        className="email-text"
        style={{
          color: "#2D4A3E",
          fontSize: "22px",
          fontWeight: "bold",
          margin: "0 0 16px",
        }}
      >
        {greeting}първата партида е почти готова 🌙
      </Text>

      <Text
        className="email-text-muted"
        style={{ color: "#666", margin: "0 0 24px", fontSize: "15px" }}
      >
        През последните дни ти разказахме за науката зад Corti-Glow. Сега е
        моментът да решиш дали искаш да бъдеш една от първите, които ще го
        опитат.
      </Text>

      {/* Social proof */}
      <Section
        style={{
          background: "linear-gradient(135deg, #B2D8C6 0%, #d4e8dc 100%)",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        <Text
          style={{
            color: "#2D4A3E",
            fontSize: "28px",
            fontWeight: "bold",
            margin: "0 0 4px",
          }}
        >
          87% от жените
        </Text>
        <Text style={{ color: "#2D4A3E", margin: 0, fontSize: "14px" }}>
          забелязват подобрение в съня до 5-ия ден
        </Text>
      </Section>

      {/* What you get */}
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
          В твоята кутия:
        </Text>
        <Text className="email-text" style={{ margin: "0 0 8px", color: "#444" }}>
          ✓ 30 саше Corti-Glow (вкус Горска Ягода и Лайм)
        </Text>
        <Text className="email-text" style={{ margin: "0 0 8px", color: "#444" }}>
          ✓ 5 клинично дозирани съставки
        </Text>
        <Text className="email-text" style={{ margin: "0 0 8px", color: "#444" }}>
          ✓ Безплатен достъп до LURA Навигатор (PWA)
        </Text>
        <Text className="email-text" style={{ margin: 0, color: "#444" }}>
          ✓ 14-дневна гаранция за връщане
        </Text>
      </Section>

      {/* Pricing */}
      <Section
        style={{
          background: "linear-gradient(135deg, #FFC1CC 0%, #ffd6dc 100%)",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        <Text
          style={{
            color: "#2D4A3E",
            margin: "0 0 4px",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Starter Box
        </Text>
        <Text
          style={{
            color: "#2D4A3E",
            margin: "0 0 4px",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          49.99 €
        </Text>
        <Text style={{ color: "#2D4A3E", margin: 0, fontSize: "13px" }}>
          само 1.67 € на ден | Безплатна доставка от 80 €
        </Text>
      </Section>

      <Hr style={{ borderColor: "#eee", margin: "0 0 24px" }} />

      {/* CTA — Exclusivity, not urgency (Gemini tone correction) */}
      <Section style={{ textAlign: "center", marginBottom: "16px" }}>
        <Link
          href="https://luralab.eu/produkt/corti-glow"
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
          Запази своята кутия →
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
        Без ангажимент. 14-дневна гаранция за връщане.
      </Text>
    </BaseLayout>
  );
}
