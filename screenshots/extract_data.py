from playwright.sync_api import sync_playwright
import json
import os
import sys

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8')

SCREENSHOTS_DIR = os.path.dirname(os.path.abspath(__file__))

def extract():
    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch()

        # Mobile Homepage
        print("--- Mobile Homepage ---")
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.goto('https://luralab.eu', wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(1500)

        results['mobile_home'] = page.evaluate('''() => {
            const h1 = document.querySelector('h1');
            const metaDesc = document.querySelector('meta[name="description"]');
            const title = document.querySelector('title');
            const canonical = document.querySelector('link[rel="canonical"]');
            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogDesc = document.querySelector('meta[property="og:description"]');
            const ogImage = document.querySelector('meta[property="og:image"]');
            const lang = document.documentElement.lang;
            const viewportMeta = document.querySelector('meta[name="viewport"]');

            const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
                try { return JSON.parse(s.textContent); } catch { return null; }
            }).filter(Boolean);

            const buttons = Array.from(document.querySelectorAll('button, a[href]'));
            const ctaButtons = buttons.filter(b => {
                const text = b.textContent.trim().toLowerCase();
                return text.includes('купи') || text.includes('поръч') || text.includes('добав')
                    || text.includes('вижте') || text.includes('виж') || text.includes('shop')
                    || text.includes('buy') || text.includes('разбер');
            }).map(b => ({
                tag: b.tagName, text: b.textContent.trim().replace(/[^\x00-\x7F\u0400-\u04FF\u20AC]/g, '').substring(0, 80),
                top: Math.round(b.getBoundingClientRect().top),
                width: Math.round(b.getBoundingClientRect().width),
                height: Math.round(b.getBoundingClientRect().height),
                aboveFold: b.getBoundingClientRect().top < 844
            }));

            const allClickable = Array.from(document.querySelectorAll('button, a, input, select, textarea'));
            const smallTargets = allClickable.filter(el => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
            }).map(el => ({
                tag: el.tagName, text: el.textContent.trim().replace(/[^\x00-\x7F\u0400-\u04FF\u20AC]/g, '').substring(0, 40),
                w: Math.round(el.getBoundingClientRect().width),
                h: Math.round(el.getBoundingClientRect().height)
            }));

            const headings = [];
            for (let i = 1; i <= 3; i++) {
                document.querySelectorAll('h' + i).forEach(h =>
                    headings.push({ level: i, text: h.textContent.trim().replace(/[^\x00-\x7F\u0400-\u04FF\u20AC]/g, '').substring(0, 80) })
                );
            }

            const images = Array.from(document.querySelectorAll('img'));

            return {
                title: title ? title.textContent : null,
                metaDescription: metaDesc ? metaDesc.content : null,
                canonical: canonical ? canonical.href : null,
                ogTitle: ogTitle ? ogTitle.content : null,
                ogDesc: ogDesc ? ogDesc.content : null,
                ogImage: ogImage ? ogImage.content : null,
                lang,
                viewportMeta: viewportMeta ? viewportMeta.content : null,
                jsonLdCount: jsonLd.length,
                jsonLdTypes: jsonLd.map(j => j['@type'] || 'unknown'),
                h1: h1 ? { text: h1.textContent.trim(), top: Math.round(h1.getBoundingClientRect().top), aboveFold: h1.getBoundingClientRect().top < 844 } : null,
                headings,
                hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                ctaButtons,
                smallTargetsCount: smallTargets.length,
                smallTargetsSample: smallTargets.slice(0, 8),
                totalImages: images.length,
                missingAlt: images.filter(i => !i.alt || i.alt.trim() === '').length
            };
        }''')
        print(json.dumps(results['mobile_home'], indent=2, ensure_ascii=False))
        page.close()

        # Mobile Product
        print("\n--- Mobile Product ---")
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.goto('https://luralab.eu/produkt', wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(1500)

        results['mobile_product'] = page.evaluate('''() => {
            const h1 = document.querySelector('h1');
            const buttons = Array.from(document.querySelectorAll('button, a[href]'));
            const buyButtons = buttons.filter(b => {
                const text = b.textContent.trim().toLowerCase();
                return text.includes('купи') || text.includes('поръч') || text.includes('добав')
                    || text.includes('кошница') || text.includes('buy') || text.includes('cart');
            }).map(b => ({
                text: b.textContent.trim().replace(/[^\x00-\x7F\u0400-\u04FF\u20AC]/g, '').substring(0, 80),
                top: Math.round(b.getBoundingClientRect().top),
                w: Math.round(b.getBoundingClientRect().width),
                h: Math.round(b.getBoundingClientRect().height),
                aboveFold: b.getBoundingClientRect().top < 844
            }));

            const images = Array.from(document.querySelectorAll('img')).filter(i => {
                const r = i.getBoundingClientRect();
                return r.width > 80 && r.height > 80;
            }).map(i => ({
                alt: i.alt || '[MISSING]',
                w: Math.round(i.getBoundingClientRect().width),
                h: Math.round(i.getBoundingClientRect().height),
                aboveFold: i.getBoundingClientRect().top < 844
            }));

            return {
                h1: h1 ? { text: h1.textContent.trim(), top: Math.round(h1.getBoundingClientRect().top), aboveFold: h1.getBoundingClientRect().top < 844 } : null,
                buyButtons,
                productImages: images,
                hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth
            };
        }''')
        print(json.dumps(results['mobile_product'], indent=2, ensure_ascii=False))
        page.close()

        # Desktop Homepage
        print("\n--- Desktop Homepage ---")
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.goto('https://luralab.eu', wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(1500)

        results['desktop_home'] = page.evaluate('''() => {
            const h1 = document.querySelector('h1');
            const buttons = Array.from(document.querySelectorAll('button, a[href]'));
            const ctaButtons = buttons.filter(b => {
                const text = b.textContent.trim().toLowerCase();
                return text.includes('купи') || text.includes('поръч') || text.includes('добав')
                    || text.includes('вижте') || text.includes('виж') || text.includes('shop')
                    || text.includes('buy') || text.includes('разбер');
            }).map(b => ({
                text: b.textContent.trim().replace(/[^\x00-\x7F\u0400-\u04FF\u20AC]/g, '').substring(0, 80),
                top: Math.round(b.getBoundingClientRect().top),
                w: Math.round(b.getBoundingClientRect().width),
                h: Math.round(b.getBoundingClientRect().height),
                aboveFold: b.getBoundingClientRect().top < 900
            }));

            const navLinks = Array.from(document.querySelectorAll('nav a, header a')).map(a => ({
                text: a.textContent.trim(), href: a.href
            }));

            return {
                h1: h1 ? { text: h1.textContent.trim(), top: Math.round(h1.getBoundingClientRect().top), aboveFold: h1.getBoundingClientRect().top < 900 } : null,
                ctaButtons,
                navLinks: navLinks.slice(0, 15),
                hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
            };
        }''')
        print(json.dumps(results['desktop_home'], indent=2, ensure_ascii=False))
        page.close()

        browser.close()

    with open(os.path.join(SCREENSHOTS_DIR, 'audit_results.json'), 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    print("\nDone. Results saved.")

if __name__ == '__main__':
    extract()
