---
name: mobile-audit
description: Audit a page/component for 2026 mobile UI/UX standards (390px viewport) - typography, spacing, touch targets, overflow, content density
argument-hint: [page or component path - e.g. "src/components/science/InteractiveSciencePage.tsx" or "/nauka"]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npx:*), mcp__plugin_playwright_playwright__*
---

# Mobile Audit (2026 Standards)

Target: **$ARGUMENTS**

## 2026 Mobile Standards Reference (390px viewport)

### Typography Scale
| Element | Max mobile size | Tailwind class | Notes |
|---------|----------------|----------------|-------|
| H1 | 28-32px | text-3xl | Never above text-4xl on mobile |
| H2 | 24-28px | text-2xl | Scale up at md: breakpoint |
| H3 | 20-22px | text-xl | |
| Body | 16px | text-base | Default, never smaller |
| Small/Caption | 14px | text-sm | Minimum readable size |
| Micro | 12px | text-xs | Only for labels/badges |

### Spacing Standards
| Element | Mobile range | Tailwind | Notes |
|---------|-------------|----------|-------|
| Section padding (y) | 32-48px | py-8 to py-12 | Scale up at md: |
| Section margin | 48-64px | mb-12 to mb-16 | Scale up at md: |
| Content gap | 16-24px | gap-4 to gap-6 | Scale up at lg: |
| Card padding | 16-20px | p-4 to p-5 | |
| Container padding (x) | 16-24px | px-4 to px-6 | |

### Touch Targets
- Minimum: 44x44px (WCAG 2.5.8)
- Recommended: 48x48px
- Spacing between targets: 8px minimum

### Content Density
- Max line width: 65-75 characters (~ch units)
- Line height: 1.5-1.75 for body text
- Paragraph spacing: 16-24px

---

## Audit Checklist

### Step 1: Read the Component
Read the target file and identify all:
- [ ] Typography classes (text-*xl, text-lg, text-base, etc.)
- [ ] Spacing classes (py-*, mb-*, gap-*, p-*)
- [ ] Container widths and padding
- [ ] Responsive breakpoints used (sm:, md:, lg:)

### Step 2: Typography Audit
For each heading and text element:
- [ ] H1 is `text-3xl` or smaller on mobile (scales up at md:)
- [ ] H2 is `text-2xl` or smaller on mobile (scales up at md:)
- [ ] H3 is `text-xl` or smaller on mobile
- [ ] Body text is `text-base` (16px) minimum
- [ ] No text smaller than `text-xs` (12px)
- [ ] Font weights are appropriate (not too thin on small screens)

### Step 3: Spacing Audit
For each section/container:
- [ ] Section vertical padding: py-8 to py-12 on mobile
- [ ] Section margins: mb-12 to mb-16 on mobile
- [ ] Content gaps scale down on mobile (gap-4 to gap-8)
- [ ] No excessive whitespace eating viewport on mobile
- [ ] Compact but breathable feel

### Step 4: Layout Audit
- [ ] No horizontal overflow at 390px (check for fixed widths)
- [ ] Flex layouts wrap properly (`flex-wrap` where needed)
- [ ] Grid layouts collapse to 1 column on mobile
- [ ] Images are responsive (w-full, aspect-ratio)
- [ ] Tables scroll horizontally or convert to cards
- [ ] No elements with hardcoded px widths > 390px

### Step 5: Touch Target Audit
- [ ] All buttons are min 44x44px (py-3 px-6 or equivalent)
- [ ] All links have adequate tap area
- [ ] Interactive elements have 8px+ spacing between them
- [ ] Form inputs are min 44px tall

### Step 6: Chart/Data Visualization Audit
- [ ] Chart legends wrap on mobile (`flex-wrap`)
- [ ] Legend text is readable (text-xs sm:text-sm)
- [ ] Chart SVGs use viewBox for responsive scaling
- [ ] Tooltips don't overflow viewport
- [ ] Data labels are readable at 390px

### Step 7: Content Density Audit
- [ ] Text lines don't exceed 75 characters on mobile
- [ ] Cards don't have too much padding (p-4 to p-5 max)
- [ ] Lists have adequate spacing
- [ ] Images have appropriate aspect ratios for mobile

---

## Verification with Playwright

After identifying and fixing issues, verify at 390x844 (iPhone 14):

```
1. Navigate to the target page
2. Resize browser to 390x844
3. Take full-page screenshot
4. Check for horizontal scrollbar (document.documentElement.scrollWidth > 390)
5. Scroll through all sections
6. Screenshot each section
7. Verify no overflow, readable text, adequate spacing
```

Use Playwright commands:
- `browser_resize` to 390x844
- `browser_navigate` to the page
- `browser_take_screenshot` with fullPage: true
- `browser_evaluate` to check `document.documentElement.scrollWidth`

---

## Output Format

For each finding:
- **Severity**: Critical / Warning / Info
- **Element**: What element has the issue
- **Current**: Current Tailwind classes
- **Fix**: Recommended Tailwind classes
- **Line**: File and line number
- **Standard**: Which 2026 standard it violates

### Summary Table
| # | Severity | Element | Issue | Fix |
|---|----------|---------|-------|-----|
| 1 | Critical | H1 | text-4xl on mobile | text-3xl md:text-4xl |
| ... | ... | ... | ... | ... |
