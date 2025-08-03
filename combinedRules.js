
//combinedRules.js
const fs = require('fs');
const path = require('path');

// Adjust this path to your actual rules folder location, relative or absolute
const rulesFolder = path.resolve(__dirname, 'rules'); // assumes 'rules' folder is in same directory as script
const outputFile = path.resolve(__dirname, 'rules.json');

const allRules = [];

fs.readdirSync(rulesFolder).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(rulesFolder, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      const rule = JSON.parse(content);
      allRules.push(rule);
    } catch (e) {
      console.error(`Failed to parse ${file}:`, e);
    }
  }
});

fs.writeFileSync(outputFile, JSON.stringify(allRules, null, 2));
console.log('rules.json created with', allRules.length, 'rules.');
