const { promises: fs } = require('fs');
const fsc = require('fs');
const path = require('path');

/**
 * File may be needed in the future for copying
 * utils/, types/, and app.config to the game/ dir.
 */

/**
 * @see https://stackoverflow.com/a/64255382
 */
async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  let entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? await copyDir(srcPath, destPath)
      : await fs.copyFile(srcPath, destPath);
  }
}

copyDir('./utils', './game/_migrations/utils');
copyDir('./types', './game/_migrations/types');
fsc.copyFile('./app.config.ts', './game/_migrations/app.config.ts', (err: any) => {
  if (err) throw err;
});

export {};
