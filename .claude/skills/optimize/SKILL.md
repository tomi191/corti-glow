---
name: optimize
description: Analyze and optimize performance - Core Web Vitals, bundle size, rendering, caching, images, fonts
argument-hint: [area - "bundle", "images", "rendering", "caching", "full"]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npm run build:*), Bash(npx:*)
---

# Performance Optimization

Focus area: **$ARGUMENTS**

## 1. Build Analysis

Run `npm run build` and analyze the output:
- Check page sizes (target: < 200KB gzipped per page)
- Identify large chunks
- Look for pages that could be static but are dynamic

## 2. Client vs Server Component Audit

Search for `"use client"` directives:
```
Grep for: "use client"
```

For each client component, verify it NEEDS to be client-side:
- Does it use `useState` / `useEffect`? → Must be client
- Does it use event handlers (onClick, onChange)? → Must be client
- Does it only display data? → Should be server component
- Can the interactive part be extracted to a smaller client component?

**Goal**: Keep client components as small as possible, push data fetching to server components.

## 3. Image Optimization

Search for image usage:
```
Grep for: <img|<Image|src=.*\.(png|jpg|jpeg|webp|svg)
```

Check:
- [ ] ALL images use `next/image` (never raw `<img>`)
- [ ] Above-fold images have `priority={true}`
- [ ] Images have explicit `width` and `height`
- [ ] Large images use `placeholder="blur"`
- [ ] Product images properly sized (not 4000px originals)
- [ ] SVGs used for icons/logos (not PNG)

## 4. Bundle Size

Check `package.json` for heavy dependencies:
- `three` / `@react-three/*` → Only load via `dynamic()` with `ssr: false`
- `framer-motion` → Consider `LazyMotion` for code splitting
- `lenis` → Load only on pages that need smooth scroll

```typescript
// Good: Dynamic import for heavy libs
const ThreeScene = dynamic(() => import('./ThreeScene'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

## 5. Caching Strategy

Check data fetching patterns:
- [ ] Static pages use `export const revalidate = 3600` (ISR)
- [ ] Product data cached appropriately
- [ ] Econt city/office data cached in database (not fetched every request)
- [ ] API responses include proper cache headers

## 6. Font Loading

Check `src/app/layout.tsx`:
- [ ] Fonts loaded via `next/font` (not external CSS)
- [ ] `display: 'swap'` set for web fonts
- [ ] Only needed font weights loaded
- [ ] Font files preloaded

## 7. Third-Party Scripts

Check for analytics/tracking:
- [ ] Scripts loaded with `next/script` strategy="lazyOnload"
- [ ] No render-blocking external scripts
- [ ] Google Analytics uses gtag with proper loading

## 8. Rendering Patterns

Check pages in `src/app/`:
- [ ] Static pages are actually static (no `cookies()`, `headers()` calls)
- [ ] Dynamic pages use Suspense boundaries for streaming
- [ ] Loading states (`loading.tsx`) exist for slow pages
- [ ] Error boundaries (`error.tsx`) handle failures gracefully

## Output Format:
For each finding:
- **Impact**: High / Medium / Low
- **Current**: What's happening now
- **Recommended**: What should change
- **Files**: Which files to modify
- **Estimated improvement**: What metric improves (LCP, FID, CLS, bundle size)
