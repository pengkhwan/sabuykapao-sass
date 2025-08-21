import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // เพิ่ม: กำหนด site URL ของคุณที่นี่
  site: 'https://sabuykapao.com', 
  integrations: [svelte(), sitemap()]
});