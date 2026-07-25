const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/quotes_collection.json', 'utf8'));

for (const catKey in data.categories) {
  const category = data.categories[catKey];
  for (const subKey in category.subcategories) {
    const quotesList = category.subcategories[subKey];
    category.subcategories[subKey] = quotesList.map(q => {
      if (typeof q === 'object' && q !== null) {
        if (!q.author) q.author = 'Quotebook Studio';
        return q;
      }
      if (typeof q === 'string') {
        return {
          quote: q,
          author: 'Quotebook Studio'
        };
      }
      return q;
    });
  }
}

fs.writeFileSync('data/quotes_collection.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Processed quotes_collection.json successfully.');
