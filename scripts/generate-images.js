const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Load API key from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const apiKeyMatch = envContent.match(/OPENROUTER_API_KEY=(.+)/);
if (!apiKeyMatch) {
  console.error("OPENROUTER_API_KEY not found in .env.local");
  process.exit(1);
}
const OPENROUTER_API_KEY = apiKeyMatch[1].trim();

const IMAGES_DIR = path.join(__dirname, "..", "public", "images");
const MODEL = "google/gemini-3-pro-image-preview";

// ─── Style DNA (narrative-based, for Nano Banana Pro / Gemini 3 Pro Image) ───
const STYLE_DNA = `
Shared style context for brand consistency:
- Product packaging: rectangular box with pink-to-sage gradient design, "Corti-Glow" text
- Drink: translucent pink liquid in clear glass with ice and lime garnish
- Sachet: individual sachet packets with same gradient branding
- Color world: sage green (#B2D8C6), blush pink (#FFC1CC), cream (#F4E3B2), warm sand (#F5F2EF)
- Textures: white/grey-veined marble, warm-toned wood, cream linen
- Lighting default: warm diffused (~4000K), editorial quality
- Model (when present): European woman ~30, brown hair, minimal natural makeup
- Photography: high-end editorial, shallow depth of field, no text/logos/watermarks
`.trim();

