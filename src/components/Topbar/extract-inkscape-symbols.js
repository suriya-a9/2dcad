import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const symbolsDir = path.join(__dirname, 'inkscape-symbols');
const outputFile = path.join(__dirname, 'inkscape-symbol-sets.json');

const symbolSets = {};

fs.readdirSync(symbolsDir).forEach(file => {
    if (!file.endsWith('.svg')) return;
    const setName = path.basename(file, '.svg').replace(/_/g, ' ');
    const svgContent = fs.readFileSync(path.join(symbolsDir, file), 'utf8');
    const dom = new JSDOM(svgContent, { contentType: "image/svg+xml" });
    const doc = dom.window.document;
    const symbols = Array.from(doc.querySelectorAll('symbol'));
    symbolSets[setName] = symbols.map(symbol => {
        const name = symbol.getAttribute('id') || 'unnamed';
        const viewBox = symbol.getAttribute('viewBox') || '0 0 32 32';
        return {
            name,
            svg: `<svg viewBox="${viewBox}" width="32" height="32">${symbol.innerHTML}</svg>`
        };
    });
});

fs.writeFileSync(outputFile, JSON.stringify(symbolSets, null, 2));
console.log(`Extracted ${Object.keys(symbolSets).length} symbol sets to ${outputFile}`);