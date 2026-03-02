from playwright.sync_api import sync_playwright
import json
import os

SCREENSHOTS_DIR = os.path.dirname(os.path.abspath(__file__))

def audit():
    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch()

        # ============================================================
        # 1. MOBILE HOMEPAGE (390x844)
        # ============================================================
        print("=== Mobile Homepage (390x844) ===")
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.goto('https://luralab.eu', wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(2000)

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '01_mobile_homepage_above_fold.png'), full_page=False)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '02_mobile_homepage_full.png'), full_page=True)

        mobile_home_data = page.evaluate('''() => {
            const h1 = document.querySelector('h1');
            const h2s = document.querySelectorAll('h2');
            const metaDesc = document.querySelector('meta[name="description"]');
            const metaTitle = document.querySelector('title');
            const canonical = document.querySelector('link[rel="canonical"]');
            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogDesc = document.querySelector('meta[property="og:description"]');
            const ogImage = document.querySelector('meta[property="og:image"]');

            const hasHorizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

            const buttons = Array.from(document.querySelectorAll('button, a[href]'));
            const ctaButtons = buttons.filter(b => {
                const text = b.textContent.trim().toLowerCase();
                return text.includes('купи') || text.includes('поръч') || text.includes('добав')
                    || text.includes('вижте') || text.includes('виж') || text.includes('shop')
                    || text.includes('buy') || text.includes('разбер');
            }).map(b => ({
                tag: b.tagName,
                text: b.textContent.trim().substring(0, 80),
                href: b.href || null,
                rect: {
                    top: Math.round(b.getBoundingClientRect().top),
                    left: Math.round(b.getBoundingClientRect().left),
                    width: Math.round(b.getBoundingClientRect().width),
                    height: Math.round(b.getBoundingClientRect().height)
                },
                visible: b.getBoundingClientRect().top < 844
            }));

            const allClickable = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
            const smallTargets = allClickable.filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
            }).map(el => ({
                tag: el.tagName,
                text: el.textContent.trim().substring(0, 40),
                width: Math.round(el.getBoundingClientRect().width),
                height: Math.round(el.getBoundingClientRect().height)
            }));

            const bodyFontSize = window.getComputedStyle(document.body).fontSize;

            return {
                title: metaTitle ? metaTitle.textContent : null,
                metaDescription: metaDesc ? metaDesc.content : null,
                canonical: canonical ? canonical.href : null,
                ogTitle: ogTitle ? ogTitle.content : null,
                ogDescription: ogDesc ? ogDesc.content : null,
                ogImage: ogImage ? ogImage.content : null,
                h1: h1 ? { text: h1.textContent.trim(), rect: {
                    top: Math.round(h1.getBoundingClientRect().top),
                    left: Math.round(h1.getBoundingClientRect().left),
                    width: Math.round(h1.getBoundingClientRect().width),
                    height: Math.round(h1.getBoundingClientRect().height)
                }, visible: h1.getBoundingClientRect().top < 844 } : null,
                h2Count: h2s.length,
                h2Texts: Array.from(h2s).map(h => h.textContent.trim().substring(0, 80)),
                hasHorizontalOverflow,
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                ctaButtons,
                smallTargetsCount: smallTargets.length,
                smallTargetsSample: smallTargets.slice(0, 10),
                bodyFontSize
            };
        }''')
        results['mobile_homepage'] = mobile_home_data
        print(json.dumps(mobile_home_data, indent=2, ensure_ascii=False))
        page.close()

        # ============================================================
        # 2. MOBILE PRODUCT PAGE (390x844)
        # ============================================================
        print("\n=== Mobile Product Page (390x844) ===")
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.goto('https://luralab.eu/produkt', wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(2000)

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '03_mobile_product_above_fold.png'), full_page=False)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '04_mobile_product_full.png'), full_page=True)

        mobile_product_data = page.evaluate('''() => {
            const h1 = document.querySelector('h1');
            const buttons = Array.from(document.querySelectorAll('button, a[href]'));

            const buyButtons = buttons.filter(b => {
                const text = b.textContent.trim().toLowerCase();
                return text.includes('купи') || text.includes('поръч') || text.includes('добав')
                    || text.includes('кошница') || text.includes('buy') || text.includes('cart');
            }).map(b => ({
                text: b.textContent.trim().substring(0, 80),
                rect: {
                    top: Math.round(b.getBoundingClientRect().top),
                    left: Math.round(b.getBoundingClientRect().left),
                    width: Math.round(b.getBoundingClientRect().width),
                    height: Math.round(b.getBoundingClientRect().height)
                },
                visible: b.getBoundingClientRect().top < 844,
                width: Math.round(b.getBoundingClientRect().width),
                height: Math.round(b.getBoundingClientRect().height)
            }));

            const allText = document.body.innerText;
            const priceMatch = allText.match(/\\d+[.,]\\d{2}\\s*(лв|BGN|EUR|€)/);

            const images = Array.from(document.querySelectorAll('img'));
            const productImages = images.filter(img => {
                const rect = img.getBoundingClientRect();
                return rect.width > 100 && rect.height > 100;
            }).map(img => ({
                src: img.src.substring(0, 100),
                alt: img.alt,
                width: Math.round(img.getBoundingClientRect().width),
                height: Math.round(img.getBoundingClientRect().height),
                visible: img.getBoundingClientRect().top < 844
            }));

            const hasHorizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

            return {
                h1: h1 ? { text: h1.textContent.trim(), visible: h1.getBoundingClientRect().top < 844 } : null,
                buyButtons,
                priceFound: priceMatch ? priceMatch[0] : null,
                productImages,
                hasHorizontalOverflow,
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth
            };
        }''')
        results['mobile_product'] = mobile_product_data
        print(json.dumps(mobile_product_data, indent=2, ensure_ascii=False))
        page.close()

        # ============================================================
        # 3. DESKTOP HOMEPAGE (1440x900)
        # ============================================================
        print("\n=== Desktop Homepage (1440x900) ===")
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.goto('https://luralab.eu', wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(2000)

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '05_desktop_homepage_above_fold.png'), full_page=False)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '06_desktop_homepage_full.png'), full_page=True)

        desktop_home_data = page.evaluate('''() => {
            const h1 = document.querySelector('h1');
            const buttons = Array.from(document.querySelectorAll('button, a[href]'));
            const ctaButtons = buttons.filter(b => {
                const text = b.textContent.trim().toLowerCase();
                return text.includes('купи') || text.includes('поръч') || text.includes('добав')
                    || text.includes('вижте') || text.includes('виж') || text.includes('shop')
                    || text.includes('buy') || text.includes('разбер');
            }).map(b => ({
                text: b.textContent.trim().substring(0, 80),
                rect: {
                    top: Math.round(b.getBoundingClientRect().top),
                    left: Math.round(b.getBoundingClientRect().left),
                    width: Math.round(b.getBoundingClientRect().width),
                    height: Math.round(b.getBoundingClientRect().height)
                },
                visible: b.getBoundingClientRect().top < 900
            }));

            const navLinks = Array.from(document.querySelectorAll('nav a, header a')).map(a => ({
                text: a.textContent.trim(),
                href: a.href
            }));

            return {
                h1: h1 ? { text: h1.textContent.trim(), rect: {
                    top: Math.round(h1.getBoundingClientRect().top),
                    width: Math.round(h1.getBoundingClientRect().width),
                    height: Math.round(h1.getBoundingClientRect().height)
                }, visible: h1.getBoundingClientRect().top < 900 } : null,
                ctaButtons,
                navLinks: navLinks.slice(0, 15),
                hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
            };
        }''')
        results['desktop_homepage'] = desktop_home_data
        print(json.dumps(desktop_home_data, indent=2, ensure_ascii=False))
        page.close()

        # ============================================================
        # 4. DESKTOP PRODUCT PAGE (1440x900)
        # ============================================================
        print("\n=== Desktop Product Page (1440x900) ===")
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.goto('https://luralab.eu/produkt', wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(2000)

        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '07_desktop_product_above_fold.png'), full_page=False)
        page.screenshot(path=os.path.join(SCREENSHOTS_DIR, '08_desktop_product_full.png'), full_page=True)

        desktop_product_data = page.evaluate('''() => {
            const h1 = document.querySelector('h1');
            const buttons = Array.from(document.querySelectorAll('button, a[href]'));
            const buyButtons = buttons.filter(b => {
                const text = b.textContent.trim().toLowerCase();
                return text.includes('купи') || text.includes('поръч') || text.includes('добав')
                    || text.includes('кошница') || text.includes('buy') || text.includes('cart');
            }).map(b => ({
                text: b.textContent.trim().substring(0, 80),
                rect: {
                    top: Math.round(b.getBoundingClientRect().top),
                    left: Math.round(b.getBoundingClientRect().left),
                    width: Math.round(b.getBoundingClientRect().width),
                    height: Math.round(b.getBoundingClientRect().height)
                },
                visible: b.getBoundingClientRect().top < 900,
                width: Math.round(b.getBoundingClientRect().width),
                height: Math.round(b.getBoundingClientRect().height)
            }));

            return {
                h1: h1 ? { text: h1.textContent.trim(), visible: h1.getBoundingClientRect().top < 900 } : null,
                buyButtons,
                hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
            };
        }''')
        results['desktop_product'] = desktop_product_data
        print(json.dumps(desktop_product_data, indent=2, ensure_ascii=False))
        page.close()

        # ============================================================
        # 5. SEO CHECKS
        # ============================================================
        print("\n=== SEO Checks ===")
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.goto('https://luralab.eu', wait_until='networkidle', timeout=30000)

        seo_data = page.evaluate('''() => {
            const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
                try { return JSON.parse(s.textContent); } catch { return null; }
            }).filter(Boolean);

            const images = Array.from(document.querySelectorAll('img'));
            const imgAudit = images.map(img => ({
                src: img.src.substring(0, 80),
                alt: img.alt || '[MISSING]',
                loading: img.loading || 'eager',
                hasExplicitDimensions: img.hasAttribute('width') && img.hasAttribute('height')
            }));

            const headings = [];
            for (let i = 1; i <= 6; i++) {
                const hs = document.querySelectorAll('h' + i);
                hs.forEach(h => headings.push({ level: i, text: h.textContent.trim().substring(0, 80) }));
            }

            const lang = document.documentElement.lang;
            const viewportMeta = document.querySelector('meta[name="viewport"]');

            return {
                jsonLd,
                imgAudit: imgAudit.slice(0, 20),
                missingAlt: imgAudit.filter(i => i.alt === '[MISSING]').length,
                totalImages: images.length,
                headings,
                lang,
                viewportMeta: viewportMeta ? viewportMeta.content : null
            };
        }''')
        results['seo_checks'] = seo_data
        print(json.dumps(seo_data, indent=2, ensure_ascii=False))
        page.close()

        browser.close()

    with open(os.path.join(SCREENSHOTS_DIR, 'audit_results.json'), 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)

    print("\n=== Audit Complete ===")

if __name__ == '__main__':
    audit()
