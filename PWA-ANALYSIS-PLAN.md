# LURA PWA — Пълен Анализ и План за Действие

> Генериран: 2026-03-01 | Статус: В изпълнение

---

## I. БИЗНЕС ЛОГИКА — Намерени проблеми

| # | Проблем | Тежест | Статус |
|---|---------|--------|--------|
| BL1 | Фоликуларна фаза изчезва при 21-дневен цикъл | MEDIUM | ⬜ |
| BL2 | Няма валидация periodDuration < cycleLength | LOW | ⬜ |
| BL3 | Предвиждане на следващ период е статично (не учи) | LOW | ⬜ |

---

## II. ПОТРЕБИТЕЛСКИ FLOW — Критични пропуски

| # | Проблем | Приоритет | Статус |
|---|---------|-----------|--------|
| UX1 | Period toggle скрит в expanded view | ВИСОКО | ⬜ |
| UX2 | Няма email collection при onboarding | ВИСОКО | ⬜ |
| UX3 | Insights не водят до действие (няма CTA) | ВИСОКО | ⬜ |
| UX4 | Check-in → Dead end (няма micro-win) | ВИСОКО | ⬜ |
| UX5 | Лични данни от onboarding не се редактират | СРЕДНО | ⬜ |
| UX6 | Няма фаза-промяна countdown | СРЕДНО | ⬜ |
| UX7 | Дихателното упражнение изолирано от flow | СРЕДНО | ⬜ |
| UX8 | PCOS/нередовни цикли не се обработват | СРЕДНО | ⬜ |

---

## III. ДАННИ И СИСТЕМИ — Липсващи компоненти

| # | Система | Статус | Приоритет |
|---|---------|--------|-----------|
| SYS1 | Server-side PWA профил (pwa_profiles + pwa_checkins) | ❌ Липсва | БЛОКИРАЩ |
| SYS2 | GDPR Data Export endpoint | ❌ Липсва | БЛОКИРАЩ |
| SYS3 | Account Deletion cascade | ❌ Липсва | БЛОКИРАЩ |
| SYS4 | Scheduled daily push reminders | ❌ Липсва | ВИСОКО |
| SYS5 | Device sync при login | ❌ Липсва | ВИСОКО |
| SYS6 | Admin PWA analytics dashboard | ❌ Липсва | СРЕДНО |
| SYS7 | Notification time selection | ❌ Липсва | СРЕДНО |
| SYS8 | pwa_daily_stats aggregation | ⚠️ Таблица има, не се попълва | НИСКО |

---

## IV. ТОП 10 ДЕЙСТВИЯ ПО ПРИОРИТЕТ

### Блокиращи (преди launch)
- [ ] **1. Server-side PWA профил** — `pwa_profiles` + `pwa_checkins` таблици, sync API
- [ ] **2. GDPR endpoints** — data export + account deletion cascade
- [ ] **3. Period toggle на видно място** — преди expand

### Retention (Седмица 1-2)
- [ ] **4. Scheduled daily reminder** — cron + timezone push
- [ ] **5. Micro-win след check-in** — "Sleep +2 vs вчера!"
- [ ] **6. Insight → Action CTA** — "Висок стрес? Дихателно →"
- [ ] **7. Email collection** — стъпка в onboarding

### Growth (Седмица 3-4)
- [ ] **8. Phase countdown на dashboard** — "3 дни до овулация"
- [ ] **9. Symptom-to-ingredient mapping** — персонализирани препоръки
- [ ] **10. Device sync** — data merge при login на нов телефон

---

*Последна актуализация: 2026-03-01*
