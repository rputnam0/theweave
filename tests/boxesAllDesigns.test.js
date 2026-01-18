const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { renderBox, getAllowedDesigns } = require('../server/boxesRenderer');

const CONFIG_PATH = path.resolve(__dirname, '..', 'boxes', 'boxes', 'boxes-config');

test('renderBox supports all configured designs', { timeout: 20000 }, async () => {
  const designs = getAllowedDesigns();
  assert.ok(designs.length >= 70, 'expected most designs to be available');
  for (const design of designs) {
    const { boxText } = await renderBox({
      text: 'demo',
      design,
      configPath: CONFIG_PATH,
      configVersion: 'test',
    });
    assert.ok(boxText.length > 0, `no output for ${design}`);
  }
});
