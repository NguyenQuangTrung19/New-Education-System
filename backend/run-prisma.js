const { spawnSync } = require('child_process');
const result = spawnSync('npx.cmd', ['prisma', 'generate'], { encoding: 'utf-8', shell: true });
console.log('STDOUT:\n', result.stdout);
console.log('STDERR:\n', result.stderr);
if (result.error) console.log('ERROR:\n', result.error);
