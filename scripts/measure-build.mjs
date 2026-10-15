import { readdir, readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((e) => e.isDirectory() ? files(path.join(dir,e.name)) : path.join(dir,e.name)))).flat();
}
const all = await files('dist');
const totals = { javascriptGzip: 0, cssGzip: 0, htmlGzip: 0, fontsRaw: 0, totalBuildRaw: 0 };
for (const file of all) {
  const content = await readFile(file);
  totals.totalBuildRaw += (await stat(file)).size;
  if (file.endsWith('.js')) totals.javascriptGzip += gzipSync(content).length;
  if (file.endsWith('.css')) totals.cssGzip += gzipSync(content).length;
  if (file.endsWith('.html')) {
    totals.htmlGzip += gzipSync(content).length;
    // Astro can inline small client modules; include them in the JS budget.
    if (path.basename(file) === 'index.html') {
      const inline = [...content.toString().matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]).filter(Boolean).join('\n');
      if (inline) totals.javascriptGzip += gzipSync(inline).length;
    }
  }
  if (file.endsWith('.woff2')) totals.fontsRaw += content.length;
}
await mkdir('reports/local-only', { recursive: true });
await writeFile('reports/local-only/build-sizes.json', JSON.stringify(totals,null,2)+'\n');
console.log(JSON.stringify(totals,null,2));
if (totals.javascriptGzip > 60*1024) { console.error('Client JS exceeds the 60 KiB target'); process.exitCode=1; }
