const { chromium } = require('playwright-core')
const path = require('path')
const OUT = __dirname
const URL = 'http://localhost:5177/'

async function toPartners(page) {
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('Нам доверяют'))
    if (h) h.scrollIntoView({ block: 'center' })
  })
  await page.waitForTimeout(1000)
  // Pause both marquee rows so hovered element is stable to interact with
  await page.addStyleTag({ content: '.animate-marquee,.animate-marquee-reverse{animation-play-state:paused !important}' })
  await page.waitForTimeout(200)
}

// Hover a TOP-row (row 1) logo card — row 1 is where the top-edge clipping happened.
// "Армут" is an even-index partner, so it lives in row 1.
async function hoverTopRowCard(page, alt) {
  if (alt) {
    await page.locator(`.animate-marquee img[alt="${alt}"]`).first().hover({ force: true })
    await page.waitForTimeout(900)
    return
  }
  const vw = page.viewportSize().width
  // Tag the row-1 card whose centre is on-screen and closest to the horizontal
  // centre, then hover that exact element (force: handles the edge-fade overlap).
  await page.evaluate((vw) => {
    document.querySelectorAll('[data-hovertarget]').forEach((e) => e.removeAttribute('data-hovertarget'))
    const row = document.querySelector('.animate-marquee')
    const cards = [...row.children]
    let best = null
    for (const c of cards) {
      const r = c.getBoundingClientRect()
      const cx = r.left + r.width / 2
      if (cx < 0 || cx > vw) continue
      const d = Math.abs(cx - vw / 2)
      if (!best || d < best.d) best = { d, el: c }
    }
    if (best) best.el.setAttribute('data-hovertarget', '1')
  }, vw)
  await page.locator('[data-hovertarget]').hover({ force: true })
  await page.waitForTimeout(700)
}

;(async () => {
  const browser = await chromium.launch()
  try {
    // 1440
    const d = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const dp = await d.newPage()
    await toPartners(dp)
    const info = await dp.evaluate(() => {
      document.querySelectorAll('[data-hovertarget]').forEach((e) => e.removeAttribute('data-hovertarget'))
      const vw = window.innerWidth
      const cards = [...document.querySelector('.animate-marquee').children]
      let best = null
      for (const c of cards) {
        const r = c.getBoundingClientRect()
        const cx = r.left + r.width / 2
        if (cx < 40 || cx > vw - 40) continue
        const d = Math.abs(cx - vw / 2)
        if (!best || d < best.d) best = { d, el: c, r, name: c.querySelector('img,span')?.alt || c.textContent }
      }
      best.el.setAttribute('data-hovertarget', '1')
      return { name: best.name, top: best.r.top, left: best.r.left, w: best.r.width, h: best.r.height }
    })
    console.log('1440 hover target:', JSON.stringify(info))
    await dp.locator('[data-hovertarget]').hover({ force: true })
    await dp.waitForTimeout(900)
    await dp.screenshot({ path: path.join(OUT, 'clip-1440.png') })
    await dp.screenshot({ path: path.join(OUT, 'clip-1440-closeup.png'), clip: { x: Math.max(0, info.left - 60), y: Math.max(0, info.top - 60), width: info.w + 120, height: info.h + 120 } })
    await d.close()

    // 390
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
    const mp = await m.newPage()
    await toPartners(mp)
    await hoverTopRowCard(mp)
    await mp.screenshot({ path: path.join(OUT, 'clip-390.png') })
    await m.close()

    console.log('OK clip shots written')
  } finally {
    await browser.close()
  }
})()
