#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const CONFIG_PATH = path.resolve(process.cwd(), 'boxes', 'boxes', 'boxes-config');
const OUTPUT_PATH = path.resolve(process.cwd(), 'src', 'components', 'ui', 'ascii', 'designGlyphs.json');

const file = fs.readFileSync(CONFIG_PATH, 'utf8');
const lines = file.split(/\r?\n/);

const designs = new Map();
let current = [];
let inShapes = false;

const addGlyphs = (designsList, text) => {
  if (!designsList.length || !text) return;
  for (const design of designsList) {
    const set = designs.get(design) || new Set();
    for (const ch of text) {
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') continue;
      set.add(ch);
    }
    designs.set(design, set);
  }
};

const extractQuoted = (line) => {
  const results = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] !== '"') {
      i += 1;
      continue;
    }
    i += 1;
    let value = '';
    while (i < line.length) {
      const ch = line[i];
      if (ch === '\\') {
        const next = line[i + 1];
        if (next === undefined) break;
        value += next;
        i += 2;
        continue;
      }
      if (ch === '"') {
        i += 1;
        break;
      }
      value += ch;
      i += 1;
    }
    results.push(value);
  }
  return results;
};

for (const raw of lines) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  if (line.startsWith('BOX ')) {
    const nameMatch = line.match(/^BOX\s+(.+)$/);
    if (nameMatch) {
      const raw = nameMatch[1].trim();
      const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
      current = parts.map((name) => {
        if (name.startsWith('"') && name.endsWith('"')) return name.slice(1, -1);
        return name;
      });
      for (const name of current) {
        if (!designs.has(name)) designs.set(name, new Set());
      }
    }
    continue;
  }
  if (line.startsWith('END ')) {
    current = [];
    inShapes = false;
    continue;
  }
  if (!current.length) continue;
  if (line.startsWith('shapes')) {
    inShapes = true;
    continue;
  }
  if (inShapes && line.startsWith('}')) {
    inShapes = false;
    continue;
  }
  if (!inShapes) continue;
  const strings = extractQuoted(raw);
  for (const value of strings) addGlyphs(current, value);
}

const output = {};
for (const [design, set] of designs.entries()) {
  output[design] = Array.from(set).sort().join('');
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`Wrote ${OUTPUT_PATH} (${Object.keys(output).length} designs).`);
