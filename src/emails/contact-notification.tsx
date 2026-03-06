import { Section, Text } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface ContactNotificationProps {
  name: string;
  email: string;
  message: string;
}

export function ContactNotification({
  name,
  email,
  message,
}: ContactNotificationProps) {
  return (
    <BaseLayout
      previewText={`Ново съобщение от ${name}`}
      showUnsubscribe={false}
    >
      <Text
        className="email-text"
        style={{
          color: "#2D4A3E",
          fontSize: "20px",
          fontWeight: "bold",
          margin: "0 0 16px",
        }}
      >
        Ново съобщение от контактната форма
      </Text>

      <Text className="email-text" style={{ margin: "0 0 4px" }}>
        <strong>Име:</strong> {name}
      </Text>
      <Text className="email-text" style={{ margin: "0 0 16px" }}>
        <strong>Имейл:</strong> {email}
      </Text>

      <Text
        className="email-text"
        style={{ fontWeight: 600, margin: "0 0 8px" }}
      >
        Съобщение:
      </Text>
      <Section
        style={{
          backgroundColor: "#F5F2EF",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <Text className="email-text" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {message}
        </Text>
      </Section>
    </BaseLayout>
  );
}
