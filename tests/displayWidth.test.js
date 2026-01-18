const test = require('node:test');
const assert = require('node:assert/strict');

const { displayWidth } = require('../server/displayWidth');

test('displayWidth counts ASCII', () => {
  assert.equal(displayWidth('hello'), 5);
});

test('displayWidth treats combining marks as zero width', () => {
  assert.equal(displayWidth('a\u0301'), 1);
});

test('displayWidth treats CJK and emoji as double width', () => {
  assert.equal(displayWidth('界'), 2);
  assert.equal(displayWidth('🙂'), 2);
});
