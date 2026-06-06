const { chromium } = require('playwright-core')
const path = require('path')

const URL = 'http://localhost:5175/'
const OUT = __dirname

async function gotoPartners(page) {
  await page.goto(URL, { waitUntil: 'networkidle' })
  // Scroll the "Нам доверяют" heading into view
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((e) =>
      e.textContent.includes('Нам доверяют')
    )
    if (h) h.scrollIntoView({ block: 'center' })
  })
  await page.waitForTimeout(1500) // let whileInView + marquee settle
}

;(async () => {
  const browser = await chromium.launch()
  try {
    // Desktop 1440
    const d = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const dp = await d.newPage()
    await gotoPartners(dp)
    // Section screenshot (clip around the partners block)
    await dp.screenshot({ path: path.join(OUT, '1440-partners.png') })
    // Hover state: hover a card in the first row
    const card = dp.locator('img[alt="Корманд TJ"]').first()
    if (await card.count()) {
      await card.hover({ force: true })
      await dp.waitForTimeout(700)
      await dp.screenshot({ path: path.join(OUT, '1440-hover.png') })
    }
    await d.close()

    // Mobile 390
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
    const mp = await m.newPage()
    await gotoPartners(mp)
    await mp.screenshot({ path: path.join(OUT, '390-partners.png') })
    await m.close()

    // Reduced motion 1440
    const r = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    const rp = await r.newPage()
    await gotoPartners(rp)
    await rp.screenshot({ path: path.join(OUT, '1440-reduced.png') })
    await r.close()

    console.log('OK shots written')
  } finally {
    await browser.close()
  }
})()
