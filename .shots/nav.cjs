const { chromium } = require('playwright-core')
const path = require('path')
const OUT = __dirname
const URL = 'http://localhost:5178/'

;(async () => {
  const browser = await chromium.launch()
  try {
    // ---------- Desktop 1440 ----------
    const d = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const dp = await d.newPage()
    await dp.goto(URL, { waitUntil: 'networkidle' })
    await dp.waitForTimeout(800)
    // TOP of page (transparent/tall header)
    await dp.screenshot({ path: path.join(OUT, 'nav-1440-top.png'), clip: { x: 0, y: 0, width: 1440, height: 140 } })

    // Hover a nav link to prove the underline animation (still at top)
    await dp.locator('nav a:has-text("Услуги")').first().hover()
    await dp.waitForTimeout(450)
    await dp.screenshot({ path: path.join(OUT, 'nav-1440-hover.png'), clip: { x: 0, y: 0, width: 1440, height: 140 } })

    // SCROLLED (glass + shrink)
    await dp.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }))
    await dp.waitForTimeout(600)
    await dp.screenshot({ path: path.join(OUT, 'nav-1440-scrolled.png'), clip: { x: 0, y: 0, width: 1440, height: 140 } })
    // Hover the CTA in scrolled state (arrow nudge + glow)
    await dp.locator('header button:has-text("Напишите нам")').first().hover()
    await dp.waitForTimeout(450)
    await dp.screenshot({ path: path.join(OUT, 'nav-1440-cta.png'), clip: { x: 700, y: 0, width: 740, height: 120 } })
    await d.close()

    // ---------- Mobile 390 ----------
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
    const mp = await m.newPage()
    await mp.goto(URL, { waitUntil: 'networkidle' })
    await mp.waitForTimeout(800)
    await mp.screenshot({ path: path.join(OUT, 'nav-390-top.png'), clip: { x: 0, y: 0, width: 390, height: 120 } })

    await mp.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }))
    await mp.waitForTimeout(600)
    await mp.screenshot({ path: path.join(OUT, 'nav-390-scrolled.png'), clip: { x: 0, y: 0, width: 390, height: 120 } })

    // Open the mobile menu
    await mp.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await mp.waitForTimeout(300)
    await mp.locator('button[aria-controls="mobile-menu"]').click()
    await mp.waitForTimeout(900) // let stagger finish
    await mp.screenshot({ path: path.join(OUT, 'nav-390-menu.png') })
    await m.close()

    console.log('OK nav shots written')
  } finally {
    await browser.close()
  }
})()
