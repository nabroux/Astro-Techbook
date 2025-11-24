// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({
    config: './tailwind.config.cjs'
  })],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'vitesse-dark',
      langs: ['ts', 'tsx', 'js', 'jsx', 'json', 'bash', 'shell', 'python', 'md', 'html', 'css']
    }
  }
});