// ─── Image definitions ───
const IMAGES_TO_GENERATE = [
  // Group A: Missing references (HIGH priority)
  {
    name: "product-pouring",
    referenceImages: ["product-splash-pour.webp", "product-sachet-marble.webp"],
    prompt: `Generate a premium lifestyle product photograph:

SCENE: Close-up of a woman's hands pouring pink powder from a supplement sachet into a clear glass of water on a kitchen counter. The pink powder is dissolving and creating beautiful swirls in the water. Soft warm evening light from a window. A few fresh strawberries and a lime slice on the marble countertop beside the glass.

COMPOSITION: Square format (1:1 ratio). Shot from a slightly elevated angle focusing on the hands, sachet, and glass. Shallow depth of field with blurred warm kitchen background.

${STYLE_DNA}`,
    width: 1200,
    height: 1200,
  },
  {
    name: "lifestyle-nightstand-ritual",
    referenceImages: ["lifestyle-nightstand.webp", "lifestyle-evening-mocktail.webp"],
    prompt: `Generate a premium lifestyle photograph:

SCENE: Overhead/bird's eye shot of a bedside nightstand with an evening self-care ritual setup. Items arranged beautifully: a pink-to-sage gradient supplement box, a glass with pink cocktail drink with lime garnish, a lit candle (cream/white), an open book, and a silk satin sleep mask in blush pink. Warm lamp light creating cozy golden glow. White/beige linen bedsheet visible at edges.

COMPOSITION: Square format (1:1 ratio). Flat lay / overhead perspective. Styled editorial arrangement with intentional negative space.

${STYLE_DNA}`,
    width: 1200,
    height: 1200,
  },
  {
    name: "lifestyle-sofa-mocktail",
    referenceImages: ["lifestyle-evening-mocktail.webp", "lifestyle-nightstand.webp"],
    prompt: `Generate a premium lifestyle photograph:

SCENE: A woman (~30, European, brown hair) relaxing on a plush beige/cream sofa with her legs tucked up, holding a glass with a pink cocktail drink with a lime garnish. She looks content and relaxed, natural smile. Cozy living room with soft sage and beige cushions/throws. Warm golden evening light streaming in.

COMPOSITION: Portrait format (4:5 ratio). Medium shot showing the woman from waist up on the sofa. Shallow depth of field.

${STYLE_DNA}`,
    width: 800,
    height: 1000,
  },
  {
    name: "mocktail-ashwagandha-flatlay",
    referenceImages: ["ingredients-flatlay.webp", "product-sachet-marble.webp"],
    prompt: `Generate a premium editorial flat lay photograph:

SCENE: Overhead flat lay on white marble surface. Arranged artistically: a glass with pink cocktail drink, a small ceramic bowl with ashwagandha powder (beige/brown), raw ashwagandha roots, fresh whole strawberries, lime slices, and a pink supplement sachet with gradient design. Scattered pink powder for texture. Soft diffused natural light from above.

COMPOSITION: Landscape format (3:2 ratio). Bird's eye / flat lay perspective. Editorial styled arrangement with breathing room between elements.

${STYLE_DNA}`,
    width: 1200,
    height: 800,
  },
  // Group B: Unsplash replacements (MEDIUM priority)
  {
    name: "lifestyle-stressed-woman",
    referenceImages: ["lifestyle-morning-stretch.webp"],
    prompt: `Generate a premium lifestyle photograph:

SCENE: A woman (~30, European, brown hair) sitting at a desk or table, looking tired and stressed. One hand on her forehead, eyes looking down. Blurred laptop or coffee cup in background. Home office or modern minimal room. Daylight from a window. She's dressed casually but stylishly. The mood is "overwhelmed but still put-together" - NOT depressed, just stressed and fatigued.

COMPOSITION: Portrait format (4:5 ratio). Medium close-up from chest up. Natural daylight, slightly desaturated warm tones.

${STYLE_DNA}`,
    width: 800,
    height: 1000,
  },
  {
    name: "lifestyle-relaxing-bath",
    referenceImages: ["lifestyle-evening-mocktail.webp"],
    prompt: `Generate a premium lifestyle photograph:

SCENE: A woman (~30, European, brown hair) smiling serenely, relaxed on a cozy armchair or sofa, holding a glass with a pink cocktail drink. This is the "after" moment - she looks calm, refreshed, with glowing skin. Warm evening ambient light, cozy interior with soft textiles. Beige and sage green color palette in the background.

COMPOSITION: Portrait format (4:5 ratio). Medium shot showing upper body. Warm golden tones, soft focus background. She's the focal point, radiant and peaceful.

${STYLE_DNA}`,
    width: 800,
    height: 1000,
  },

  // ─── Group C: Unique blog images (replace duplicates) ───
  {
    name: "blog-cortisol-explained",
    referenceImages: ["lifestyle-evening-mocktail.webp", "ingredients-flatlay.webp"],
    prompt: `Generate a premium editorial lifestyle photograph:

SCENE: A woman (~30, European, brown hair) in a calm, peaceful moment — sitting with eyes closed, one hand on her chest. Soft anatomical overlay effect: subtle translucent illustration of adrenal glands and a cortisol molecule floating near her, blending science with serenity. Soft focus background with sage green plants and warm ambient light.

COMPOSITION: Landscape format (16:9 ratio). Medium shot, centered on the woman. Pink and sage tones dominate. Editorial, magazine-quality. Shallow depth of field.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "blog-pms-cortisol",
    referenceImages: ["lifestyle-evening-mocktail.webp", "lifestyle-nightstand.webp"],
    prompt: `Generate a premium lifestyle photograph:

SCENE: A woman (~30, European, brown hair) curled up on a plush sofa, wrapped in a soft cream/beige blanket, holding a warm cup of herbal tea with both hands. Cozy winter evening atmosphere, warm lamp light creating golden glow. A candle burns on the side table. The mood is comfort and self-care during a difficult time. Soft textiles and warm tones.

COMPOSITION: Landscape format (16:9 ratio). Medium shot showing the woman from waist up. Warm golden evening light, soft focus background. Cozy, intimate mood.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "blog-burnout-women",
    referenceImages: ["lifestyle-stressed-woman.webp", "lifestyle-morning-stretch.webp"],
    prompt: `Generate a premium lifestyle photograph:

SCENE: A woman (~30, European, brown hair) sitting at a modern desk, one hand on her forehead, looking down at her laptop screen with visible fatigue. Multiple sticky notes and a coffee cup nearby. Defocused plants and modern office/home office background. Daylight from a large window. She's dressed stylishly but exhausted — "burnout but still put-together" aesthetic.

COMPOSITION: Landscape format (16:9 ratio). Medium shot from chest up, slightly angled. Natural daylight, warm but slightly desaturated tones. Editorial quality.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "blog-l-theanine-calm",
    referenceImages: ["ingredients-flatlay.webp", "lifestyle-nightstand.webp"],
    prompt: `Generate a premium editorial still life photograph:

SCENE: A ceramic cup of green tea with gentle steam rising, placed on a minimalist wooden tabletop. Next to it: an open book, a small green plant in a ceramic pot. Zen/calm aesthetic. Soft morning light from a window creating warm highlights. Clean, minimal composition with intentional negative space. Sage green and warm wood tones.

COMPOSITION: Landscape format (16:9 ratio). Slightly elevated angle, focused on the tea cup. Shallow depth of field with blurred background. Calming, meditative mood.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "blog-menopause-wellness",
    referenceImages: ["lifestyle-morning-stretch.webp", "lifestyle-evening-mocktail.webp"],
    prompt: `Generate a premium lifestyle photograph:

SCENE: A woman (~45-50, European, light brown/grey hair) in a yoga or meditation pose on a yoga mat in a bright, airy room. She looks calm, confident, and radiant with glowing skin. Sunlight streams in through large windows. Green plants in the background. The space is minimal and serene. She wears comfortable activewear in neutral/sage tones.

COMPOSITION: Landscape format (16:9 ratio). Full body or 3/4 shot, centered. Bright morning light, warm tones. The mood is empowerment and calm confidence.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "blog-collagen-skin",
    referenceImages: ["lifestyle-evening-mocktail.webp", "lifestyle-relaxing-bath.webp"],
    prompt: `Generate a premium beauty editorial photograph:

SCENE: Close-up of a woman's face and shoulders (~30, European, brown hair). She has perfect, glowing, radiant skin and is gently applying a cream or serum to her cheek. She's looking in a round mirror with soft warm light. Minimal skincare products visible. The mood is a luxurious skincare routine moment. Soft pink and warm tones.

COMPOSITION: Landscape format (16:9 ratio). Close-up beauty shot. Shallow depth of field focused on the face. Soft, diffused lighting. Magazine-quality editorial.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "blog-ashwagandha-root",
    referenceImages: ["ingredients-flatlay.webp", "mocktail-ashwagandha-flatlay.webp"],
    prompt: `Generate a premium editorial still life photograph:

SCENE: A beautiful still life arrangement on white marble: raw ashwagandha roots and powder in a small ceramic bowl, surrounded by fresh green ashwagandha leaves. A few dried roots artistically placed. Subtle sage and earthy tones. Close-up macro detail showing the texture of the roots and powder. Soft diffused natural light from above.

COMPOSITION: Landscape format (16:9 ratio). Overhead/slightly angled macro shot. Editorial styled arrangement. Earthy tones with sage green accents. Clean, premium feel.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },

  // ─── Group D: Page hero images ───
  {
    name: "glow-guide-hero",
    referenceImages: ["lifestyle-evening-mocktail.webp", "lifestyle-relaxing-bath.webp"],
    prompt: `Generate a premium beauty/wellness lifestyle photograph:

SCENE: A woman (~30, European, brown hair) looking at herself in a round vanity mirror, smiling with genuine happiness. Her skin is glowing and radiant. She touches her cheek lightly. Soft pink and sage tones in the background. Warm golden light creates a glow effect around her. The mood is "discovering your best self" — confident, happy, radiant.

COMPOSITION: Landscape format (16:9 ratio). Medium close-up focused on the woman and mirror reflection. Soft focus background. Warm golden glow effect. Magazine-quality editorial.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "science-hero",
    referenceImages: ["ingredients-flatlay.webp", "product-sachet-marble.webp"],
    prompt: `Generate a premium editorial flat lay photograph:

SCENE: A creative "science meets nature" flat lay on white marble. Arranged artistically: glass test tubes/beakers with pink liquid extract, fresh ashwagandha roots, whole strawberries, small scientific notes/papers with handwriting, a magnifying glass, and scattered pink powder. The arrangement bridges laboratory science and natural ingredients. Clean, minimal white marble background.

COMPOSITION: Landscape format (16:9 ratio). Bird's eye / overhead perspective. Editorial styled arrangement with breathing room. Clean, scientific yet warm and inviting.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "za-nas-values",
    referenceImages: ["ingredients-flatlay.webp", "lifestyle-evening-mocktail.webp"],
    prompt: `Generate a premium editorial lifestyle photograph:

SCENE: Close-up of hands gently holding fresh herbs and flowers — ashwagandha leaves, lavender sprigs, small pink flowers. Warm golden light illuminating the botanicals from behind. Natural textures — linen fabric beneath, wooden surface visible. The concept is "from nature with care" — human hands tenderly cradling natural ingredients. Earthy, warm, authentic.

COMPOSITION: Landscape format (16:9 ratio). Close-up focused on the hands and botanicals. Shallow depth of field. Warm golden hour light. Intimate and caring mood.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  // ─── Group E: Author profile photos ───
  {
    name: "author-dr-maria",
    referenceImages: ["lifestyle-evening-mocktail.webp"],
    prompt: `Generate a professional headshot photograph:

SCENE: A Bulgarian woman doctor, ~40 years old, with dark brown hair pulled back neatly. She has warm brown eyes, a confident and friendly smile. She is wearing a clean white medical coat/lab coat. The background is softly blurred — a modern, light clinic or office with sage green and white tones. She looks approachable, professional, and trustworthy. Natural skin, minimal makeup.

COMPOSITION: Square format (1:1 ratio). Head and shoulders portrait, slightly angled. Soft natural light from left. Shallow depth of field. Professional headshot quality — clean, warm, editorial.

CRITICAL STYLE REQUIREMENTS:
- Realistic professional headshot — NOT stylized or illustration
- Natural skin texture, no heavy retouching
- Warm, approachable expression — NOT stiff or corporate
- Background: blurred sage green/white medical office
- Lighting: soft, flattering, natural
- NO text, logos, or watermarks
- The woman should look like a real Bulgarian endocrinologist`,
    width: 400,
    height: 400,
  },
  {
    name: "author-lura-team",
    referenceImages: ["lifestyle-sofa-mocktail.webp", "lifestyle-evening-mocktail.webp"],
    prompt: `Generate a professional group photo:

SCENE: Three young Bulgarian women (~28-35), diverse but all with warm, friendly smiles. They are standing close together in a bright, modern wellness office/studio. One has dark brown hair, one has light brown/auburn hair, one has darker hair. They wear casual-chic outfits in neutral/sage/blush tones. The background has plants, natural wood, and soft light. The mood is "passionate wellness team" — professional but warm and approachable.

COMPOSITION: Square format (1:1 ratio). Group portrait from chest up. Soft natural light. Clean, modern background. The three women are the clear focus.

CRITICAL STYLE REQUIREMENTS:
- Realistic professional team photo — NOT stylized
- Natural skin textures, genuine smiles
- Warm, inviting atmosphere
- Background: modern wellness office with plants
- Lighting: bright, soft, natural
- NO text, logos, or watermarks
- Bulgarian women — European features, warm Mediterranean coloring`,
    width: 400,
    height: 400,
  },

  // ═══════════════════════════════════════════════════════════════
  // Group F: New Product Photos (5 images) — Narrative prompts
  // ═══════════════════════════════════════════════════════════════
  {
    name: "product-bundle-1",
    referenceImages: ["product-hero-box.webp"],
    prompt: `A single Corti-Glow box standing upright on white marble, shot straight-on at eye level. Clean, minimal composition with generous negative space. The pink-to-sage gradient packaging is the hero. A single fresh strawberry sits to the right. Soft studio lighting from large overhead softbox, subtle rim light from behind creating a gentle edge glow. Shot at 85mm f/8. Professional e-commerce product photography. No text overlays.

${STYLE_DNA}`,
    width: 1200,
    height: 1200,
  },
  {
    name: "product-bundle-2",
    referenceImages: ["product-hero-box.webp"],
    prompt: `Two Corti-Glow boxes artfully arranged on white marble, one standing upright and one leaning against it at a slight angle. Pink-to-sage gradient packaging gleaming under a large overhead softbox. A scattered few dried rose petals and a sprig of lavender nearby. Shot at 85mm f/8, warm studio lighting around 4000K. Clean, editorial product photography with soft shadow beneath boxes. No text overlays.

${STYLE_DNA}`,
    width: 1200,
    height: 1200,
  },
  {
    name: "product-bundle-3",
    referenceImages: ["product-hero-box.webp"],
    prompt: `Three Corti-Glow boxes arranged in a cascading pyramid formation on white marble with subtle grey veins. The front box faces camera directly, two behind at angles showing the side panels. A fresh strawberry and lime wedge in the foreground, slightly out of focus. Warm three-point studio lighting with softbox key light at 45 degrees right. Shot at 50mm f/5.6 for balanced depth. Premium e-commerce aesthetic. No text overlays.

${STYLE_DNA}`,
    width: 1200,
    height: 1200,
  },
  {
    name: "product-sachet-open",
    referenceImages: ["product-sachet-marble.webp"],
    prompt: `Close-up of a single Corti-Glow sachet being torn open, with fine pink powder beginning to spill onto a white marble surface. The sachet shows the pink-to-sage gradient design clearly. Macro photography at 100mm f/4, selective focus on the tear point. Soft natural window light from the left, color temperature 5000K. A few scattered strawberry pieces and lime zest nearby. Dust particles of pink powder floating in the light beam. No text overlays.

${STYLE_DNA}`,
    width: 1200,
    height: 1200,
  },
  {
    name: "product-glass-ready",
    referenceImages: ["product-splash-pour.webp"],
    prompt: `A beautiful finished Corti-Glow mocktail in a tall clear glass with ice cubes, the liquid a translucent rosy pink. A fresh lime wheel garnish on the rim, condensation drops on the glass exterior. Shot from a low 30-degree angle at 50mm f/2.8, the background softly blurred showing a warm kitchen or living room. Golden hour light from a window creates a warm glow through the drink. The glass sits on a wooden coaster on a light marble countertop. No text overlays.

${STYLE_DNA}`,
    width: 1200,
    height: 1200,
  },
  {
    name: "product-hand-sachet",
    referenceImages: ["product-sachet-marble.webp"],
    prompt: `A woman's hand with minimal natural manicure holding a Corti-Glow sachet between thumb and fingers, about to tear it open over a glass of water. Shot at 85mm f/2.0, shallow depth of field focusing on the hand and sachet. Warm kitchen background completely blurred into soft bokeh. Morning light from left window, color temperature 5600K. The sachet gradient design is clearly visible. No text overlays.

${STYLE_DNA}`,
    width: 1200,
    height: 1200,
  },

  // ═══════════════════════════════════════════════════════════════
  // Group G: Lifestyle for BentoReviews (4 images)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "review-morning-glow",
    referenceImages: ["lifestyle-relaxing-bath.webp"],
    prompt: `Portrait of a woman around 30, European with brown hair, standing by a sunlit window in the morning, holding a glass with pink Corti-Glow drink. She smiles naturally with glowing, radiant skin. She wears a soft cream knit sweater. Morning golden light streams across her face creating warm highlights. Shot at 85mm f/1.8, creamy bokeh background of a bright apartment with green plants. Visible skin texture, natural warmth. No text overlays.

${STYLE_DNA}`,
    width: 960,
    height: 1200,
  },
  {
    name: "review-sleep-better",
    referenceImages: ["lifestyle-nightstand-ritual.webp"],
    prompt: `Overhead flat lay of a cozy bed scene: white linen sheets, a small ceramic cup of herbal tea, a Corti-Glow sachet placed on a linen napkin, a silk sleep mask in blush pink, and a sprig of lavender. Soft warm lamplight creating a golden glow. Shot from directly above at 35mm f/4. Evening ritual aesthetic, calm and inviting. No text overlays.

${STYLE_DNA}`,
    width: 960,
    height: 1200,
  },
  {
    name: "review-balance-pcos",
    referenceImages: ["lifestyle-relaxing-bath.webp"],
    prompt: `A woman around 30, European with dark hair, doing gentle yoga stretch in a bright minimalist room. She looks calm and centered, wearing sage-green activewear. Large window with sheer curtains letting in soft diffused morning light. A glass with pink drink sits on the floor beside her yoga mat. Shot at 50mm f/2.8, natural light photography, warm tones. The mood is balance and inner peace. No text overlays.

${STYLE_DNA}`,
    width: 960,
    height: 1200,
  },
  {
    name: "review-transformation",
    referenceImages: ["lifestyle-sofa-mocktail.webp"],
    prompt: `A woman around 35, European with light brown hair, laughing genuinely while holding a Corti-Glow box in a modern kitchen. She's standing at a marble island counter with fresh fruits and a glass of pink drink nearby. Natural daylight fills the space. Shot at 35mm f/2.0, environmental portrait style. The mood is genuine happiness and confidence. Candid, not posed. No text overlays.

${STYLE_DNA}`,
    width: 960,
    height: 1200,
  },

  // ═══════════════════════════════════════════════════════════════
  // Group H: Ingredient Photos (5 images)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "ingredients-ashwagandha",
    referenceImages: ["ingredients-flatlay.webp"],
    prompt: `Macro still life of ashwagandha root pieces and fine beige powder in a small handmade ceramic bowl, surrounded by fresh green ashwagandha leaves on a warm wooden surface. A glass beaker with pink liquid extract sits in the soft background. Shot at 100mm macro f/4, selective focus on the root texture. Soft diffused overhead light, earthy warm tones. Scientific yet natural and inviting. No text overlays.

${STYLE_DNA}`,
    width: 800,
    height: 800,
  },
  {
    name: "ingredients-magnesium",
    referenceImages: ["ingredients-flatlay.webp"],
    prompt: `Close-up of magnesium bisglycinate powder — fine white crystalline powder mounded on a dark slate surface with small green herb sprigs. A mortar and pestle blurred in the background. Shot at 100mm macro f/4, dramatic side lighting creating texture on the powder surface. Cool-to-warm color gradient, clinical yet premium. Soft natural light from left. No text overlays.

${STYLE_DNA}`,
    width: 800,
    height: 800,
  },
  {
    name: "ingredients-l-theanine",
    referenceImages: ["ingredients-flatlay.webp"],
    prompt: `Artistic close-up of fresh green tea leaves arranged on a light marble surface, with a small pile of fine green powder beside them. A traditional Japanese ceramic tea cup with matcha-green liquid sits nearby, steam gently rising. Shot at 100mm macro f/4, selective focus on the tea leaves showing their delicate veins. Soft natural side light creating gentle shadows. Zen, calming aesthetic with sage green and cream tones. No text overlays.

${STYLE_DNA}`,
    width: 800,
    height: 800,
  },
  {
    name: "ingredients-inositol",
    referenceImages: ["ingredients-flatlay.webp"],
    prompt: `Clean scientific still life: fine white inositol powder in a clear glass petri dish on white marble surface. Around it: sliced citrus fruits (lemon, orange), a few almonds, and green chickpea pods — natural sources of inositol. Shot at 100mm macro f/5.6 from slightly above. Bright, clean diffused overhead lighting, clinical yet warm. The mood is "science meets nutrition." No text overlays.

${STYLE_DNA}`,
    width: 800,
    height: 800,
  },
  {
    name: "ingredients-bromelain",
    referenceImages: ["ingredients-flatlay.webp"],
    prompt: `Vibrant macro still life of a fresh pineapple cross-section showing its golden flesh and fibrous core, placed on a wooden cutting board. Beside it: a small ceramic bowl of fine yellow-white bromelain enzyme powder. Fresh pineapple leaves frame the top. Shot at 100mm macro f/4, warm natural window light from the right. Tropical yet sophisticated — golden yellows with warm wood and cream tones. No text overlays.

${STYLE_DNA}`,
    width: 800,
    height: 800,
  },

  // ═══════════════════════════════════════════════════════════════
  // Group I: Homepage Section Images (3 images)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "glow-guide-cta",
    referenceImages: ["lifestyle-relaxing-bath.webp"],
    prompt: `A woman around 28, European with brown hair, looking at her phone screen with a curious, excited expression. She sits in a cozy corner of a cafe or living room with sage green and cream tones. The phone screen has a warm glow reflecting on her face. Shot at 50mm f/2.0, warm ambient light, shallow depth of field. The mood is "discovering something exciting about yourself." No text overlays.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
  {
    name: "results-timeline",
    referenceImages: ["lifestyle-stressed-woman.webp", "lifestyle-relaxing-bath.webp"],
    prompt: `Split-screen concept: left side shows a tired, stressed woman (slightly muted, cool-toned), right side shows the same woman radiant and smiling (warm-toned, glowing). A subtle gradient transition between the two halves. Editorial beauty photography, both shots at 85mm f/2.8. The "before" is soft morning light, the "after" is golden hour warmth. Minimal makeup in both, the difference is energy and radiance. No text overlays.

