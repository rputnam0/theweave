const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { renderBox, _internal } = require('../server/boxesRenderer');

const CONFIG_PATH = path.resolve(__dirname, '..', 'boxes', 'boxes', 'boxes-config');

test('normalizePadding builds the correct spec', () => {
  assert.equal(_internal.normalizePadding({ top: 2, right: 3, bottom: 2, left: 3 }), 't2r3b2l3');
  assert.equal(_internal.normalizePadding({ top: 1 }), 't1');
  assert.equal(_internal.normalizePadding(null), null);
});

test('normalizeSize builds the correct spec', () => {
  assert.equal(_internal.normalizeSize({ cols: 40, rows: 7 }), '40x7');
  assert.equal(_internal.normalizeSize({ cols: 40 }), '40');
  assert.equal(_internal.normalizeSize({ rows: 7 }), 'x7');
  assert.equal(_internal.normalizeSize(null), null);
});

test('renderBox returns expected parchment output', async () => {
  const { boxText } = await renderBox({
    text: 'Hello parchment',
    design: 'parchment',
    configPath: CONFIG_PATH,
    configVersion: 'test',
  });

  const expected = [
    ' ___________________',
    '/\\                  \\',
    '\\_| Hello parchment |',
    '  |                 |',
    '  |   ______________|_',
    '   \\_/________________/',
  ].join('\n');

  assert.equal(boxText, expected);
});
