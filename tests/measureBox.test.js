const test = require('node:test');
const assert = require('node:assert/strict');

const { measureBox } = require('../server/measureBox');

test('measureBox counts display width for unicode', () => {
  const sample = 'A🙂B\n界界';
  const measured = measureBox(sample);
  assert.equal(measured.cols, 4);
  assert.equal(measured.rows, 2);
});
