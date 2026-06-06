const { chromium } = require('playwright-core')
const path = require('path')
const URL = 'http://localhost:5175/'
const OUT = __dirname

;(async () => {
  const browser = await chromium.launch()
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      const h = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('Нам доверяют'))
      if (h) h.scrollIntoView({ block: 'center' })
    })
    await page.waitForTimeout(1200)
    // Hover a centrally located, fully visible logo (Армут sits mid-row)
    const card = page.locator('img[alt="Армут"]').first()
    await card.hover({ force: true })
    await page.waitForTimeout(900) // pause marquee + finish color/scale transition
    await page.screenshot({ path: path.join(OUT, 'hover-full.png') })
    // Tight close-up of the two marquee rows
    await page.screenshot({ path: path.join(OUT, 'hover-closeup.png'), clip: { x: 0, y: 540, width: 1440, height: 340 } })
    await ctx.close()
    console.log('OK hover shots')
  } finally {
    await browser.close()
  }
})()
