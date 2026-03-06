import { Section, Text, Hr, Link, Row, Column } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface OrderConfirmationProps {
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingPrice: number;
  discountAmount: number;
  total: number;
  econtTrackingNumber: string | null;
  supportEmail?: string;
}

export function OrderConfirmation({
  orderNumber,
  createdAt,
  items,
  subtotal,
  shippingPrice,
  discountAmount,
  total,
  econtTrackingNumber,
  supportEmail = "support@luralab.eu",
}: OrderConfirmationProps) {
  const dateStr = new Date(createdAt).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <BaseLayout
      previewText={`Поръчка ${orderNumber} — Потвърждение`}
      showUnsubscribe={false}
    >
      {/* Order Header */}
      <Section
        style={{
          backgroundColor: "#F5F2EF",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "24px",
        }}
      >
        <Text
          className="email-text"
          style={{
            color: "#2D4A3E",
            fontSize: "20px",
            fontWeight: "bold",
            margin: "0 0 4px",
          }}
        >
          Поръчка {orderNumber}
        </Text>
        <Text
          className="email-text-muted"
          style={{ color: "#666", margin: 0, fontSize: "14px" }}
        >
          {dateStr}
        </Text>
      </Section>

      <Text
        className="email-text"
        style={{ color: "#2D4A3E", fontSize: "16px", margin: "0 0 16px" }}
      >
        Благодарим за поръчката! 🌿
      </Text>

      {/* Items */}
      <Section style={{ marginBottom: "24px" }}>
        {/* Table Header */}
        <Row
          style={{
            backgroundColor: "#2D4A3E",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Column style={{ padding: "10px 12px", width: "60%" }}>
            <Text style={{ color: "white", margin: 0, fontSize: "13px", fontWeight: 600 }}>
              Продукт
            </Text>
          </Column>
          <Column style={{ padding: "10px 12px", width: "15%", textAlign: "center" }}>
            <Text style={{ color: "white", margin: 0, fontSize: "13px", fontWeight: 600 }}>
              Кол.
            </Text>
          </Column>
          <Column style={{ padding: "10px 12px", width: "25%", textAlign: "right" }}>
            <Text style={{ color: "white", margin: 0, fontSize: "13px", fontWeight: 600 }}>
              Цена
            </Text>
          </Column>
        </Row>
        {/* Items */}
        {items.map((item, idx) => (
          <Row
            key={idx}
            style={{
              borderBottom: "1px solid #eee",
              backgroundColor: idx % 2 === 0 ? "#fafaf9" : "#ffffff",
            }}
          >
            <Column style={{ padding: "12px" }}>
              <Text className="email-text" style={{ margin: 0, fontSize: "14px" }}>
                {item.title}
              </Text>
            </Column>
            <Column style={{ padding: "12px", textAlign: "center" }}>
              <Text className="email-text" style={{ margin: 0, fontSize: "14px" }}>
                {item.quantity}
              </Text>
            </Column>
            <Column style={{ padding: "12px", textAlign: "right" }}>
              <Text className="email-text" style={{ margin: 0, fontSize: "14px" }}>
                {(item.price * item.quantity).toFixed(2)} €
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Totals */}
      <Section
        style={{
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <Row>
          <Column>
            <Text className="email-text-muted" style={{ margin: "0 0 6px", fontSize: "14px" }}>
              Междинна сума:
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text className="email-text" style={{ margin: "0 0 6px", fontSize: "14px" }}>
              {subtotal.toFixed(2)} €
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text className="email-text-muted" style={{ margin: "0 0 6px", fontSize: "14px" }}>
              Доставка:
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text className="email-text" style={{ margin: "0 0 6px", fontSize: "14px" }}>
              {shippingPrice === 0 ? "Безплатна" : `${shippingPrice.toFixed(2)} €`}
            </Text>
          </Column>
        </Row>
        {discountAmount > 0 && (
          <Row>
            <Column>
              <Text style={{ margin: "0 0 6px", fontSize: "14px", color: "#22c55e" }}>
                Отстъпка:
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={{ margin: "0 0 6px", fontSize: "14px", color: "#22c55e" }}>
                -{discountAmount.toFixed(2)} €
              </Text>
            </Column>
          </Row>
        )}
        <Hr style={{ borderColor: "#2D4A3E", margin: "12px 0" }} />
        <Row>
          <Column>
            <Text
              className="email-text"
              style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}
            >
              Общо:
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text
              className="email-text"
              style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}
            >
              {total.toFixed(2)} €
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Tracking */}
      {econtTrackingNumber ? (
        <Section
          style={{
            backgroundColor: "#2D4A3E",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <Text
            style={{ color: "white", margin: "0 0 4px", fontSize: "13px" }}
          >
            Товарителница:
          </Text>
          <Text
            style={{
              color: "white",
              margin: "0 0 16px",
              fontSize: "22px",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            {econtTrackingNumber}
          </Text>
          <Link
            href={`https://www.econt.com/services/track-shipment/${econtTrackingNumber}`}
            style={{
              display: "inline-block",
              backgroundColor: "white",
              color: "#2D4A3E",
              padding: "12px 24px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Проследи в Еконт
          </Link>
        </Section>
      ) : (
        <Section
          style={{
            background: "linear-gradient(135deg, #B2D8C6 0%, #2D4A3E 100%)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <Text
            style={{ color: "white", margin: "0 0 12px", fontSize: "14px" }}
          >
            Проследи поръчката си:
          </Text>
          <Link
            href="https://luralab.eu/prosledi-porachka"
            style={{
              display: "inline-block",
              backgroundColor: "white",
              color: "#2D4A3E",
              padding: "12px 24px",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Проследи Поръчката
          </Link>
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
