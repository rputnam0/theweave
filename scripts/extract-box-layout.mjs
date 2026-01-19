#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { displayWidth } from '../server/displayWidth.js';

const CONFIG_PATH = path.resolve(process.cwd(), 'boxes', 'boxes', 'boxes-config');
const OUTPUT_PATH = path.resolve(process.cwd(), 'src', 'components', 'ui', 'ascii', 'designLayout.json');

const ESCAPE_DEFAULT = '\\';
const DELIM_DEFAULT = '"';

const SIDE_SHAPES = {
  top: ['nw', 'nnw', 'n', 'nne', 'ne'],
  right: ['ne', 'ene', 'e', 'ese', 'se'],
  bottom: ['sw', 'ssw', 's', 'sse', 'se'],
  left: ['nw', 'wnw', 'w', 'wsw', 'sw'],
};

const stripAnsi = (value) => value.replace(/\x1b\[[0-9;]*m/g, '');

const isBlankLine = (value) => stripAnsi(value).trim().length === 0;

const extractStrings = (line, delim, escape) => {
  const results = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] !== delim) {
      i += 1;
      continue;
    }
    i += 1;
    let value = '';
    while (i < line.length) {
      const ch = line[i];
      if (ch === escape) {
        const next = line[i + 1];
        if (next === undefined) break;
        value += next;
        i += 2;
        continue;
      }
      if (ch === delim) {
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

const updatePadding = (padding, area, value) => {
  if (value < 0 || Number.isNaN(value)) return;
  switch (area) {
    case 'all':
    case 'a':
      padding.top = value;
      padding.right = value;
      padding.bottom = value;
      padding.left = value;
      break;
    case 'horizontal':
    case 'horiz':
    case 'h':
      padding.left = value;
      padding.right = value;
      break;
    case 'vertical':
    case 'vert':
    case 'v':
      padding.top = value;
      padding.bottom = value;
      break;
    case 'top':
    case 't':
      padding.top = value;
      break;
    case 'right':
    case 'r':
      padding.right = value;
      break;
    case 'bottom':
    case 'b':
      padding.bottom = value;
      break;
    case 'left':
    case 'l':
      padding.left = value;
      break;
    default:
      break;
  }
};

const parsePaddingLine = (line, padding) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return;
  for (let i = 0; i < parts.length - 1; i += 2) {
    const area = parts[i].toLowerCase();
    const value = Number(parts[i + 1]);
    updatePadding(padding, area, value);
  }
};

const parseShapesBuffer = (buffer, delim, escape) => {
  const match = buffer.match(/^\s*([a-z]{1,3})\s*\(/i);
  if (!match) return null;
  const shape = match[1].toLowerCase();
  const strings = extractStrings(buffer, delim, escape);
  return { shape, strings };
};

const measureShape = (strings) => {
  if (!strings.length) return { width: 0, height: 0, blank: true };
  let maxWidth = 0;
  let allBlank = true;
  for (const rawLine of strings) {
    const line = stripAnsi(rawLine);
    if (!isBlankLine(line)) allBlank = false;
    const width = displayWidth(line);
    if (width > maxWidth) maxWidth = width;
  }
  return { width: allBlank ? 0 : maxWidth, height: strings.length, blank: allBlank };
};

const file = fs.readFileSync(CONFIG_PATH, 'utf8');
const lines = file.split(/\r?\n/);

const layouts = {};
let currentNames = [];
let currentDelim = DELIM_DEFAULT;
let currentEscape = ESCAPE_DEFAULT;
let inShapes = false;
let inPadding = false;
let shapeBuffer = null;
let shapes = {};
let padding = { top: 0, right: 0, bottom: 0, left: 0 };

const flushDesign = () => {
  if (!currentNames.length) return;
  const sideWidths = {};
  const sideHeights = {};
  for (const side of Object.keys(SIDE_SHAPES)) {
    let maxWidth = 0;
    let maxHeight = 0;
    for (const shapeName of SIDE_SHAPES[side]) {
      const shape = shapes[shapeName];
      if (!shape) continue;
      if (shape.width > maxWidth) maxWidth = shape.width;
      if (shape.height > maxHeight) maxHeight = shape.height;
    }
    sideWidths[side] = maxWidth;
    sideHeights[side] = maxHeight;
  }
  const border = {
    top: sideHeights.top,
    right: sideWidths.right,
    bottom: sideHeights.bottom,
    left: sideWidths.left,
  };
  const paddingSnapshot = { ...padding };
  const borderSnapshot = { ...border };
  const contentInset = {
    top: borderSnapshot.top + paddingSnapshot.top,
    right: borderSnapshot.right + paddingSnapshot.right,
    bottom: borderSnapshot.bottom + paddingSnapshot.bottom,
    left: borderSnapshot.left + paddingSnapshot.left,
  };
  for (const name of currentNames) {
    layouts[name] = {
      border: borderSnapshot,
      padding: paddingSnapshot,
      contentInset,
    };
  }
};

const resetDesignState = () => {
  shapes = {};
  padding = { top: 0, right: 0, bottom: 0, left: 0 };
  shapeBuffer = null;
  currentDelim = DELIM_DEFAULT;
  currentEscape = ESCAPE_DEFAULT;
};

const updateDelimiter = (line) => {
  const match = line.match(/^\s*delim(?:iter)?\s+(.+)$/i);
  if (!match) return false;
  const chars = match[1].trim();
  if (chars.length >= 2) {
    currentEscape = chars[0];
    currentDelim = chars[1];
  }
  return true;
};

const splitShapeEntries = (input, delim, escape) => {
  const entries = [];
  let buffer = '';
  let depth = 0;
  let inString = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (inString) {
      buffer += ch;
      if (ch === escape) {
        const next = input[i + 1];
        if (next !== undefined) {
          buffer += next;
          i += 1;
        }
        continue;
      }
      if (ch === delim) {
        inString = false;
      }
      continue;
    }
    if (ch === delim) {
      inString = true;
      buffer += ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    buffer += ch;
    if (depth === 0 && ch === ')' && buffer.trim().length) {
      entries.push(buffer);
      buffer = '';
    }
  }
  return { entries, remainder: buffer };
};

for (const raw of lines) {
  const trimmed = raw.trim();
  if (updateDelimiter(trimmed)) {
    continue;
  }
  if (!trimmed || trimmed.startsWith('#')) continue;
  if (trimmed.startsWith('BOX ')) {
    flushDesign();
    resetDesignState();
    const nameMatch = trimmed.match(/^BOX\s+(.+)$/i);
    if (nameMatch) {
      const rawNames = nameMatch[1].trim();
      const parts = rawNames.split(',').map((part) => part.trim()).filter(Boolean);
      currentNames = parts.map((name) => {
        if (name.startsWith('"') && name.endsWith('"')) return name.slice(1, -1);
        return name;
      });
    }
    continue;
  }
  if (trimmed.startsWith('END ')) {
    flushDesign();
    currentNames = [];
    resetDesignState();
    inShapes = false;
    inPadding = false;
    continue;
  }

  if (!currentNames.length) continue;

  if (trimmed.startsWith('shapes')) {
    const inlineMatch = raw.match(/\{([^}]*)\}/);
    if (inlineMatch) {
      const { entries } = splitShapeEntries(inlineMatch[1], currentDelim, currentEscape);
      for (const entry of entries) {
        const parsed = parseShapesBuffer(entry, currentDelim, currentEscape);
        if (parsed) shapes[parsed.shape] = measureShape(parsed.strings);
      }
      continue;
    }
    inShapes = true;
    inPadding = false;
    continue;
  }
  if (inShapes && trimmed.startsWith('}')) {
    inShapes = false;
    continue;
  }
  if (trimmed.startsWith('padding')) {
    const inlineMatch = trimmed.match(/padding\\s*\\{([^}]*)\\}/i);
    if (inlineMatch) {
      parsePaddingLine(inlineMatch[1], padding);
      continue;
    }
    inPadding = true;
    inShapes = false;
    continue;
  }
  if (inPadding && trimmed.startsWith('}')) {
    inPadding = false;
    continue;
  }

  if (inPadding) {
    parsePaddingLine(raw, padding);
    continue;
  }

  if (!inShapes) continue;

  if (!shapeBuffer) {
    shapeBuffer = raw;
  } else {
    shapeBuffer += `\n${raw}`;
  }

  const { entries, remainder } = splitShapeEntries(shapeBuffer, currentDelim, currentEscape);
  for (const entry of entries) {
    const parsed = parseShapesBuffer(entry, currentDelim, currentEscape);
    if (parsed) {
      shapes[parsed.shape] = measureShape(parsed.strings);
    }
  }
  shapeBuffer = remainder || null;
}

