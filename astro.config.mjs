import { defineConfig } from 'astro/config';

// The actual Pages URL is supplied by Actions after the repository is configured.
const site = process.env.SITE_URL || undefined;
const base = process.env.BASE_PATH || '/sallex-studio/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
