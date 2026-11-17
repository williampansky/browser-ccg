/**
 * `npm run upscale -- <folder of small icons> [--out <folder>] [--model digital-art-4x] [--size 1000]`
 *
 * Upscales every PNG/JPG in a folder with Real-ESRGAN (the `realesrgan-ncnn-vulkan` command line tool, the engine under Upscayl):
 * as many 4x passes as it takes to reach `--size`, then a Lanczos resize down to exactly size x size (PNG). Output goes next to the source folder (`<folder>-upscaled`) unless `--out` is given. Names are kept, so
 * rename the results to a card id (`CORE_117.png`) and move them into `art-inbox/` for `npm run art`.
 *
 * The tool is a third-party binary and stays out of the repo. Point at it with `REALESRGAN_DIR` (default `~/tools/realesrgan/realesrgan-ncnn-vulkan-v0.2.0-macos`);
 * its `models/` folder needs `<model>.param` and `.bin` (Upscayl's models: github.com/upscayl/upscayl, resources/models).
 * `digital-art-4x` suits flat painted icons; `remacri-4x` / `high-fidelity-4x` looked about the same in a first test.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

const argv = process.argv.slice(2);
const flag = (name: string, fallback: string): string => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const src = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
if (!src || !fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
  console.error('Usage: npm run upscale -- <folder> [--out <folder>] [--model digital-art-4x] [--size 1000]');
  process.exit(1);
}
const out = flag('out', `${path.resolve(src).replace(/[\/]+$/, '')}-upscaled`);
const model = flag('model', 'digital-art-4x');
const size = Number(flag('size', '1000'));
const toolDir = process.env.REALESRGAN_DIR || path.join(os.homedir(), 'tools/realesrgan/realesrgan-ncnn-vulkan-v0.2.0-macos');
const bin = path.join(toolDir, 'realesrgan-ncnn-vulkan');
if (!fs.existsSync(bin) || !fs.existsSync(path.join(toolDir, 'models', `${model}.param`))) {
  console.error(`Real-ESRGAN not found: need ${bin} and models/${model}.param (set REALESRGAN_DIR).`);
  process.exit(1);
}

// Loaded with a runtime require, like render.ts, so ts-node does not need sharp's types resolved through a bundler.
// eslint-disable-next-line no-eval
const sharp: typeof import('sharp').default = eval('require')('sharp');

const run = async () => {
  fs.mkdirSync(out, { recursive: true });
  const files = fs.readdirSync(src).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'upscale-'));
  let done = 0;
  for (const file of files) {
    const target = path.join(out, `${path.parse(file).name}.png`);
    if (fs.existsSync(target)) continue; // resumable: skip finished icons
    let current = path.join(src, file);
    let width = (await sharp(current).metadata()).width || 1;
    let pass = 0;
    while (width < size) {
      const next = path.join(tmp, `${pass++}-${path.parse(file).name}.png`);
      execFileSync(bin, ['-i', current, '-o', next, '-n', model, '-s', '4', '-m', path.join(toolDir, 'models'), '-f', 'png'], { stdio: 'ignore' });
      current = next;
      width *= 4;
    }
    await sharp(current).resize(size, size, { kernel: 'lanczos3' }).png().toFile(target);
    done++;
    console.log(`${done}/${files.length} ${file} (${pass} pass${pass === 1 ? '' : 'es'})`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`Done: ${out}`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
