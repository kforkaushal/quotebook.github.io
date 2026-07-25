// searchWorker.js
// A Web Worker to perform non-blocking chunked search over 57 category JSON files

let categoryFiles = [];

self.onmessage = async function(e) {
  const { type, payload } = e.data;
  
  if (type === 'INIT') {
    categoryFiles = payload.files;
    self.postMessage({ type: 'READY' });
  } 
  else if (type === 'SEARCH') {
    const query = payload.query.toLowerCase();
    const batchSize = 3;
    let totalFound = 0;
    
    // We search chunks in parallel batches to prevent memory bloat and network bottleneck
    for (let i = 0; i < categoryFiles.length; i += batchSize) {
      const batch = categoryFiles.slice(i, i + batchSize);
      
      const promises = batch.map(async (fileUrl) => {
        try {
          const res = await fetch('../../' + fileUrl);
          if (!res.ok) return [];
          
          const data = await res.json();
          const quotes = data.quotes || [];
          
          return quotes.filter(q => {
            const text = (typeof q === 'string' ? q : (q.quote || '')).toLowerCase();
            const author = (typeof q === 'string' ? '' : (q.author || '')).toLowerCase();
            return text.includes(query) || author.includes(query);
          }).map(q => {
            if (typeof q === 'string') return { quote: q, author: 'Unknown', category: data.category || 'Unknown', tags: [] };
            return { quote: q.quote, author: q.author || 'Unknown', category: data.category || 'Unknown', tags: q.tags || [] };
          });
        } catch (err) {
          return [];
        }
      });
      
      const batchResults = await Promise.all(promises);
      let results = [];
      batchResults.forEach(r => results = results.concat(r));
      
      if (results.length > 0) {
        totalFound += results.length;
        self.postMessage({ 
          type: 'RESULTS', 
          payload: { results, isComplete: false }
        });
      }
    }
    
    self.postMessage({ type: 'RESULTS', payload: { results: [], isComplete: true, totalFound } });
  }
};
