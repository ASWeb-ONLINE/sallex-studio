import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sizes = [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[360,800],[320,740]];

for (const [width,height] of sizes) {
  test(`layout and resources ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width,height });
    const errors: string[] = [];
    const failures: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => failures.push(request.url()));
    page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    const response = await page.goto('./');
    expect(response?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Дизайн и разработка сайтов');
    expect(await page.locator('html').getAttribute('lang')).toBe('ru');
    const geometry = await page.evaluate(() => {
      const word = document.querySelector('.hero__letters')!;
      const range = document.createRange(); range.selectNodeContents(word);
      const rect = range.getBoundingClientRect();
      return { width: window.innerWidth, document: document.documentElement.scrollWidth, wordLeft: rect.left, wordRight: rect.right };
    });
    expect(geometry.document).toBeLessThanOrEqual(geometry.width + 1);
    expect(geometry.wordLeft).toBeGreaterThanOrEqual(0);
    expect(geometry.wordRight).toBeLessThanOrEqual(geometry.width);
    await expect(page.locator('#services .service-card')).toHaveCount(2);
    await expect(page.locator('#portfolio, #works, a[href*="/works/"]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(errors).toEqual([]); expect(failures).toEqual([]);
  });
}

test('mobile menu closes on Escape and navigation, focus follows', async ({ page }) => {
  await page.setViewportSize({ width:390,height:844 });
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('./');
  const menu=page.locator('.mobile-menu'); const toggle=menu.locator('summary');
  await toggle.click(); await expect(menu).toHaveAttribute('open','');
  await page.keyboard.press('Escape'); await expect(menu).not.toHaveAttribute('open'); await expect(toggle).toBeFocused();
  await toggle.click(); await menu.getByRole('link',{name:/О студии/}).click();
  await expect(menu).not.toHaveAttribute('open'); await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('#about')).toBeFocused();
  const top=await page.locator('#about').evaluate((e)=>e.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(68);
});

test('service links preselect type and anchors retain project base', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' }); await page.goto('./');
  await page.getByRole('link',{name:'Обсудить лендинг',exact:true}).click();
  await expect(page.locator('#project-type')).toHaveValue('landing');
  await expect(page).toHaveURL(/\/sallex-studio\/#contact$/);
  await page.getByRole('link',{name:'Обсудить сайт компании',exact:true}).click();
  await expect(page.locator('#project-type')).toHaveValue('company');
});

test('FAQ works by keyboard and allows multiple open answers', async ({ page }) => {
  await page.goto('./');
  const summaries=page.locator('.faq summary');
  await summaries.nth(0).focus(); await page.keyboard.press('Enter');
  await summaries.nth(1).focus(); await page.keyboard.press('Space');
  await expect(page.locator('.faq details[open]')).toHaveCount(2);
  await expect(summaries.nth(1)).toBeFocused();
});

test('actual clipboard copy, no submission or storage', async ({ page,context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('./'); await page.evaluate(()=>document.fonts.ready);
  const requests: string[]=[]; page.on('request',(r)=>requests.push(r.url()));
  await page.locator('#project-type').selectOption('landing');
  await page.locator('#project-description').fill('Проверка локального описания.');
  await page.getByRole('button',{name:'Скопировать описание'}).click();
  await expect(page.locator('[role="status"]')).toHaveText('Описание скопировано');
  const copied=await page.evaluate(()=>navigator.clipboard.readText());
  expect(copied).toContain('Формат сайта: Лендинг');
  expect(copied).toContain('Проверка локального описания.');
  expect(requests).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(()=>[localStorage.length,sessionStorage.length])).toEqual([0,0]);
  expect(page.url()).not.toContain('описания');
});

test('clipboard denial exposes manual copy without losing input', async ({ page }) => {
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new DOMException('Denied','NotAllowedError');}}}));
  await page.goto('./');
  await page.locator('#project-description').fill('Локальная проверка отказа.');
  await page.getByRole('button',{name:'Скопировать описание'}).click();
  await expect(page.locator('[data-manual-copy]')).toBeVisible();
  await expect(page.locator('#manual-description')).toHaveValue(/Локальная проверка отказа/);
  await expect(page.locator('#project-description')).toHaveValue('Локальная проверка отказа.');
  await expect(page.locator('[role="status"]')).not.toHaveText('Описание скопировано');
  await expect(page.locator('#manual-description')).toBeFocused();
});

test('no JavaScript: page, navigation, FAQ and draft remain usable', async ({ browser,baseURL }) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page=await context.newPage(); await page.goto(baseURL!);
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('.mobile-menu summary').click();
  await expect(page.locator('.mobile-menu nav')).toBeVisible();
  await page.locator('.mobile-menu nav').getByRole('link',{name:/Контакты/}).click();
  await page.locator('#project-description').fill('Текст можно выделить вручную');
  await expect(page.locator('.no-js-note')).toBeVisible();
  await expect(page.locator('[data-copy-button]')).toBeHidden();
  await page.locator('.faq summary').first().click();
  await expect(page.locator('.faq details').first()).toHaveAttribute('open','');
  await context.close();
});

test('touch and runtime reduced motion disable tracking', async ({ browser,page,baseURL }) => {
  const touch=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
  const tp=await touch.newPage(); await tp.goto(baseURL!);
  await tp.getByRole('link',{name:'Обсудить лендинг',exact:true}).tap();
  await expect(tp.locator('#project-type')).toHaveValue('landing');
  await expect(tp.locator('[data-spotlight][data-active]')).toHaveCount(0);
  await expect(tp.locator('.spotlight__art--color').first()).toHaveCSS('display','none');
  await touch.close();
  await page.goto('./'); const surface=page.locator('[data-spotlight]').first();
  await surface.hover(); await expect(surface).toHaveAttribute('data-active','');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(surface).not.toHaveAttribute('data-active');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior','auto');
  await expect(surface.locator('.spotlight__art--color')).toHaveCSS('display','none');
});

test('mask support fallback preserves content', async ({ page }) => {
  await page.addInitScript(()=>{const original=CSS.supports.bind(CSS);CSS.supports=((property:string,value?:string)=>property==='mask-image'?false:original(property,value!)) as typeof CSS.supports;});
  await page.goto('./');
  await page.locator('[data-spotlight]').first().hover();
  await expect(page.locator('[data-spotlight][data-active]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Обсудить лендинг',exact:true})).toBeVisible();
});

test('accessibility scan and keyboard skip link', async ({ page }) => {
  await page.goto('./'); await page.evaluate(()=>document.fonts.ready);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'К содержанию'})).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#main')).toBeFocused();
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});

test('404 returns to the project root', async ({ page,baseURL }) => {
  const response=await page.goto(`${baseURL}not-a-real-page/`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading',{name:'Такой страницы нет'})).toBeVisible();
  await page.getByRole('link',{name:'На главную',exact:true}).click();
  await expect(page).toHaveURL(baseURL!);
  await expect(page.locator('h1')).toHaveText('Дизайн и разработка сайтов');
});

test('200% reflow equivalent and 1024 touch hybrid remain usable', async ({ browser,baseURL }) => {
  const zoom=await browser.newContext({viewport:{width:720,height:450},deviceScaleFactor:2});
  const page=await zoom.newPage();await page.goto(baseURL!);await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('.mobile-menu summary').click();
  await expect(page.locator('.mobile-menu nav')).toBeVisible();
  await page.screenshot({path:'reports/local-only/zoom-200-reflow.png',fullPage:true});
  await zoom.close();
  const hybrid=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:false});
  const hp=await hybrid.newPage();await hp.goto(baseURL!);
  await hp.getByRole('link',{name:'Обсудить лендинг',exact:true}).tap();
  await expect(hp.locator('#project-type')).toHaveValue('landing');
  await expect(hp.locator('[data-spotlight][data-active]')).toHaveCount(0);
  await hybrid.close();
});
