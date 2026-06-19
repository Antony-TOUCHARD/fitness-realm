const fs = require('fs');
const readline = require('readline');

const filePath = 'C:\\Users\\anton\\Desktop\\fitness-realm\\app\\(game)\\profile\\page.tsx';

const rl = readline.createInterface({
  input: fs.createReadStream(filePath),
  output: process.stdout,
  terminal: false
});

let lineNum = 0;
rl.on('line', (line) => {
  lineNum++;
  if (line.includes('w.completed') || line.includes('adaptationReport') || line.includes('associatedWorkoutId') || line.includes('targetPace')) {
    console.log(`${lineNum}: ${line}`);
  }
});
