const { renderBox } = require('./boxesRenderer');

async function main() {
  const result = await renderBox({
    text: 'Hello parchment',
    design: 'parchment',
    configPath: process.env.BOXES_CONFIG_PATH,
    configVersion: 'local',
  });

  process.stdout.write(result.boxText);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
