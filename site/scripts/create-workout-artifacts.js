#!/usr/bin/env node
// Replaces the rsync + zip prebuild steps with pure Node.js (no system tools needed).
import { readdirSync, copyFileSync, mkdirSync, readFileSync, rmSync, existsSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC = resolve(__dirname, '../../workouts');
const DEST = resolve(__dirname, '../public/workouts');
const ZIP_OUT = join(DEST, 'high-torque-workouts.zip');

// --- Copy .zwo files preserving directory structure ---

if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true });
}
mkdirSync(DEST, { recursive: true });

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const srcPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(srcPath);
    } else if (entry.name.endsWith('.zwo')) {
      const relPath = relative(SRC, srcPath);
      const destPath = join(DEST, relPath);
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
      console.log(`  copied: ${relPath}`);
    }
  }
}

console.log('Copying .zwo files...');
walk(SRC);

// --- Build zip using fflate (bundled with Vite/Rolldown) or manual approach ---
// We use the built-in zlib + a minimal ZIP writer to avoid extra dependencies.

import { deflateRawSync } from 'zlib';

function crc32(buf) {
  let crc = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const d = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const t = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  return { date: d, time: t };
}

function writeUint16LE(buf, offset, val) {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >> 8) & 0xff;
}
function writeUint32LE(buf, offset, val) {
  buf[offset] = val & 0xff;
  buf[offset + 1] = (val >> 8) & 0xff;
  buf[offset + 2] = (val >> 16) & 0xff;
  buf[offset + 3] = (val >> 24) & 0xff;
}

function buildZip(files) {
  // files: array of { name: string, data: Buffer }
  const entries = [];
  const parts = [];
  let offset = 0;
  const now = dosDateTime(new Date());

  for (const { name, data } of files) {
    const nameBytes = Buffer.from(name, 'utf8');
    const compressed = deflateRawSync(data, { level: 6 });
    const crc = crc32(data);

    // Local file header
    const local = Buffer.alloc(30 + nameBytes.length);
    writeUint32LE(local, 0, 0x04034b50);  // signature
    writeUint16LE(local, 4, 20);           // version needed
    writeUint16LE(local, 6, 0);            // flags
    writeUint16LE(local, 8, 8);            // compression: deflate
    writeUint16LE(local, 10, now.time);
    writeUint16LE(local, 12, now.date);
    writeUint32LE(local, 14, crc);
    writeUint32LE(local, 18, compressed.length);
    writeUint32LE(local, 22, data.length);
    writeUint16LE(local, 26, nameBytes.length);
    writeUint16LE(local, 28, 0);           // extra length
    nameBytes.copy(local, 30);

    entries.push({ nameBytes, crc, compressedSize: compressed.length, uncompressedSize: data.length, offset, now });
    parts.push(local, compressed);
    offset += local.length + compressed.length;
  }

  // Central directory
  const cdParts = [];
  let cdSize = 0;
  for (const e of entries) {
    const cd = Buffer.alloc(46 + e.nameBytes.length);
    writeUint32LE(cd, 0, 0x02014b50);    // signature
    writeUint16LE(cd, 4, 20);            // version made by
    writeUint16LE(cd, 6, 20);            // version needed
    writeUint16LE(cd, 8, 0);             // flags
    writeUint16LE(cd, 10, 8);            // compression
    writeUint16LE(cd, 12, e.now.time);
    writeUint16LE(cd, 14, e.now.date);
    writeUint32LE(cd, 16, e.crc);
    writeUint32LE(cd, 20, e.compressedSize);
    writeUint32LE(cd, 24, e.uncompressedSize);
    writeUint16LE(cd, 28, e.nameBytes.length);
    writeUint16LE(cd, 30, 0);            // extra length
    writeUint16LE(cd, 32, 0);            // comment length
    writeUint16LE(cd, 34, 0);            // disk number start
    writeUint16LE(cd, 36, 0);            // internal attrs
    writeUint32LE(cd, 38, 0);            // external attrs
    writeUint32LE(cd, 42, e.offset);     // local header offset
    e.nameBytes.copy(cd, 46);
    cdParts.push(cd);
    cdSize += cd.length;
  }

  // End of central directory
  const eocd = Buffer.alloc(22);
  writeUint32LE(eocd, 0, 0x06054b50);
  writeUint16LE(eocd, 4, 0);
  writeUint16LE(eocd, 6, 0);
  writeUint16LE(eocd, 8, entries.length);
  writeUint16LE(eocd, 10, entries.length);
  writeUint32LE(eocd, 12, cdSize);
  writeUint32LE(eocd, 16, offset);
  writeUint16LE(eocd, 20, 0);

  return Buffer.concat([...parts, ...cdParts, eocd]);
}

// Collect all copied .zwo files and zip them
function collectFiles(dir, base) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      result.push(...collectFiles(full, rel));
    } else if (entry.name.endsWith('.zwo')) {
      result.push({ name: rel, data: readFileSync(full) });
    }
  }
  return result;
}

console.log('Building zip...');
const zipFiles = collectFiles(DEST, '');
const zipData = buildZip(zipFiles);
import { writeFileSync } from 'fs';
writeFileSync(ZIP_OUT, zipData);
console.log(`  wrote: high-torque-workouts.zip (${zipFiles.length} files, ${(zipData.length / 1024).toFixed(1)} KB)`);
