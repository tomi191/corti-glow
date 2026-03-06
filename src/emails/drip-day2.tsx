import { Section, Text, Link, Hr } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface DripDay2Props {
  firstName?: string;
}

export function DripDay2({ firstName }: DripDay2Props) {
  const greeting = firstName ? `${firstName}, ` : "";

  return (
    <BaseLayout previewText="Защо кортизолът е в основата на 5 от най-честите ти оплаквания">
      <Text
        className="email-text"
        style={{
          color: "#2D4A3E",
          fontSize: "22px",
          fontWeight: "bold",
          margin: "0 0 16px",
        }}
      >
        {greeting}знаеш ли какво свързва тези 5 неща? 🔬
      </Text>

      <Text
        className="email-text-muted"
        style={{ color: "#666", margin: "0 0 24px", fontSize: "15px" }}
      >
        Подуване. Безсъние. Тревожност. PMS. Кожни проблеми. Изглеждат
        като 5 различни проблема, но имат един общ корен —{" "}
        <strong>хронично повишен кортизол</strong>.
      </Text>

      {/* Science section */}
      <Section
        style={{
          borderLeft: "3px solid #B2D8C6",
          paddingLeft: "20px",
          marginBottom: "24px",
        }}
      >
        <Text
          className="email-text"
          style={{
            color: "#2D4A3E",
            fontWeight: 600,
            margin: "0 0 8px",
            fontSize: "16px",
          }}
        >
          Науката е ясна:
        </Text>
        <Text className="email-text-muted" style={{ color: "#666", margin: "0 0 12px", fontSize: "14px" }}>
          Когато кортизолът е постоянно висок, тялото ти реагира с
          възпаление, задържане на вода, нарушен сън и хормонален дисбаланс.
          Не е &ldquo;в главата ти&rdquo; — има биологична причина.
        </Text>
      </Section>

      {/* Ingredient deep dive */}
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
          Как Corti-Glow адресира всяко от тях:
        </Text>

        <Text className="email-text" style={{ margin: "0 0 12px", color: "#444", fontSize: "14px" }}>
          <strong>Подуване →</strong> Бромелаин 100mg (2400 GDU/g) разгражда
          белтъците + Пребиотик Инулин 2500mg за спокоен стомах
        </Text>
        <Text className="email-text" style={{ margin: "0 0 12px", color: "#444", fontSize: "14px" }}>
          <strong>Безсъние →</strong> Магнезий бисглицинат 670mg + L-Теанин
          200mg активират парасимпатиковата нервна система
        </Text>
        <Text className="email-text" style={{ margin: "0 0 12px", color: "#444", fontSize: "14px" }}>
          <strong>Тревожност →</strong> Ашваганда (5% витанолиди) 300mg
          модулира HPA оста — намалява кортизола с до 27%
        </Text>
        <Text className="email-text" style={{ margin: "0 0 12px", color: "#444", fontSize: "14px" }}>
          <strong>PMS →</strong> Мио-инозитол 2000mg подобрява менструалната
          регулярност + Витамин B6 (P-5-P) за хормонална подкрепа
        </Text>
        <Text className="email-text" style={{ margin: 0, color: "#444", fontSize: "14px" }}>
          <strong>Кожа →</strong> Понижен кортизол = повече колаген, по-малко
          акне от стрес
        </Text>
      </Section>

      <Hr style={{ borderColor: "#eee", margin: "0 0 24px" }} />

      <Section style={{ textAlign: "center", marginBottom: "16px" }}>
        <Link
          href="https://luralab.eu/nauka"
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
          Виж цялата наука →
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
        Всяка съставка е линкната към PubMed проучвания на нашия сайт.
      </Text>
    </BaseLayout>
  );
}
