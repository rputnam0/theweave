#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const CONFIG_PATH = path.resolve(process.cwd(), 'boxes', 'boxes', 'boxes-config');
const OUTPUT_PATH = path.resolve(process.cwd(), 'src', 'components', 'ui', 'ascii', 'designSamples.json');

const file = fs.readFileSync(CONFIG_PATH, 'utf8');
const lines = file.split(/\r?\n/);

const samples = {};
let current = [];
let inSample = false;
let buffer = [];

const flushSample = () => {
  if (!current.length || !buffer.length) return;
  const nonEmpty = buffer.filter((line) => line.trim().length > 0);
  const minIndent = nonEmpty.length
    ? Math.min(...nonEmpty.map((line) => (line.match(/^(\s*)/)?.[1].length ?? 0)))
    : 0;
  const trimmed = buffer.map((line) => line.slice(minIndent));
  for (const name of current) {
    samples[name] = trimmed.join('\n');
  }
  buffer = [];
};

for (const raw of lines) {
  const line = raw.trim();
  if (line.startsWith('BOX ')) {
    flushSample();
    const nameMatch = line.match(/^BOX\s+(.+)$/);
    if (nameMatch) {
      const raw = nameMatch[1].trim();
      const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
      current = parts.map((name) => {
        if (name.startsWith('"') && name.endsWith('"')) return name.slice(1, -1);
        return name;
      });
    }
    continue;
  }
  if (line.startsWith('END ')) {
    flushSample();
    current = [];
    inSample = false;
    continue;
  }
  if (!current.length) continue;
  if (line === 'sample') {
    inSample = true;
    buffer = [];
    continue;
  }
  if (line === 'ends') {
    inSample = false;
    flushSample();
    continue;
  }
  if (inSample) {
    buffer.push(raw);
  }
}

flushSample();

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(samples, null, 2) + '\n', 'utf8');
console.log(`Wrote ${OUTPUT_PATH} (${Object.keys(samples).length} samples).`);
