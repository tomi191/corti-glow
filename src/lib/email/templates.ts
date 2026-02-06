// Email Templates for LURA

export const emailTemplates = {
  // Welcome email with discount
  welcome: {
    subject: "✨ Добре дошла в LURA! Твоят код за 10% отстъпка",
    previewText: "Погрижи се за себе си с нашите премиум добавки",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #F5F2EF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F2EF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2D4A3E 0%, #1a2d25 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; letter-spacing: 4px;">LURA</h1>
              <p style="color: #B2D8C6; margin: 10px 0 0; font-size: 14px;">Wellness за модерната жена</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #2D4A3E; font-size: 24px; margin: 0 0 20px;">Добре дошла в LURA! 🌿</h2>

              <p style="color: #666; margin: 0 0 20px;">
                Радваме се, че си тук! В LURA вярваме, че всяка жена заслужава да се чувства добре в тялото си – изпълнена с енергия, спокойствие и баланс.
              </p>

              <p style="color: #666; margin: 0 0 30px;">
                Като знак на благодарност, ти подготвихме специален подарък:
              </p>

              <!-- Discount Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #B2D8C6 0%, #FFC1CC 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="color: #2D4A3E; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Твоят код за отстъпка</p>
                    <p style="color: #2D4A3E; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 4px;">WELCOME10</p>
                    <p style="color: #2D4A3E; margin: 10px 0 0; font-size: 16px;">10% отстъпка за първа поръчка</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{SHOP_URL}}" style="display: inline-block; background-color: #2D4A3E; color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Пазарувай Сега →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #999; margin: 30px 0 0; font-size: 12px; text-align: center;">
                Кодът е валиден 30 дни. Не може да се комбинира с други отстъпки.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #2D4A3E; padding: 30px; text-align: center;">
              <p style="color: #B2D8C6; margin: 0 0 10px; font-size: 14px;">
                С любов и грижа,<br>Екипът на LURA
              </p>
              <p style="color: #ffffff40; margin: 0; font-size: 12px;">
                © 2026 LURA Wellness. Всички права запазени.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  },

  // Abandoned cart reminder
  abandonedCart: {
    subject: "Забрави нещо? Твоята количка те чака 🛒",
    previewText: "Върни се и довърши поръчката си",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #F5F2EF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F2EF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2D4A3E 0%, #1a2d25 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; letter-spacing: 4px;">LURA</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 48px; text-align: center; margin: 0 0 20px;">🛒</p>

              <h2 style="color: #2D4A3E; font-size: 24px; margin: 0 0 20px; text-align: center;">
                Забрави нещо в количката?
              </h2>

              <p style="color: #666; margin: 0 0 30px; text-align: center;">
                Corti-Glow те чака! Хормоналният баланс е само на една стъпка разстояние.
              </p>

              <!-- Product reminder -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F2EF; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="80" style="vertical-align: top;">
                          <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #FFC1CC 0%, #B2D8C6 100%); border-radius: 12px;"></div>
                        </td>
                        <td style="padding-left: 15px; vertical-align: top;">
                          <p style="margin: 0; font-weight: 600; color: #2D4A3E;">Corti-Glow</p>
                          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Анти-стрес моктейл</p>
                          <p style="margin: 10px 0 0; color: #2D4A3E; font-weight: 600;">от 49.99 €</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{CART_URL}}" style="display: inline-block; background-color: #2D4A3E; color: #ffffff; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Довърши Поръчката →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Trust badges -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      ✓ 14-дневна гаранция &nbsp;&nbsp; ✓ Безплатна доставка над 80 € &nbsp;&nbsp; ✓ Сигурно плащане
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #2D4A3E; padding: 30px; text-align: center;">
              <p style="color: #ffffff40; margin: 0; font-size: 12px;">
                © 2026 LURA Wellness. Всички права запазени.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  },

  // Review request
  reviewRequest: {
    subject: "Как ти се струва Corti-Glow? ⭐",
    previewText: "Твоето мнение е важно за нас",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #F5F2EF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F2EF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2D4A3E 0%, #1a2d25 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; letter-spacing: 4px;">LURA</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px; text-align: center;">
              <p style="font-size: 48px; margin: 0 0 20px;">⭐⭐⭐⭐⭐</p>

              <h2 style="color: #2D4A3E; font-size: 24px; margin: 0 0 20px;">
                Как ти се струва Corti-Glow?
              </h2>

              <p style="color: #666; margin: 0 0 30px;">
                Мина време от твоята поръчка и сме любопитни – чувстваш ли разлика?<br>
                Твоето мнение ни помага да ставаме по-добри.
              </p>

              <!-- Rating buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="{{REVIEW_URL}}" style="display: inline-block; background-color: #B2D8C6; color: #2D4A3E; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Остави Отзив →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #999; font-size: 14px; margin: 0;">
                Отнема само 2 минути и много ще ни зарадва! 💚
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #2D4A3E; padding: 30px; text-align: center;">
              <p style="color: #B2D8C6; margin: 0 0 10px; font-size: 14px;">
                Благодарим ти, че си част от LURA!
              </p>
              <p style="color: #ffffff40; margin: 0; font-size: 12px;">
                © 2026 LURA Wellness. Всички права запазени.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  },
};

// Get template with replaced variables
export function getEmailTemplate(
  templateName: keyof typeof emailTemplates,
  variables: Record<string, string> = {}
) {
  const template = emailTemplates[templateName];

  let html = template.html;
  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  return {
    subject: template.subject,
    previewText: template.previewText,
    html,
  };
}