${STYLE_DNA}`,
    width: 1200,
    height: 675,
  },
];

// ─── Helper: Read reference image as base64 ───
function readReferenceImage(filename) {
  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  Warning: Reference image not found: ${filename}`);
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  const mimeType =
    ext === ".webp"
      ? "image/webp"
      : ext === ".png"
        ? "image/png"
        : "image/jpeg";
  return {
    type: "image_url",
    image_url: {
      url: `data:${mimeType};base64,${buffer.toString("base64")}`,
    },
  };
}

// ─── Generate a single image ───
async function generateImage(imageConfig, index, total) {
  const { name, referenceImages, prompt, width, height } = imageConfig;
  const outputPath = path.join(IMAGES_DIR, `${name}.webp`);

  // Skip if already generated
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size > 10000) {
      console.log(
        `\n[${index + 1}/${total}] SKIP: ${name}.webp already exists (${(stats.size / 1024).toFixed(0)} KB)`
      );
      return { name, status: "skipped" };
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`[${index + 1}/${total}] Generating: ${name}.webp`);
  console.log(`  Target: ${width}x${height}`);
  console.log(`  References: ${referenceImages.join(", ")}`);
  console.log(`${"=".repeat(60)}`);

  // Build message content with reference images + prompt
  const content = [];

  for (const refImg of referenceImages) {
    const imageData = readReferenceImage(refImg);
    if (imageData) {
      content.push(imageData);
      console.log(`  Loaded reference: ${refImg}`);
    }
  }

  content.push({
    type: "text",
    text: `Using the reference images above as style guide, generate the following new image. Match the visual quality, color palette, and aesthetic exactly.\n\n${prompt}`,
  });

  try {
    console.log(`  Calling OpenRouter API (${MODEL})...`);
    const startTime = Date.now();

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://luralab.eu",
          "X-Title": "LuraLab Image Generation",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "user",
              content,
            },
          ],
          modalities: ["image", "text"],
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  API response received in ${elapsed}s`);

    // Extract image from response
    let imageBase64 = null;

    // Method 1: Check images array (OpenRouter format)
    if (data.choices?.[0]?.message?.images?.length > 0) {
      const imgUrl = data.choices[0].message.images[0].image_url?.url;
      if (imgUrl) {
        const match = imgUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (match) imageBase64 = match[1];
      }
    }

    // Method 2: Check content array for inline images
    if (!imageBase64) {
      const msgContent = data.choices?.[0]?.message?.content;
      if (Array.isArray(msgContent)) {
        for (const part of msgContent) {
          if (
            part.type === "image_url" &&
            part.image_url?.url?.startsWith("data:image")
          ) {
            const match = part.image_url.url.match(
              /^data:image\/[^;]+;base64,(.+)$/
            );
            if (match) {
              imageBase64 = match[1];
              break;
            }
          }
        }
      } else if (typeof msgContent === "string") {
        // Method 3: Check if base64 is embedded in text content
        const match = msgContent.match(
          /data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/
        );
        if (match) imageBase64 = match[1];
      }
    }

    if (!imageBase64) {
      console.error(`  ERROR: No image found in response`);
      console.error(
        `  Response structure:`,
        JSON.stringify(data, null, 2).substring(0, 500)
      );
      return { name, status: "error", error: "No image in response" };
    }

    // Convert to WebP and save
    const pngBuffer = Buffer.from(imageBase64, "base64");
    console.log(`  Raw image: ${(pngBuffer.length / 1024).toFixed(0)} KB`);

    const webpBuffer = await sharp(pngBuffer)
      .resize(width, height, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();

    fs.writeFileSync(outputPath, webpBuffer);
    const finalSize = (webpBuffer.length / 1024).toFixed(0);
    console.log(`  Saved: ${name}.webp (${finalSize} KB)`);

    if (webpBuffer.length > 200 * 1024) {
      console.warn(`  Warning: File exceeds 200KB target, recompressing...`);
      const smallerBuffer = await sharp(pngBuffer)
        .resize(width, height, { fit: "cover" })
        .webp({ quality: 65 })
        .toBuffer();
      fs.writeFileSync(outputPath, smallerBuffer);
      console.log(
        `  Recompressed: ${(smallerBuffer.length / 1024).toFixed(0)} KB`
      );
    }

    return { name, status: "success", size: finalSize + " KB" };
  } catch (error) {
    console.error(`  ERROR generating ${name}:`, error.message);
    return { name, status: "error", error: error.message };
  }
}

// ─── Main ───
async function main() {
  console.log("LuraLab Image Generation Script");
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${IMAGES_DIR}`);
  console.log(`Images to generate: ${IMAGES_TO_GENERATE.length}`);
  console.log();

  // Verify reference images exist
  const allRefs = [
    ...new Set(IMAGES_TO_GENERATE.flatMap((img) => img.referenceImages)),
  ];
  console.log("Checking reference images:");
  for (const ref of allRefs) {
    const exists = fs.existsSync(path.join(IMAGES_DIR, ref));
    console.log(`  ${exists ? "OK" : "MISSING"}: ${ref}`);
  }

  // Generate images sequentially (to avoid rate limits)
  const results = [];
  for (let i = 0; i < IMAGES_TO_GENERATE.length; i++) {
    const result = await generateImage(
      IMAGES_TO_GENERATE[i],
      i,
      IMAGES_TO_GENERATE.length
    );
    results.push(result);

    // Wait 2s between API calls to avoid rate limiting
    if (
      i < IMAGES_TO_GENERATE.length - 1 &&
      result.status !== "skipped"
    ) {
      console.log("  Waiting 2s before next generation...");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("SUMMARY");
  console.log(`${"=".repeat(60)}`);
  for (const r of results) {
    const icon =
      r.status === "success"
        ? "OK"
        : r.status === "skipped"
          ? "SKIP"
          : "FAIL";
    console.log(
      `  [${icon}] ${r.name}${r.size ? ` (${r.size})` : ""}${r.error ? ` - ${r.error}` : ""}`
    );
  }

  const succeeded = results.filter((r) => r.status === "success").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "error").length;
  console.log(`\nTotal: ${succeeded} generated, ${skipped} skipped, ${failed} failed`);
}

main().catch(console.error);
