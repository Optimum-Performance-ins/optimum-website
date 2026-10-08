"""Site checks for the new-identity re-skin.

Usage: py tests/site_check.py [check ...]   (no args = run every check)
Serves the repo root on a random local port, drives Edge via Playwright,
prints PASS/FAIL per check and writes screenshots to tests/out/.
"""
import os, sys, threading, functools, http.server, socketserver, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
ROOT = pathlib.Path(os.environ.get('SITE_ROOT', HERE.parent))  # SITE_ROOT lets checks run against another checkout
OUT = HERE / 'out'
OUT.mkdir(exist_ok=True)
PAGES = {'ar': '/index.html', 'en': '/en/index.html'}
INK900 = 'rgb(12, 36, 54)'


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), handler)
    srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f'http://127.0.0.1:{srv.server_address[1]}'


def open_page(browser, base, lang, width=1280, reduced=False):
    ctx = browser.new_context(viewport={'width': width, 'height': 900},
                              reduced_motion='reduce' if reduced else 'no-preference')
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
    page.goto(base + PAGES[lang])
    # The intro would lock scrolling for ~4s; checks skip it.
    page.evaluate("document.documentElement.classList.remove('intro-play');"
                  "document.getElementById('intro')?.remove();"
                  "document.dispatchEvent(new CustomEvent('intro:done'))")
    page.wait_for_timeout(300)
    return page, errors


def check_no_errors(b, base):
    for lang in PAGES:
        p, errors = open_page(b, base, lang)
        p.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        p.wait_for_timeout(500)
        assert not errors, f'{lang}: {errors}'


def check_structure(b, base):
    for lang in PAGES:
        p, _ = open_page(b, base, lang)
        for sel in ['#hero', '.pain-strip', '#services', '#how-we-work', '#why-us', '#stats',
                    '#partners', '#testimonials', '#quote', '#trusted', '#faq', '.fra-strip', '#contact']:
            assert p.locator(sel).count() >= 1, f'{lang}: missing {sel}'
        left = p.locator('.cinematic-strip, .hero-particles, .section-shapes').count()
        assert left == 0, f'{lang}: old ambient/cinematic markup left ({left})'
        bad = p.evaluate("""[...document.querySelectorAll('img')].map(i => i.getAttribute('src'))
            .filter(s => /father_son|factory_sunset|vecteezy|pexels|card-/.test(s))""")
        assert not bad, f'{lang}: photos still referenced {bad}'
        bgs = p.evaluate("""[...document.querySelectorAll('[style*=background-image]')]
            .filter(e => /\\.(jpe?g|png|webp)/.test(e.getAttribute('style'))).length""")
        assert bgs == 0, f'{lang}: inline photo backgrounds left ({bgs})'


def check_colors(b, base):
    for lang in PAGES:
        p, _ = open_page(b, base, lang)
        body = p.evaluate("getComputedStyle(document.body).backgroundColor")
        assert body == INK900, f'{lang}: body bg {body}'
        theme = p.evaluate("document.querySelector('meta[name=theme-color]').content")
        assert theme == '#0c2436', f'{lang}: theme-color {theme}'
        light = p.evaluate("""[...document.querySelectorAll('section, footer')].filter(s => {
            const m = getComputedStyle(s).backgroundColor.match(/\\d+/g);
            return m && m.length >= 3 && (m.length < 4 || +m[3] > 0) && m.slice(0, 3).every(v => +v > 200);
        }).map(s => s.id || s.className)""")
        assert not light, f'{lang}: light sections {light}'


def check_fonts(b, base):
    for lang in PAGES:
        p, _ = open_page(b, base, lang)
        p.evaluate("document.fonts.ready.then(() => true)")
        fam = p.evaluate("getComputedStyle(document.querySelector('#hero h1')).fontFamily")
        want = 'Amiri' if lang == 'ar' else 'Cormorant Garamond'
        assert fam.strip('"\'').startswith(want), f'{lang}: h1 font {fam}'
        loaded = p.evaluate("[...document.fonts].filter(f => f.status === 'loaded').map(f => f.family)")
        assert any(want in f for f in loaded), f'{lang}: {want} not loaded {loaded}'


def check_no_overflow(b, base):
    for lang in PAGES:
        for w in (360, 768, 1280, 1920):
            p, _ = open_page(b, base, lang, width=w)
            sw = p.evaluate("document.documentElement.scrollWidth")
            assert sw <= w, f'{lang}@{w}: scrollWidth {sw}'


def check_rtl(b, base):
    p, _ = open_page(b, base, 'ar')
    assert p.evaluate("document.documentElement.dir") == 'rtl'
    mirrored = p.evaluate("""(() => {
        const l = document.querySelector('.sec-label');
        if (!l) return null;
        const a = l.getBoundingClientRect(), t = l.querySelector('.sec-label__text').getBoundingClientRect();
        return t.right > a.left + a.width / 2;
    })()""")
    assert mirrored, f'ar: section label not mirrored ({mirrored})'


def check_screens(b, base):
    for lang in PAGES:
        for w in (375, 1280):
            p, _ = open_page(b, base, lang, width=w, reduced=True)
            p.screenshot(path=str(OUT / f'{lang}-{w}.png'), full_page=True)


