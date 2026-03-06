import { Section, Text, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface ShippingNotificationProps {
  orderNumber: string;
  econtTrackingNumber: string | null;
  supportEmail?: string;
}

export function ShippingNotification({
  orderNumber,
  econtTrackingNumber,
  supportEmail = "support@luralab.eu",
}: ShippingNotificationProps) {
  const trackingUrl = econtTrackingNumber
    ? `https://www.econt.com/services/track-shipment/${econtTrackingNumber}`
    : null;

  return (
    <BaseLayout
      previewText={`Поръчка ${orderNumber} е изпратена!`}
      showUnsubscribe={false}
    >
      {/* Hero */}
      <Section
        style={{
          backgroundColor: "#B2D8C6",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        <Text style={{ fontSize: "48px", margin: "0 0 8px" }}>📦</Text>
        <Text
          style={{
            color: "#2D4A3E",
            fontSize: "22px",
            fontWeight: "bold",
            margin: "0 0 4px",
          }}
        >
          Изпратено!
        </Text>
        <Text style={{ color: "#2D4A3E", margin: 0, fontSize: "14px" }}>
          Поръчка {orderNumber}
        </Text>
      </Section>

      {trackingUrl && (
        <Section style={{ textAlign: "center", marginBottom: "24px" }}>
          <Link
            href={trackingUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#2D4A3E",
              color: "white",
              padding: "14px 28px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Проследи в Еконт
          </Link>
          {econtTrackingNumber && (
            <Text
              className="email-text-muted"
              style={{
                margin: "12px 0 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Номер: {econtTrackingNumber}
            </Text>
          )}
        </Section>
      )}

      <Text
        className="email-text-muted"
        style={{ textAlign: "center", fontSize: "12px", color: "#999" }}
      >
        Въпроси? Пиши ни на {supportEmail}
      </Text>
    </BaseLayout>
  );
}
