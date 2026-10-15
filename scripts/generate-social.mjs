import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';

const fontRoot = 'node_modules/@fontsource-variable';
const oswald = (await readFile(`${fontRoot}/oswald/files/oswald-latin-wght-normal.woff2`)).toString('base64');
const golos = (await readFile(`${fontRoot}/golos-text/files/golos-text-cyrillic-wght-normal.woff2`)).toString('base64');
await mkdir('public/licenses', { recursive: true });
await copyFile(`${fontRoot}/oswald/LICENSE`, 'public/licenses/oswald-OFL.txt');
await copyFile(`${fontRoot}/golos-text/LICENSE`, 'public/licenses/golos-text-OFL.txt');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="ru"><head><style>
  @font-face{font-family:Oswald;src:url(data:font/woff2;base64,${oswald});font-weight:200 700}
  @font-face{font-family:Golos;src:url(data:font/woff2;base64,${golos});font-weight:100 900}
  *{box-sizing:border-box}body{margin:0;background:#eeece8;color:#111;font-family:Golos,sans-serif;padding:38px 55px;width:1200px;height:630px}
  header{display:flex;align-items:center;gap:13px;font-size:15px;letter-spacing:2px}i{width:8px;height:8px;background:#c62836}main{font-family:Oswald;font-size:327px;font-weight:600;letter-spacing:-14px;line-height:1.16;position:relative}main:before{content:'SALLEX';position:absolute;transform:translate(12px,19px);opacity:.06}span{position:relative}aside{text-align:right;letter-spacing:8px;font-size:19px;margin-top:-28px}footer{border-top:1px solid #ccc8c2;margin-top:35px;padding-top:24px;display:flex;align-items:center;justify-content:space-between;font-size:26px}b{font-weight:400;font-size:15px;color:#625e5a}.mark{width:43px;height:4px;background:#c62836}
  </style></head><body><header><i></i>АВТОРСКАЯ ВЕБ-СТУДИЯ</header><main><span>SALLEX</span></main><aside>STUDIO</aside><footer>Дизайн и разработка сайтов<div class="mark"></div></footer></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await writeFile('public/social-preview.png', await page.screenshot());
  console.log('Generated original 1200 × 630 social preview and preserved font licenses.');
} finally { await browser.close(); }
