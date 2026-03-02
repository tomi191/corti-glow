import sys, os, json

DIR = "Z:/Supplements MONEY MAKER/luralab-next/screenshots"

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--disable-gpu', '--no-sandbox'])

    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://luralab.eu', wait_until='domcontentloaded', timeout=15000)
    page.wait_for_timeout(3000)

    data = page.evaluate('''() => {
        const h1 = document.querySelector('h1');
        const metaDesc = document.querySelector('meta[name="description"]');
        const title = document.querySelector('title');
        const lang = document.documentElement.lang;

        const jsonLd = document.querySelectorAll('script[type="application/ld+json"]').length;

        const headings = [];
        for (let i = 1; i <= 3; i++) {
            document.querySelectorAll('h' + i).forEach(h => {
                headings.push(i + ': ' + h.textContent.trim().substring(0, 50));
            });
        }

        const clickable = Array.from(document.querySelectorAll('button, a, input'));
        const small = clickable.filter(el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
        }).length;

        return {
            title: title ? title.textContent : null,
            desc: metaDesc ? metaDesc.content : null,
            lang: lang,
            jsonLd: jsonLd,
            h1: h1 ? h1.textContent.trim() : null,
            h1top: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
            headings: headings.slice(0, 15),
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            sw: document.documentElement.scrollWidth,
            cw: document.documentElement.clientWidth,
            small: small,
            imgs: document.querySelectorAll('img').length,
            noAlt: Array.from(document.querySelectorAll('img')).filter(i => !i.alt).length
        };
    }''')
    page.close()

    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://luralab.eu/produkt', wait_until='domcontentloaded', timeout=15000)
    page.wait_for_timeout(3000)

    data2 = page.evaluate('''() => {
        const h1 = document.querySelector('h1');
        const btns = Array.from(document.querySelectorAll('button'));
        const buyTexts = btns.map(b => b.textContent.trim().substring(0, 40));
        return {
            h1: h1 ? h1.textContent.trim() : null,
            h1top: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
            buttons: buyTexts.slice(0, 10),
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            sw: document.documentElement.scrollWidth
        };
    }''')
    page.close()

    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('https://luralab.eu', wait_until='domcontentloaded', timeout=15000)
    page.wait_for_timeout(3000)

    data3 = page.evaluate('''() => {
        const h1 = document.querySelector('h1');
        const nav = Array.from(document.querySelectorAll('header a')).map(a => a.textContent.trim()).filter(t => t);
        return {
            h1: h1 ? h1.textContent.trim() : null,
            h1top: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
            nav: nav,
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
    }''')
    page.close()

    browser.close()

result = {'mobile_home': data, 'mobile_product': data2, 'desktop_home': data3}
with open(os.path.join(DIR, 'audit_results.json'), 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False, default=str)

with open(os.path.join(DIR, 'DONE.txt'), 'w') as f:
    f.write('ok')