flushDesign();

const inlinePadding = new Map();
let inlineNames = [];
let inlinePaddingValue = null;
let inlineHasValue = false;

const resetInline = () => {
  inlineNames = [];
  inlinePaddingValue = null;
  inlineHasValue = false;
};

for (const raw of lines) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  if (trimmed.startsWith('BOX ')) {
    const nameMatch = trimmed.match(/^BOX\s+(.+)$/i);
    if (nameMatch) {
      const rawNames = nameMatch[1].trim();
      const parts = rawNames.split(',').map((part) => part.trim()).filter(Boolean);
      inlineNames = parts.map((name) => {
        if (name.startsWith('"') && name.endsWith('"')) return name.slice(1, -1);
        return name;
      });
      inlinePaddingValue = { top: 0, right: 0, bottom: 0, left: 0 };
      inlineHasValue = false;
    }
    continue;
  }
  if (trimmed.startsWith('END ')) {
    if (inlineNames.length && inlinePaddingValue && inlineHasValue) {
      for (const name of inlineNames) {
        inlinePadding.set(name, inlinePaddingValue);
      }
    }
    resetInline();
    continue;
  }
  if (!inlineNames.length || !inlinePaddingValue) continue;
  const inlineMatch = trimmed.match(/padding\s*\{([^}]*)\}/i);
  if (inlineMatch) {
    parsePaddingLine(inlineMatch[1], inlinePaddingValue);
    inlineHasValue = true;
  }
}

for (const [name, paddingValue] of inlinePadding.entries()) {
  const layout = layouts[name];
  if (!layout) continue;
  layout.padding = { ...paddingValue };
  layout.contentInset = {
    top: layout.border.top + paddingValue.top,
    right: layout.border.right + paddingValue.right,
    bottom: layout.border.bottom + paddingValue.bottom,
    left: layout.border.left + paddingValue.left,
  };
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
console.log(`Wrote ${OUTPUT_PATH} (${Object.keys(layouts).length} designs).`);
