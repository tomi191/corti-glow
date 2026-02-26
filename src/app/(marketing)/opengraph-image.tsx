import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "LURA Corti-Glow — Науката зад Красотата Без Стрес";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontsDir = join(process.cwd(), "assets/fonts");

  const [cormorantLight, cormorantBoldItalic, cormorantBold, jakartaSemiBold] =
    await Promise.all([
      readFile(join(fontsDir, "CormorantGaramond-Light.ttf")),
      readFile(join(fontsDir, "CormorantGaramond-SemiBoldItalic.ttf")),
      readFile(join(fontsDir, "CormorantGaramond-Bold.ttf")),
      readFile(join(fontsDir, "PlusJakartaSans-SemiBold.ttf")),
    ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(155deg, #1a2f27 0%, #2D4A3E 35%, #3a5f4f 55%, #2D4A3E 75%, #1a2f27 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glowing frame */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            right: 18,
            bottom: 18,
            borderRadius: 20,
            border: "1.5px solid rgba(178,216,198,0.25)",
            display: "flex",
          }}
        />

        {/* Pills row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {["KSM-66® Ashwagandha", "7 активни съставки", "Без захар"].map(
            (text) => (
              <div
                key={text}
                style={{
                  padding: "6px 16px",
                  borderRadius: 100,
                  fontSize: 11,
                  fontFamily: "Jakarta",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  border: "1px solid rgba(178,216,198,0.25)",
                  color: "rgba(178,216,198,0.85)",
                  background: "rgba(178,216,198,0.06)",
                  display: "flex",
                }}
              >
                {text}
              </div>
            )
          )}
        </div>

        {/* Brand */}
        <div
          style={{
            fontSize: 15,
            letterSpacing: "0.45em",
            textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.40)",
            fontFamily: "Jakarta",
            marginBottom: 12,
            display: "flex",
          }}
        >
          L U R A
        </div>

        {/* Headline row 1 */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
          }}
        >
          <span
            style={{
              fontFamily: "Cormorant",
              fontSize: 76,
              color: "white",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            Науката зад
          </span>
          <span
            style={{
              fontFamily: "CormorantItalic",
              fontSize: 76,
              fontStyle: "italic",
              color: "#B2D8C6",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            Красотата
          </span>
        </div>

        {/* Headline row 2 */}
        <div
          style={{
            fontFamily: "CormorantBold",
            fontSize: 76,
            color: "white",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            display: "flex",
          }}
        >
          Без Стрес.
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 50,
            height: 2,
            background: "linear-gradient(90deg, #B2D8C6, #FFC1CC)",
            borderRadius: 2,
            marginTop: 22,
            marginBottom: 20,
            display: "flex",
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "Jakarta",
            lineHeight: 1.5,
            textAlign: "center" as const,
            maxWidth: 480,
            display: "flex",
          }}
        >
          Corti-Glow — вечерният моктейл, който понижава кортизола и връща
          сиянието на кожата.
        </div>

        {/* CTA button */}
        <div
          style={{
            marginTop: 24,
            padding: "10px 28px",
            borderRadius: 100,
            background:
              "linear-gradient(135deg, rgba(178,216,198,0.15), rgba(255,193,204,0.10))",
            border: "1px solid rgba(178,216,198,0.20)",
            fontSize: 13,
            fontFamily: "Jakarta",
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.03em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Открий повече →
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "rgba(178,216,198,0.5)",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.28)",
              fontFamily: "Jakarta",
            }}
          >
            Горска Ягода & Лайм
          </span>
          <div
            style={{
              width: 1,
              height: 14,
              background: "rgba(255,255,255,0.10)",
              marginLeft: 12,
              marginRight: 12,
              display: "flex",
            }}
          />
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "rgba(255,193,204,0.5)",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.28)",
              fontFamily: "Jakarta",
            }}
          >
            Клинично доказано
          </span>
          <div
            style={{
              width: 1,
              height: 14,
              background: "rgba(255,255,255,0.10)",
              marginLeft: 12,
              marginRight: 12,
              display: "flex",
            }}
          />
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "rgba(244,227,178,0.5)",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.28)",
              fontFamily: "Jakarta",
            }}
          >
            luralab.eu
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant",
          data: cormorantLight,
          style: "normal" as const,
          weight: 300 as const,
        },
        {
          name: "CormorantItalic",
          data: cormorantBoldItalic,
          style: "italic" as const,
          weight: 600 as const,
        },
        {
          name: "CormorantBold",
          data: cormorantBold,
          style: "normal" as const,
          weight: 700 as const,
        },
        {
          name: "Jakarta",
          data: jakartaSemiBold,
          style: "normal" as const,
          weight: 600 as const,
        },
      ],
    }
  );
}
