
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\abhij\\OneDrive\\Documents\\DriveDE\\src\\data\\translations.ts', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let inString = false;
let stringChar = '';
let inComment = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line === undefined) continue;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j+1];
    if (!inString && !inComment && char === '/' && nextChar === '*') { inComment = true; j++; continue; }
    if (inComment && char === '*' && nextChar === '/') { inComment = false; j++; continue; }
    if (inComment) continue;
    if (!inString && char === '/' && nextChar === '/') { break; }
    if (char === '\\') { j++; continue; }
    if (char === "'" || char === '"') {
      if (!inString) { inString = true; stringChar = char; }
      else if (stringChar === char) { inString = false; }
    }
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
  }
  
  if (i + 1 === 3444) {
     console.log(`Line 3444 count=${braceCount}: ${line.trim()}`);
  }
}
