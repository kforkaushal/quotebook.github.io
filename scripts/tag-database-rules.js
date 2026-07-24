const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'quotes_8000_plus.json');
const outPath = path.join(__dirname, '..', 'data', 'quotes_enriched.json');

console.log('Reading raw database from:', jsonPath);
const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const categories = raw.categories || {};

console.log('Enriching quotes with metadata rules...');
let idCounter = 1;

// Keywords for regex
const relRegex = /\b(girlfriend|boyfriend|husband|wife|brother|sister|mother|mom|father|dad|best friend|friend|dost|boss|teacher|colleague|coworker)\b/i;
const occasionRegex = /\b(birthday|birth day|anniversary|wedding|marry|marriage|farewell|graduation|graduate|good morning|morning|good night|night|new year)\b/i;
const toneRegex = /\b(funny|joke|laugh|hilarious|romantic|love|kiss|heart|beloved|sad|cry|tears|grief|pain|broken|savage|attitude|own|style|boss|inspire|motivate|dream|success|achieve|strive|work)\b/i;
const wishRegex = /\b(wish|wishing|may your|congrats|congratulations|hope you have|happy birthday|happy anniversary|good morning|good night)\b/i;
const shayarRegex = /\b(dil|pyaar|mohabbat|zindagi|dost|humsafar|ishq|pyar|tamanna|khushi|wafa|dard)\b/i;

Object.keys(categories).forEach(catName => {
  const catObj = categories[catName];
  const quotes = catObj.quotes || [];
  
  quotes.forEach(q => {
    const text = q.quote || '';
    const lowerText = text.toLowerCase();
    
    // 1. Generate unique ID
    q.id = 'q_' + String(idCounter).padStart(6, '0');
    idCounter++;
    
    // 2. Word count and length
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    let length = 'Medium';
    if (wordCount < 10) length = 'Short';
    else if (wordCount > 35) length = 'Long';
    
    q.wordCount = wordCount;
    q.length = length;
    
    // 3. Default language and format
    let language = 'en';
    let format = 'Quote';
    
    if (shayarRegex.test(lowerText)) {
      language = 'hi-Latn'; // Hinglish
      format = 'Shayari';
    } else if (wishRegex.test(lowerText)) {
      format = 'Wish';
    } else if (wordCount <= 15 && lowerText.includes('#')) {
      format = 'Caption';
    }
    
    q.language = language;
    q.format = format;
    
    // 4. Occasion
    let occasion = 'General';
    if (catName === 'Birthday' || /\b(birthday|birth day)\b/i.test(lowerText)) occasion = 'Birthday';
    else if (/\banniversary\b/i.test(lowerText)) occasion = 'Anniversary';
    else if (/\b(wedding|marry|marriage)\b/i.test(lowerText)) occasion = 'Wedding';
    else if (/\bfarewell\b/i.test(lowerText)) occasion = 'Farewell';
    else if (/\b(graduation|graduate)\b/i.test(lowerText)) occasion = 'Graduation';
    else if (/\b(good morning|morning)\b/i.test(lowerText)) occasion = 'Good Morning';
    else if (/\b(good night|night)\b/i.test(lowerText)) occasion = 'Good Night';
    else if (/\b(new year)\b/i.test(lowerText)) occasion = 'New Year';
    
    q.occasion = occasion;
    
    // 5. Relationship
    let relationship = 'General';
    if (/\bgirlfriend\b/i.test(lowerText)) relationship = 'Girlfriend';
    else if (/\bboyfriend\b/i.test(lowerText)) relationship = 'Boyfriend';
    else if (/\bhusband\b/i.test(lowerText)) relationship = 'Husband';
    else if (/\bwife\b/i.test(lowerText)) relationship = 'Wife';
    else if (/\bbrother\b/i.test(lowerText)) relationship = 'Brother';
    else if (/\bsister\b/i.test(lowerText)) relationship = 'Sister';
    else if (/\b(mother|mom)\b/i.test(lowerText)) relationship = 'Mother';
    else if (/\b(father|dad)\b/i.test(lowerText)) relationship = 'Father';
    else if (/\bbest friend\b/i.test(lowerText)) relationship = 'Best Friend';
    else if (/\b(friend|dost)\b/i.test(lowerText)) relationship = 'Friend';
    else if (/\bboss\b/i.test(lowerText)) relationship = 'Boss';
    else if (/\bteacher\b/i.test(lowerText)) relationship = 'Teacher';
    else if (/\b(colleague|coworker)\b/i.test(lowerText)) relationship = 'Colleague';
    
    q.relationship = relationship;
    
    // 6. Tones
    const tones = [];
    if (catName === 'Humor' || /\b(funny|joke|laugh|hilarious)\b/i.test(lowerText)) tones.push('Funny');
    if (catName === 'Love' || /\b(romantic|love|kiss|heart|beloved)\b/i.test(lowerText)) tones.push('Romantic');
    if (/\b(sad|cry|tears|grief|pain|broken)\b/i.test(lowerText)) tones.push('Sad');
    if (/\b(savage|attitude|own|style|boss)\b/i.test(lowerText)) tones.push('Savage/Attitude');
    if (catName === 'Success' || /\b(inspire|motivate|dream|success|achieve|strive|work)\b/i.test(lowerText)) tones.push('Inspirational');
    
    if (tones.length === 0) tones.push('Deep');
    
    q.tone = tones;
  });
});

console.log('Writing enriched database to:', outPath);
fs.writeFileSync(outPath, JSON.stringify(raw, null, 2), 'utf8');
console.log('Enrichment completed successfully! Tagged', idCounter - 1, 'quotes.');
