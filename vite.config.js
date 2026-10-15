import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'node:fs';
import path from 'node:path';

// The game code lives in src/game/** as small files grouped by module (body, physics, garments, textures, ui,
// economy, save, main). They share one scope (the original single-file game was written that way), so this
// plugin stitches them together in manifest order into one ES module that imports three from npm.
function gameModules() {
  const dir = path.resolve(__dirname, 'src/game');
  return {
    name: 'game-modules',
    resolveId(id) { return id === 'virtual:game' ? '\0virtual:game' : null; },
    load(id) {
      if (id !== '\0virtual:game') return null;
      const order = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
      let code = "import * as THREE from 'three';\n";
      for (const f of order) {
        const p = path.join(dir, f); this.addWatchFile(p);
        code += `\n// ===== src/game/${f} =====\n` + fs.readFileSync(p, 'utf8') + '\n';
      }
      return code;
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [gameModules(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    assetsInlineLimit: mode === 'single' ? 100000000 : 4096,
    chunkSizeWarningLimit: 2000,
  },
}));
