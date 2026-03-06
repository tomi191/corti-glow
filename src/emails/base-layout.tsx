import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
  Preview,
  Tailwind,
} from "@react-email/components";
import type { ReactNode } from "react";

// Brand Tailwind config shared across all emails
export const brandTailwindConfig = {
  theme: {
    extend: {
      colors: {
        brand: {
          forest: "#2D4A3E",
          sage: "#B2D8C6",
          blush: "#FFC1CC",
          cream: "#F4E3B2",
          sand: "#F5F2EF",
        },
      },
    },
  },
};

interface BaseLayoutProps {
  previewText: string;
  children: ReactNode;
  showUnsubscribe?: boolean;
  unsubscribeUrl?: string;
}

export function BaseLayout({
  previewText,
  children,
  showUnsubscribe = true,
  unsubscribeUrl,
}: BaseLayoutProps) {
  return (
    <Html lang="bg">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          @media (prefers-color-scheme: dark) {
            .email-body { background-color: #1c1917 !important; }
            .email-card { background-color: #292524 !important; border-color: #44403c !important; }
            .email-text { color: #e7e5e4 !important; }
            .email-text-muted { color: #a8a29e !important; }
            .email-header { background: linear-gradient(135deg, #1a3a2e 0%, #0f1f19 100%) !important; }
            .email-footer-bg { background-color: #1a3a2e !important; }
          }
        `}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind config={brandTailwindConfig}>
        <Body
          className="email-body"
          style={{
            margin: 0,
            padding: 0,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            lineHeight: "1.6",
            color: "#333",
            backgroundColor: "#F5F2EF",
          }}
        >
          <Container
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              padding: "40px 20px",
            }}
          >
            {/* Header */}
            <Section
              className="email-header"
              style={{
                background: "linear-gradient(135deg, #2D4A3E 0%, #1a2d25 100%)",
                padding: "32px 40px",
                textAlign: "center",
                borderRadius: "16px 16px 0 0",
              }}
            >
              <Img
                src="https://luralab.eu/logo-email.png"
                alt="LURA"
                width={100}
                height={32}
                style={{ margin: "0 auto" }}
              />
              <Text
                style={{
                  color: "#B2D8C6",
                  margin: "8px 0 0",
                  fontSize: "13px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Wellness за модерната жена
              </Text>
            </Section>

            {/* Content Card */}
            <Section
              className="email-card"
              style={{
                backgroundColor: "#ffffff",
                padding: "32px 40px",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              }}
            >
              {children}
            </Section>

            {/* Footer */}
            <Section
              className="email-footer-bg"
              style={{
                backgroundColor: "#2D4A3E",
                padding: "24px 40px",
                textAlign: "center",
                borderRadius: "0 0 16px 16px",
              }}
            >
              <Text
                style={{
                  color: "#B2D8C6",
                  margin: "0 0 8px",
                  fontSize: "13px",
                }}
              >
                С грижа, Екипът на LURA
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.3)",
                  margin: "0 0 12px",
                  fontSize: "11px",
                }}
              >
                © {new Date().getFullYear()} LURA | &quot;ЛЕВЕЛ 8&quot; ЕООД |
                Варна, България
              </Text>
              {showUnsubscribe && (
                <Text style={{ margin: 0, fontSize: "11px" }}>
                  <Link
                    href={unsubscribeUrl || "{{{RESEND_UNSUBSCRIBE_URL}}}"}
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Управление на предпочитанията
                  </Link>
                </Text>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
