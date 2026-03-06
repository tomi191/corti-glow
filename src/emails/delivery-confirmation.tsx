import { Section, Text } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface DeliveryConfirmationProps {
  orderNumber: string;
  supportEmail?: string;
}

export function DeliveryConfirmation({
  orderNumber,
  supportEmail = "support@luralab.eu",
}: DeliveryConfirmationProps) {
  return (
    <BaseLayout
      previewText={`Поръчка ${orderNumber} е доставена!`}
      showUnsubscribe={false}
    >
      {/* Hero */}
      <Section
        style={{
          background: "linear-gradient(135deg, #B2D8C6 0%, #FFC1CC 100%)",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        <Text style={{ fontSize: "48px", margin: "0 0 8px" }}>✨</Text>
        <Text
          style={{
            color: "#2D4A3E",
            fontSize: "22px",
            fontWeight: "bold",
            margin: "0 0 4px",
          }}
        >
          Доставено!
        </Text>
        <Text style={{ color: "#2D4A3E", margin: 0, fontSize: "14px" }}>
          Надяваме се да ти хареса!
        </Text>
      </Section>

      {/* How to use */}
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
            fontWeight: "bold",
            margin: "0 0 12px",
          }}
        >
          Как да използваш Corti-Glow:
        </Text>
        <Text className="email-text" style={{ margin: "0 0 8px", color: "#666" }}>
          1. Изсипи едно саше в 250мл студена вода
        </Text>
        <Text className="email-text" style={{ margin: "0 0 8px", color: "#666" }}>
          2. Разбъркай добре и добави лед
        </Text>
        <Text className="email-text" style={{ margin: 0, color: "#666" }}>
          3. Отпивай бавно и се наслади на момента
        </Text>
      </Section>

      <Text
        className="email-text-muted"
        style={{ textAlign: "center", fontSize: "12px", color: "#999" }}
      >
        Въпроси? Пиши ни на {supportEmail}
      </Text>
    </BaseLayout>
  );
}
