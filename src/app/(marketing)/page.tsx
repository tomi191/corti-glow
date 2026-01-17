import {
  PremiumHero,
  PremiumFeatures,
  PremiumIngredients,
  PremiumHowTo,
  PremiumBundles,
  BentoReviews,
  PremiumFAQ,
  PremiumCTA,
} from "@/components/home";

export default function HomePage() {
  return (
    <>
      <PremiumHero />
      <PremiumFeatures />
      <PremiumIngredients />
      <PremiumHowTo />
      <PremiumBundles />
      <BentoReviews />
      <PremiumFAQ />
      <PremiumCTA />
    </>
  );
}
