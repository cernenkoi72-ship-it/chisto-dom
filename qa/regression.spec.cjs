const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const widths = [360, 768, 1280, 1440];
const fmt = value => new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, '');
async function captureResponsive(page, slug) {
  fs.mkdirSync(path.join(__dirname, 'artifacts'), { recursive: true });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const b=e.getBoundingClientRect(); return b.right > innerWidth + 1 || b.left < -1; }).slice(0,12).map(e => ({tag:e.tagName, className:String(e.className).slice(0,100), text:e.textContent.slice(0,40), rect:e.getBoundingClientRect().toJSON()})));
    if (overflow.length) console.log('OVERFLOW_DIAGNOSTIC', width, JSON.stringify(overflow));
    const debug = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll('body *')].map(e => ({ tag: e.tagName, className: String(e.className).slice(0,75), rectRight: Math.round(e.getBoundingClientRect().right), rectLeft: Math.round(e.getBoundingClientRect().left), ownScroll: e.scrollWidth - e.clientWidth })).filter(x => x.rectRight > innerWidth + 1 || x.rectLeft < -1 || x.ownScroll > 1).slice(0,35) }));
    const sections = await page.evaluate(() => [...document.querySelectorAll('body, header, nav, main, section, .container, .hero-visual, .price-panel, footer')].map(e => { const before = document.documentElement.scrollWidth; const orig = e.style.overflowX; e.style.overflowX = 'hidden'; const after = document.documentElement.scrollWidth; e.style.overflowX = orig; return { tag: e.tagName, className: e.className, before, after, changed: before - after }; }).filter(x => x.changed > 0).slice(0,30));
    expect(debug.scrollWidth, 'MOBILE_OVERFLOW ' + JSON.stringify(debug) + ' ISOLATION ' + JSON.stringify(sections)).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: path.join(__dirname, 'artifacts', slug + '-' + width + '.png'), fullPage: true });
  }
}

test('калькулятор: тарифы, минимум, допуслуги', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#total')).toContainText(/2\s*800\s*₽/);
  await page.locator('#cleaningType').selectOption('general');
  await page.locator('#area').fill('40');
  for (const id of ['windows', 'oven', 'fridge']) await page.locator('#' + id).check();
  await expect(page.locator('#total')).toContainText(/6\s*900\s*₽/);
  for (const id of ['windows', 'oven', 'fridge']) await page.locator('#' + id).uncheck();
  await page.locator('#cleaningType').selectOption('renovation');
  await page.locator('#area').fill('20');
  await expect(page.locator('#total')).toContainText(/5\s*000\s*₽/);
  await page.locator('#area').fill('19');
  await expect(page.locator('#total')).toHaveText('—');
});
test('заявка: валидация и честное демо-сообщение', async ({ page }) => {
  await page.goto('/');
  await page.locator('#clientName').fill('Тестовый клиент');
  await page.locator('#clientContact').fill('wrong-contact');
  await page.locator('#requestForm button[type="submit"]').click();
  await expect(page.locator('#requestResult')).toBeHidden();
  await page.locator('#clientContact').fill('@demo_test');
  await page.locator('#requestForm button[type="submit"]').click();
  await expect(page.locator('#requestResult')).toBeVisible();
  await expect(page.locator('#resultText')).toHaveValue(/ЗАЯВКА НА УБОРКУ \(ДЕМО\)/);
  await expect(page.locator('#copyStatus')).toContainText('никуда не отправлена');
  await page.locator('#area').fill('55');
  await expect(page.locator('#requestResult')).toBeHidden();
});
test('клавиатура: меню и FAQ', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('a[href="#calculator"]').first();
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#calculator$/);
  const summary = page.locator('#faq summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#faq details').first()).toHaveAttribute('open', '');
});
test('адаптивность и полноразмерные базовые скриншоты', async ({ page }) => { await captureResponsive(page, 'chisto-dom'); });
