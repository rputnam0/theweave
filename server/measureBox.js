const { displayWidth } = require('./displayWidth');

function measureBox(boxText) {
  const lines = boxText.split('\n');
  let maxCols = 0;
  for (const line of lines) {
    const width = displayWidth(line);
    if (width > maxCols) maxCols = width;
  }
  return { cols: maxCols, rows: lines.length };
}

module.exports = { measureBox };
