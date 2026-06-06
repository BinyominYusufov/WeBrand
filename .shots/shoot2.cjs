const { chromium } = require('playwright-core')
const path = require('path')
const OUT = __dirname
const URL = 'http://localhost:5176/'

async function toPartners(page) {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('Нам доверяют'))
    if (h) h.scrollIntoView({ block: 'center' })
  })
  await page.waitForTimeout(1200)
}

;(async () => {
  const browser = await chromium.launch()
  try {
    // ---- Desktop 1440 ----
    const d = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const dp = await d.newPage()
    await toPartners(dp)
    await dp.screenshot({ path: path.join(OUT, 'v2-1440.png') })

    // Motion proof: two frames of the running marquee, 1s apart, same clip.
    const clip = { x: 0, y: 555, width: 1440, height: 300 }
    await dp.screenshot({ path: path.join(OUT, 'v2-motion-A.png'), clip })
    await dp.waitForTimeout(1000)
    await dp.screenshot({ path: path.join(OUT, 'v2-motion-B.png'), clip })

    // Hover proof: pause the marquee (so the element is stable to hover),
    // then hover a centered card -> lift + glow + spotlight (others dim).
    await dp.addStyleTag({ content: '.animate-marquee,.animate-marquee-reverse{animation-play-state:paused !important}' })
    await dp.waitForTimeout(200)
    const card = dp.locator('img[alt="Армут"]').first()
    await card.hover()
    await dp.waitForTimeout(700)
    await dp.screenshot({ path: path.join(OUT, 'v2-hover-full.png') })
    await dp.screenshot({ path: path.join(OUT, 'v2-hover-closeup.png'), clip: { x: 0, y: 540, width: 1440, height: 340 } })
    await d.close()

    // ---- Mobile 390 ----
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
    const mp = await m.newPage()
    await toPartners(mp)
    await mp.screenshot({ path: path.join(OUT, 'v2-390.png') })
    await m.close()

    // ---- Reduced motion 1440 ----
    const r = await browser.newContext({ viewport: { width: 1440, height: 1150 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    const rp = await r.newPage()
    await toPartners(rp)
    await rp.screenshot({ path: path.join(OUT, 'v2-reduced.png') })
    await r.close()

    console.log('OK v2 shots written')
  } finally {
    await browser.close()
  }
})()
