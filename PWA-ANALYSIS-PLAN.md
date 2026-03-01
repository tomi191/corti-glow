# LURA PWA — Пълен Анализ и План за Действие

> Генериран: 2026-03-01 | Обновен: 2026-03-01 | Статус: В изпълнение

---

## I. ЗАВЪРШЕНИ СИСТЕМИ ✅

| # | Система | Дата |
|---|---------|------|
| SYS1 | Server-side PWA профил (pwa_profiles + pwa_checkins) | 2026-03-01 |
| SYS2 | GDPR Data Export endpoint (`GET /api/pwa/export`) | 2026-03-01 |
| SYS3 | Account Deletion cascade (`DELETE /api/pwa/delete-account`) | 2026-03-01 |
| SYS4 | Sync API endpoint (`POST /api/pwa/sync`) | 2026-03-01 |
| SYS5 | Auto-sync on Clerk login (`usePwaSync` hook) | 2026-03-01 |

---

## II. КРИТИЧНИ FIX-ОВЕ (преди launch)

| # | Проблем | Приоритет | Статус |
|---|---------|-----------|--------|
| CF1 | Multi-device sync презаписва данни (client always wins) | КРИТИЧЕН | ✅ |
| CF2 | Sync не се тригерва след check-in (само при app load) | КРИТИЧЕН | ✅ |
| CF3 | Analytics events записват user_id: null за logged-in users | КРИТИЧЕН | ✅ |

---

## III. RETENTION ПРОПУСКИ

| # | Проблем | Приоритет | Статус |
|---|---------|-----------|--------|
| R1 | Няма scheduled push reminders (инфраструктура има, sender липсва) | КРИТИЧЕН | ⬜ |
| R2 | Streak скрит в Profile (не се вижда на dashboard) | ВИСОК | ✅ |
| R3 | Няма loss aversion trigger ("1 ден до 7-дневна серия!") | ВИСОК | ✅ |
| R4 | Няма micro-win след check-in ("Sleep +2 vs вчера!") | ВИСОК | ✅ |
| R5 | Няма re-engagement при 3+ дни отсъствие | ВИСОК | ✅ |
| R6 | Breathing не е свързано със stress (няма trigger при stress >= 7) | ВИСОК | ✅ |
| R7 | Няма phase transition celebration/notification | СРЕДЕН | ⬜ |

---

## IV. МОНЕТИЗАЦИЯ ПРОПУСКИ

| # | Проблем | Revenue Impact | Статус |
|---|---------|----------------|--------|
| M1 | Concerns от onboarding НЕ се ползват за персонализация | HIGH | ✅ |
| M2 | Нула conversion triggers (stress >= 7, лутеална + PMS) | HIGH | ✅ |
| M3 | Shop е само waitlist (няма реален purchase flow) | HIGH | ⬜ (pre-launch) |
| M4 | Няма attribution tracking (PWA → shop → покупка) | HIGH | ⬜ |
| M5 | Няма email capture при onboarding | HIGH | ⬜ |
| M6 | Няма social proof (testimonials, "X жени ползват LURA") | MEDIUM | ⬜ |

---

## V. ТЕХНИЧЕСКИ ПРОПУСКИ

| # | Система | Статус | Приоритет |
|---|---------|--------|-----------|
| T1 | Offline→online sync (navigator.online event) | ❌ Липсва | ВИСОК |
| T2 | pwa_daily_stats aggregation | ⚠️ Таблица празна | СРЕДЕН |
| T3 | PWA offline asset caching (SW кешира само push) | ❌ Липсва | СРЕДЕН |
| T4 | Timezone поле в pwa_profiles | ❌ Липсва | СРЕДЕН |
| T5 | Sync status indicator в UI | ❌ Липсва | СРЕДЕН |
| T6 | Admin PWA user management | ❌ Липсва | НИСЪК |

---

## VI. БИЗНЕС ЛОГИКА

| # | Проблем | Тежест | Статус |
|---|---------|--------|--------|
| BL1 | Фоликуларна фаза изчезва при 21-дневен цикъл | MEDIUM | ⬜ |
| BL2 | Няма валидация periodDuration < cycleLength | LOW | ⬜ |
| BL3 | Предвиждане на следващ период е статично (не учи) | LOW | ⬜ |

---

## VII. ТОП 10 ДЕЙСТВИЯ ПО ПРИОРИТЕТ

### Блокиращи (сега)
- [x] **1. Fix multi-device sync** — timestamp comparison, server wins if newer
- [x] **2. Sync след check-in** — trigger syncWithServer() в saveCheckIn()
- [x] **3. Fix analytics user_id** — подавай Clerk userId при event logging

### Retention (Седмица 1)
- [ ] **4. Scheduled push reminders** — cron/Edge Function + timezone
- [x] **5. Streak на dashboard** — видим с loss aversion trigger
- [x] **6. Micro-win след check-in** — персонализиран feedback

### Монетизация (Седмица 2)
- [x] **7. Concern→ingredient mapping** — персонализирани product recs
- [x] **8. Conversion triggers** — nudge при stress >= 7 с product link
- [ ] **9. Email capture** — стъпка в onboarding
- [ ] **9b. Social proof** — testimonials/counter в shop

### Growth (Седмица 3-4)
- [x] **10. Re-engagement flow** — welcome back при 3+ дни отсъствие

---

*Последна актуализация: 2026-03-01*
