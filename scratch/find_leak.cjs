
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\abhij\\OneDrive\\Documents\\DriveDE\\src\\data\\translations.ts', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let bracketCount = 0;
let inString = false;
let stringChar = '';

for (let i = 0; i < 3890; i++) {
  const line = lines[i];
  if (line === undefined) continue;
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    
    // Handle escape
    if (char === '\\') {
       j++; // Skip next char
       continue;
    }
    
    if (char === "'" || char === '"') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (stringChar === char) {
        inString = false;
      }
    }
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }
  }
  
  if (i + 1 > 2963 && i + 1 < 3800) {
    if (braceCount < 6) {
       console.log(`ALERT: Brace count dropped to ${braceCount} at line ${i + 1}: ${line.trim()}`);
       process.exit(0);
    }
  }
}
console.log("Done. No drops below 6 found in the range.");
