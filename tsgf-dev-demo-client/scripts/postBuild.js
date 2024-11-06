const fs = require('fs');
const path = require('path');

// remove private / protected index.d.ts
(() => {
    let content = fs.readFileSync(path.resolve(__dirname, '../dist/index.d.ts'), 'utf-8');
    content = content.replace(/\r?\n\s*(private|protected)\s+_.+;/ig, '');
    content = content.replace(/\/\/\/ <reference types="node" \/>/ig, '');

    content = require('./copyright') + '\n' + content;

    fs.writeFileSync(path.resolve(__dirname, '../dist/index.d.ts'), content, 'utf-8');
})();

// replace __TSGF_VERSION__from index.js/mjs
[
    path.resolve(__dirname, '../dist/index.js'),
    path.resolve(__dirname, '../dist/index.mjs')
].forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf-8');
    content = content.replace('__TSGF_VERSION__', require('../package.json').version);;
    fs.writeFileSync(filepath, content, 'utf-8');
});