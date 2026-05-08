const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint_results.json', 'utf8'));

const errors = [];
results.forEach(file => {
    file.messages.forEach(msg => {
        if (msg.severity === 2) { // 2 = error
            errors.push({
                file: file.filePath,
                line: msg.line,
                rule: msg.ruleId,
                message: msg.message
            });
        }
    });
});

console.log(`Total Errors: ${errors.length}`);
errors.slice(0, 50).forEach(err => {
    console.log(`${err.file}:${err.line} - ${err.rule}: ${err.message}`);
});
