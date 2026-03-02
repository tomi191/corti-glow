import sys, os, json

DIR = "Z:/Supplements MONEY MAKER/luralab-next/screenshots"
OUT = os.path.join(DIR, 'audit_results.json')

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()

    # Mobile Homepage
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://luralab.eu', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(1000)

    data = page.evaluate('''() => {
        const h1 = document.querySelector('h1');
        const metaDesc = document.querySelector('meta[name="description"]');
        const title = document.querySelector('title');
        const ogImage = document.querySelector('meta[property="og:image"]');
        const lang = document.documentElement.lang;
        const vp = document.querySelector('meta[name="viewport"]');

        const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
            try { return JSON.parse(s.textContent); } catch { return null; }
        }).filter(Boolean);

        const btns = Array.from(document.querySelectorAll('button, a[href]'));
        const ctas = btns.filter(b => {
            const t = (b.textContent || '').trim().toLowerCase();
            return t.includes('поръч') || t.includes('купи') || t.includes('добав') || t.includes('виж') || t.includes('разбер');
        }).map(b => {
            const r = b.getBoundingClientRect();
            return {
                text: (b.textContent || '').trim().replace(/[^a-zA-Z0-9\\s\\u0400-\\u04FF.,€-]/g, '').substring(0, 60),
                top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
                fold: r.top < 844
            };
        });

        const clickable = Array.from(document.querySelectorAll('button, a, input'));
        const small = clickable.filter(el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
        }).length;

        const headings = [];
        for (let i = 1; i <= 3; i++) {
            document.querySelectorAll('h' + i).forEach(h => {
                headings.push({l: i, t: (h.textContent || '').trim().substring(0, 60)});
            });
        }

        const imgs = Array.from(document.querySelectorAll('img'));

        return {
            title: title ? title.textContent : null,
            desc: metaDesc ? metaDesc.content : null,
            ogImage: ogImage ? ogImage.content : null,
            lang: lang,
            viewport: vp ? vp.content : null,
            jsonLdTypes: jsonLd.map(j => j['@type'] || '?'),
            h1text: h1 ? h1.textContent.trim() : null,
            h1top: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
            headings: headings,
            ctas: ctas,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            scrollW: document.documentElement.scrollWidth,
            clientW: document.documentElement.clientWidth,
            smallTargets: small,
            totalImgs: imgs.length,
            noAlt: imgs.filter(i => !i.alt).length
        };
    }''')
    page.close()

    # Mobile Product
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://luralab.eu/produkt', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(1000)

    data2 = page.evaluate('''() => {
        const h1 = document.querySelector('h1');
        const btns = Array.from(document.querySelectorAll('button, a[href]'));
        const buy = btns.filter(b => {
            const t = (b.textContent || '').trim().toLowerCase();
            return t.includes('поръч') || t.includes('купи') || t.includes('добав') || t.includes('кошница');
        }).map(b => {
            const r = b.getBoundingClientRect();
            return {
                text: (b.textContent || '').trim().replace(/[^a-zA-Z0-9\\s\\u0400-\\u04FF.,€-]/g, '').substring(0, 60),
                top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
                fold: r.top < 844
            };
        });
        return {
            h1text: h1 ? h1.textContent.trim() : null,
            h1top: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
            buyButtons: buy,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            scrollW: document.documentElement.scrollWidth
        };
    }''')
    page.close()

    # Desktop Homepage
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('https://luralab.eu', wait_until='networkidle', timeout=30000)
    page.wait_for_timeout(1000)

    data3 = page.evaluate('''() => {
        const h1 = document.querySelector('h1');
        const btns = Array.from(document.querySelectorAll('button, a[href]'));
        const ctas = btns.filter(b => {
            const t = (b.textContent || '').trim().toLowerCase();
            return t.includes('поръч') || t.includes('купи') || t.includes('добав') || t.includes('виж') || t.includes('разбер');
        }).map(b => {
            const r = b.getBoundingClientRect();
            return {
                text: (b.textContent || '').trim().replace(/[^a-zA-Z0-9\\s\\u0400-\\u04FF.,€-]/g, '').substring(0, 60),
                top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
                fold: r.top < 900
            };
        });
        const nav = Array.from(document.querySelectorAll('header a')).map(a => a.textContent.trim()).filter(t => t.length > 0);
        return {
            h1text: h1 ? h1.textContent.trim() : null,
            h1top: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
            ctas: ctas,
            navLinks: nav,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
    }''')
    page.close()
    browser.close()

all_data = {'mobile_home': data, 'mobile_product': data2, 'desktop_home': data3}
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False, default=str)

# Signal completion
with open(os.path.join(DIR, 'DONE.txt'), 'w') as f:
    f.write('done')
