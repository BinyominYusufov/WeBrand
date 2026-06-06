const { chromium } = require('playwright-core')
const path = require('path')
const OUT = __dirname
const URL = 'http://localhost:5173/'

;(async () => {
  const browser = await chromium.launch()
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    await page.goto(URL, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.querySelector('footer').scrollIntoView({ block: 'end' }))
    await page.waitForTimeout(700)

    // Dump every social anchor in the footer (the round icon links next to the nav/CTA)
    const links = await page.evaluate(() => {
      const footer = document.querySelector('footer')
      // social links = anchors with aria-label among the known set
      const wanted = ['Telegram', 'Instagram', 'WhatsApp', 'TikTok', 'Facebook']
      return [...footer.querySelectorAll('a[aria-label]')]
        .filter((a) => wanted.includes(a.getAttribute('aria-label')))
        .map((a) => ({
          label: a.getAttribute('aria-label'),
          href: a.getAttribute('href'),
          target: a.getAttribute('target'),
          rel: a.getAttribute('rel'),
        }))
    })
    console.log('SOCIAL_LINKS=' + JSON.stringify(links, null, 2))

    // Any leftover "#" or placeholder hrefs in the footer?
    const placeholders = await page.evaluate(() => {
      const footer = document.querySelector('footer')
      return [...footer.querySelectorAll('a')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h === '#' || h === 'https://t.me/' || h === '#top' ? false : false)
    })
    const allHrefs = await page.evaluate(() =>
      [...document.querySelector('footer').querySelectorAll('a')].map((a) => a.getAttribute('href')),
    )
    console.log('ALL_FOOTER_HREFS=' + JSON.stringify(allHrefs))

    await page.screenshot({ path: path.join(OUT, 'footer.png'), clip: { x: 0, y: page.viewportSize().height - 420, width: 1440, height: 420 } })
    await ctx.close()
    console.log('OK footer shot written; placeholders unused', placeholders.length)
  } finally {
    await browser.close()
  }
})()
