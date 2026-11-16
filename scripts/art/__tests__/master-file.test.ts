/** @jest-environment node */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { findMaster, moveToDone } from '../master-file';

describe('moveToDone', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'artlab-'));
  afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

  it('moves a master into art-inbox/done/, where findMaster still finds it, and leaves one already there alone', () => {
    fs.mkdirSync(path.join(root, 'art-inbox'));
    const src = path.join(root, 'art-inbox/CORE_112.jpg');
    fs.writeFileSync(src, 'x');
    const moved = moveToDone(src, root);
    expect(moved).toBe(path.join(root, 'art-inbox/done/CORE_112.jpg'));
    expect(fs.existsSync(src)).toBe(false);
    expect(findMaster('CORE_112', root)).toBe(moved);
    expect(moveToDone(moved, root)).toBe(moved);
  });
});
