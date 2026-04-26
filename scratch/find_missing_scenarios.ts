import { TRANSLATIONS } from './src/data/translations.ts';
import fs from 'fs';

const curriculumPath = './src/data/curriculum.ts';
const content = fs.readFileSync(curriculumPath, 'utf8');

const scenarioRegex = /getScenario\('([^']+)'(?:,\s*'([^']+)')?\)/g;
let match;
const missing = [];

while ((match = scenarioRegex.exec(content)) !== null) {
  const id = match[1];
  const arrayName = match[2] || 'scenarios';
  
  const deArray = TRANSLATIONS.de.curriculumData[arrayName] || [];
  const exists = deArray.find(s => s.id === id);
  
  if (!exists) {
    missing.push({ id, arrayName });
  }
}

console.log(JSON.stringify(missing, null, 2));