def check_service_prefill(b, base):
    for lang in PAGES:
        p, _ = open_page(b, base, lang)
        # the carousel may autoplay mid-click, so dispatch the click on the card itself
        p.evaluate("document.querySelector('.service-card[data-service=motor]').click()")
        p.wait_for_timeout(400)
        ct = p.evaluate("document.querySelector('input[name=clientType]:checked')?.value")
        it = p.evaluate("document.getElementById('insuranceType').value")
        assert (ct, it) == ('individual', 'motor'), f'{lang}: prefill gave {(ct, it)}'


def check_reduced_motion(b, base):
    for lang in PAGES:
        p, _ = open_page(b, base, lang, reduced=True)
        assert p.locator('#story').count() == 0, f'{lang}: story section still present'
        assert not p.evaluate("document.documentElement.classList.contains('js-draw')"), f'{lang}: draw-on active under reduced motion'
        p.evaluate("document.querySelector('.fra-strip').scrollIntoView({behavior: 'instant'})")
        p.wait_for_timeout(500)
        hidden = p.evaluate("[...document.querySelectorAll('.fra-card > *')].filter(e => getComputedStyle(e).opacity === '0').length")
        assert hidden == 0, f'{lang}: {hidden} FRA card parts hidden'


def check_form(b, base):
    for lang in PAGES:
        p, _ = open_page(b, base, lang)
        p.locator('#quoteForm [type=submit]').click()
        errs = p.locator('#quoteForm .form-group.error').count()
        assert errs >= 4, f'{lang}: only {errs} errors on empty submit'
        p.fill('#fullName', 'Test')
        p.fill('#email', 't@t.co')
        p.fill('#phone', '0100')
        # click the radio directly: a smooth scroll in flight can make a pointer click miss
        p.evaluate("document.querySelector('input[name=clientType][value=corporate]').click()")
        p.select_option('#insuranceType', 'marine-cargo')
        p.locator('#quoteForm [type=submit]').click()
        p.wait_for_timeout(200)
        assert p.locator('#formSuccess.show').count() == 1, f'{lang}: success not shown'


def check_dashes_stay_dashed(b, base):
    # draw-on normalises path lengths; dotted/dashed strokes must keep their real length
    for lang in PAGES:
        p, _ = open_page(b, base, lang)
        assert p.evaluate("document.documentElement.classList.contains('js-draw')"), f'{lang}: draw-on not active'
        bad = p.evaluate("document.querySelectorAll('svg.draw .dash[pathLength]').length")
        assert bad == 0, f'{lang}: {bad} dashed strokes normalised (render solid)'


def check_carousel_clones_drawn(b, base):
    for lang in PAGES:
        p, _ = open_page(b, base, lang)
        p.evaluate("document.getElementById('services').scrollIntoView()")
        p.wait_for_timeout(600)
        for _ in range(2):
            p.locator('#segment-individual [data-carousel-next]').click()
            p.wait_for_timeout(900)
        undrawn = p.evaluate("""[...document.querySelectorAll('#segment-individual .service-card svg.draw')].filter(s => {
            const r = s.getBoundingClientRect();
            return r.left >= 0 && r.right <= innerWidth && r.width > 0 && !s.classList.contains('is-drawn');
        }).length""")
        assert undrawn == 0, f'{lang}: {undrawn} visible service icons never drawn'


def check_nav_fits(b, base):
    for lang in PAGES:
        for w in (780, 844, 900, 960, 1024):
            p, _ = open_page(b, base, lang, width=w)
            r = p.evaluate("""(() => { const n = document.getElementById('navbar').getBoundingClientRect();
                const t = document.querySelector('.lang-toggle').getBoundingClientRect();
                return {h: n.height, left: t.left, right: t.right}; })()""")
            assert r['h'] <= 90 and r['left'] >= 0 and r['right'] <= w, f'{lang}@{w}: nav {r}'


def check_error_contrast(b, base):
    p, _ = open_page(b, base, 'en')
    p.locator('#quoteForm [type=submit]').click()
    ratio = p.evaluate("""(() => {
        const rgb = s => s.match(/[0-9.]+/g).slice(0, 3).map(Number);
        const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const fg = lum(rgb(getComputedStyle(document.querySelector('.form-error')).color));
        const bg = lum(rgb(getComputedStyle(document.querySelector('.quote-panel')).backgroundColor));
        return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    })()""")
    assert ratio >= 4.5, f'error text contrast {ratio:.2f}'


CHECKS = {k[len('check_'):]: v for k, v in list(globals().items()) if k.startswith('check_')}

if __name__ == '__main__':
    names = sys.argv[1:] or list(CHECKS)
    srv, base = serve()
    failed = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel='msedge')
        for n in names:
            try:
                CHECKS[n](browser, base)
                print('PASS', n)
            except Exception as e:  # Playwright timeouts count as failures too
                failed += 1
                print('FAIL', n, '-', str(e).splitlines()[0])
        browser.close()
    srv.shutdown()
    sys.exit(1 if failed else 0)
