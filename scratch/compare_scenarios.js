import fs from 'fs';

const oldCurriculumPath = './scratch/old_curriculum.ts';
const currentTranslationsPath = './src/data/translations.ts';

const oldContent = fs.readFileSync(oldCurriculumPath, 'utf8');
const currentContent = fs.readFileSync(currentTranslationsPath, 'utf8');

// Regex to find all scenario IDs in old content
// Look for id: 'some-id' inside an object that has titleDe/titleEn
const scenarioIdRegex = /id:\s*'([a-z0-9-]+)'/g;
const oldIds = new Set();
let match;

while ((match = scenarioIdRegex.exec(oldContent)) !== null) {
  const id = match[1];
  // Filter for scenario-like IDs (they usually have prefixes like park-, city-, hwy-, merge-, etc.)
  if (id.includes('-') && !id.startsWith('tip') && !id.startsWith('glossary') && !id.startsWith('cmd') && !id.startsWith('quiz')) {
    oldIds.add(id);
  }
}

const missing = [];
for (const id of oldIds) {
  if (!currentContent.includes(`id: '${id}'`)) {
    missing.push(id);
  }
}

console.log("Found " + oldIds.size + " potential scenario IDs in old curriculum.");
console.log("Missing IDs: " + JSON.stringify(missing, null, 2));
