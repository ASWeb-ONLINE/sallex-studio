import { test,expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const directory=`reports/local-only/${process.env.VISUAL_PASS || 'final'}`;
test('capture full page and real interaction states', async ({ page,browser,baseURL }) => {
  test.setTimeout(90_000);
  await mkdir(directory,{recursive:true});
  const views=[
    {name:'desktop',width:1440,height:900,full:true},
    {name:'laptop',width:1366,height:768,full:false},
    {name:'tablet',width:768,height:1024,full:true},
    {name:'mobile',width:390,height:844,full:true},
    {name:'mobile-320',width:320,height:740,full:false},
  ];
  for(const view of views){
    const touchContext=view.width<=768 ? await browser.newContext({viewport:view,hasTouch:true,isMobile:true,locale:'ru-RU'}) : undefined;
    const target=touchContext ? await touchContext.newPage() : page;
    await target.setViewportSize(view); await target.goto(baseURL!); await target.evaluate(()=>document.fonts.ready);
    await target.mouse.move(0,0);
    await target.screenshot({path:`${directory}/${view.name}-hero.png`});
    if(view.full) await target.screenshot({path:`${directory}/${view.name}-full.png`,fullPage:true});
    await touchContext?.close();
  }
  await page.setViewportSize({width:1440,height:900}); await page.goto('./'); await page.evaluate(()=>document.fonts.ready);
  const surface=page.locator('[data-spotlight]').first();
  await surface.scrollIntoViewIfNeeded(); await page.mouse.move(0,0);
  const before=await surface.screenshot({path:`${directory}/spotlight-01-rest.png`});
  const box=(await surface.boundingBox())!;
  await page.mouse.move(box.x+box.width*.28,box.y+box.height*.52);
  await expect(surface).toHaveAttribute('data-active','');
  await expect(surface.locator('.spotlight__art--color')).toHaveCSS('opacity','1');
  const left=await surface.screenshot({path:`${directory}/spotlight-02-left.png`});
  await page.mouse.move(box.x+box.width*.73,box.y+box.height*.52);
  const right=await surface.screenshot({path:`${directory}/spotlight-03-right.png`});
  expect(left.equals(before)).toBe(false); expect(right.equals(left)).toBe(false);
  await page.mouse.move(0,0);
  await expect(surface.locator('.spotlight__art--color')).toHaveCSS('opacity','0');
  const after=await surface.screenshot({path:`${directory}/spotlight-04-after.png`});
  expect(after.equals(before)).toBe(true);
  const company=page.locator('[data-spotlight]').nth(1); await company.hover();
  await expect(company.locator('.spotlight__art--color')).toHaveCSS('opacity','1');
  await company.screenshot({path:`${directory}/spotlight-company.png`});
  await page.mouse.move(0,0);
  await page.locator('.faq summary').first().click();
  await page.locator('#faq').screenshot({path:`${directory}/faq-open.png`});
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new DOMException('Denied','NotAllowedError');}}}));
  await page.reload(); await page.locator('#project-description').fill('Проверка локального режима.');
  await page.getByRole('button',{name:'Скопировать описание'}).click();
  await expect(page.locator('[data-manual-copy]')).toBeVisible();
  await page.locator('#contact').screenshot({path:`${directory}/contact-manual-copy.png`});
  await page.setViewportSize({width:390,height:844}); await page.goto('./');
  await page.locator('.mobile-menu summary').click();
  await page.screenshot({path:`${directory}/mobile-menu.png`});
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('./');
  await page.locator('#services').screenshot({path:`${directory}/reduced-motion.png`});
  await page.goto('./'); await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'К содержанию'})).toBeFocused();
  await page.screenshot({path:`${directory}/keyboard-focus.png`});
});
