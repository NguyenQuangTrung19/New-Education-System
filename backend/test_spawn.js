const { spawn } = require('child_process');
const path = require('path');

async function run() {
    const scriptPath = path.join(__dirname, 'src', 'common', 'scheduler_core.py');
    console.log("Script path:", scriptPath);
    
    const pythonProcess = spawn('python', [scriptPath], { shell: true });
    
    pythonProcess.stdout.on('data', (d) => console.log('OUT:', d.toString()));
    pythonProcess.stderr.on('data', (d) => console.log('ERR:', d.toString()));
    
    pythonProcess.on('close', (c) => console.log('Close code:', c));
    pythonProcess.on('error', (e) => console.log('Spawn error:', e));

    pythonProcess.stdin.write(JSON.stringify({weeklyStructure: {days: 5, periodsPerDay: 8}, classes: [], teachers: []}));
    pythonProcess.stdin.end();
}
run();
