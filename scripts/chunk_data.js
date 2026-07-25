const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const inputFile = path.join(dataDir, 'quotes_8000_plus.json');
const categoryDir = path.join(dataDir, 'category_quotes');

if (!fs.existsSync(inputFile)) {
  console.error("Input file not found:", inputFile);
  process.exit(1);
}

if (!fs.existsSync(categoryDir)) {
  fs.mkdirSync(categoryDir, { recursive: true });
}

console.log("Reading 55MB JSON file...");
const rawData = fs.readFileSync(inputFile, 'utf8');
const dataObj = JSON.parse(rawData);

const categoriesMap = dataObj.categories || {};
const metadata = { categories: {} };

console.log("Chunking data...");
for (const catName in categoriesMap) {
  const catObj = categoriesMap[catName];
  if (catObj && Array.isArray(catObj.quotes)) {
    // Generate a sanitized filename for the category
    const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catFile = path.join(categoryDir, `${catSlug}.json`);
    
    // Write out the category file
    fs.writeFileSync(catFile, JSON.stringify({ category: catName, quotes: catObj.quotes }), 'utf8');
    
    // Add lightweight info to metadata index
    metadata.categories[catName] = {
      count: catObj.quotes.length,
      file: `data/category_quotes/${catSlug}.json`
    };
  }
}

// Write the metadata index file
const metaFile = path.join(dataDir, 'metadata.json');
fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 2), 'utf8');

console.log(`Successfully generated metadata and ${Object.keys(metadata.categories).length} category chunks.`);
