-- Add email and timezone columns to pwa_profiles
-- Email: captured during onboarding (optional)
-- Timezone: auto-detected via Intl API, used for push notification timing
ALTER TABLE pwa_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE pwa_profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
