import { Section, Text, Link } from "@react-email/components";
import { BaseLayout } from "./base-layout";

interface WaitlistWelcomeProps {
  pdfUrl: string;
  pwaUrl: string;
}

export function WaitlistWelcome({
  pdfUrl,
  pwaUrl,
}: WaitlistWelcomeProps) {
  return (
    <BaseLayout previewText="3 сутрешни навика, които свалят кортизола — безплатен PDF вътре">
      <Text
        className="email-text"
        style={{
          color: "#2D4A3E",
          fontSize: "22px",
          fontWeight: "bold",
          margin: "0 0 16px",
        }}
      >
        Ти си в списъка! 🌿
      </Text>
      <Text
        className="email-text-muted"
        style={{ color: "#666", margin: "0 0 24px", fontSize: "15px" }}
      >
        Радваме се, че си една от първите, които ще опитат Corti-Glow.
        Докато подготвяме първата партида, имаме нещо специално за теб:
      </Text>

      {/* PDF Download */}
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
            margin: "0 0 4px",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Безплатен PDF гайд
        </Text>
        <Text
          style={{
            color: "#2D4A3E",
            margin: "0 0 16px",
            fontSize: "17px",
            fontWeight: 600,
          }}
        >
          3 сутрешни навика, които свалят кортизола
        </Text>
        <Link
          href={pdfUrl}
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
          Изтегли PDF →
        </Link>
      </Section>

      {/* Cortisol explanation */}
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
          }}
        >
          Защо кортизолът те &ldquo;подува&rdquo;?
        </Text>
        <Text
          className="email-text-muted"
          style={{ color: "#666", margin: 0, fontSize: "14px" }}
        >
          Когато стресът е постоянен, кортизолът казва на тялото ти да
          трупа мазнини в корема и да задържа вода. Corti-Glow е създаден
          точно за това — с Ashwagandha, Myo-Inositol и Магнезий, които
          връщат баланса.
        </Text>
      </Section>

      {/* VIP Discount */}
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
          VIP отстъпка
        </Text>
        <Text
          style={{
            color: "#2D4A3E",
            margin: "0 0 4px",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          20% OFF
        </Text>
        <Text style={{ color: "#2D4A3E", margin: 0, fontSize: "14px" }}>
          при старта на продукта — само за теб
        </Text>
      </Section>

      {/* PWA CTA */}
      <Section style={{ textAlign: "center" }}>
        <Text
          className="email-text-muted"
          style={{ color: "#666", margin: "0 0 16px", fontSize: "14px" }}
        >
          Докато чакаш, опитай нашето приложение — дневен запис за стрес и
          сън, дихателно упражнение и персонализирани препоръки.
        </Text>
        <Link
          href={pwaUrl}
          style={{
            display: "inline-block",
            backgroundColor: "white",
            color: "#2D4A3E",
            padding: "12px 28px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "14px",
            border: "2px solid #2D4A3E",
          }}
        >
          Опитай LURA App →
        </Link>
      </Section>
    </BaseLayout>
  );
}
