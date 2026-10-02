import { build } from 'vite';
import { readFile, writeFile, rm } from 'node:fs/promises';

const serverDir = '.prerender';
try {
  await build({
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: serverDir,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: 'entry-server.js' } },
    },
  });
  const { render } = await import('../.prerender/entry-server.js');
  const template = await readFile('dist/index.html', 'utf8');
  const html = template.replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
  await writeFile('dist/index.html', html);
  console.info('Prerendered portfolio: content and case studies available before JavaScript.');
} finally {
  await rm(serverDir, { recursive: true, force: true });
}
