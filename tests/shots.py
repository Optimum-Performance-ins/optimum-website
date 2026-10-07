"""Per-section screenshots for visual review: py tests/shots.py [width] [lang ...]"""
import sys
from site_check import serve, open_page, OUT, PAGES
from playwright.sync_api import sync_playwright

SECTIONS = ['#hero', '.pain-strip', '#services', '#story', '#how-we-work', '#why-us', '#stats',
            '#partners', '#testimonials', '#quote', '#trusted', '#faq', '.fra-strip', '#contact']

if __name__ == '__main__':
    width = int(sys.argv[1]) if len(sys.argv) > 1 else 1280
    langs = sys.argv[2:] or list(PAGES)
    srv, base = serve()
    with sync_playwright() as pw:
        b = pw.chromium.launch(channel='msedge')
        for lang in langs:
            p, _ = open_page(b, base, lang, width=width, reduced=True)
            p.evaluate("document.fonts.ready")
            for i, sel in enumerate(SECTIONS):
                el = p.locator(sel).first
                el.scroll_into_view_if_needed()
                p.wait_for_timeout(700)
                el.screenshot(path=str(OUT / f'{lang}-{width}-{i:02d}.png'))
        b.close()
    srv.shutdown()
