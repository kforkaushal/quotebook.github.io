/**
 * gallery.js - Isolated logic for the Quotes Gallery
 */

let allGalleryQuotes = [];
let currentRenderIndex = 0;
const CHUNK_SIZE = 60; // How many to load per click

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('galleryGrid');
  const loadMoreBtn = document.getElementById('btnLoadMore');
  const loadMoreContainer = document.getElementById('loadMoreContainer');
  
  try {
    // 1. Fetch Multiple Quotes Datasets
    const [featRes, colRes, socialRes] = await Promise.all([
      fetch('../data/featured_quotes.json').catch(() => null),
      fetch('../data/quotes_collection.json').catch(() => null),
      fetch('../data/social_media_quotes.json').catch(() => null)
    ]);
    
    const datasets = await Promise.all([
      featRes ? featRes.json() : {},
      colRes ? colRes.json() : {},
      socialRes ? socialRes.json() : {}
    ]);
    
    let combinedQuotes = [];
    
    // Parse all datasets
    datasets.forEach(data => {
      if (!data) return;
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          if (cat.quotes) combinedQuotes.push(...cat.quotes);
        });
      } else if (data.quotes) {
        combinedQuotes.push(...data.quotes);
      } else if (Array.isArray(data)) {
        combinedQuotes.push(...data);
      }
    });
    
    // Filter out very long quotes and dedup simple ones
    combinedQuotes = combinedQuotes.filter(q => q && q.quote && q.quote.length > 10 && q.quote.length <= 180);
    
    // Shuffle the massive pool
    allGalleryQuotes = combinedQuotes.sort(() => 0.5 - Math.random());

    grid.innerHTML = ''; // Clear loading state
    
    // Initial Render
    renderNextChunk(grid, loadMoreContainer);
    
    // Load More listener
    loadMoreBtn.addEventListener('click', () => {
      renderNextChunk(grid, loadMoreContainer);
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="loading-state" style="color:var(--gallery-accent)">
      <i class="fa-solid fa-triangle-exclamation"></i> Error loading gallery. Please try again later.
    </div>`;
  }
});

function renderNextChunk(grid, loadMoreContainer) {
  const nextChunk = allGalleryQuotes.slice(currentRenderIndex, currentRenderIndex + CHUNK_SIZE);
  
  nextChunk.forEach((q, i) => {
    // We use a globally unique index so the picsum seed doesn't repeat per chunk
    const globalIndex = currentRenderIndex + i;
    const bgImg = `https://picsum.photos/seed/gallery_picsum_${globalIndex}/800/1000`;
    
    const card = document.createElement('article');
    card.className = 'quote-card';
    card.style.padding = '0';
    card.style.gap = '0';
    
    card.innerHTML = `
      <div class="post-media" style="background-image: url('${bgImg}')">
        <div class="quote-watermark">&ldquo;</div>
        <div class="quote-content">
          <div class="quote-text">"${q.quote}"</div>
          <div class="quote-author">&mdash; ${q.author || 'Unknown'}</div>
        </div>
      </div>
      <div class="quote-card-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border-light); background: var(--bg-card); justify-content: space-between;">
        <button class="icon-btn-text share-btn" title="Share Poster" aria-label="Share Poster">
          <i class="fa-solid fa-share-nodes"></i> <span>Share</span>
        </button>
        <button class="icon-btn-text highlight download-btn" title="Download Poster" aria-label="Download Poster">
          <i class="fa-solid fa-download"></i> <span>Download</span>
        </button>
      </div>
    `;
    
    // Download Handler
    const dlBtn = card.querySelector('.download-btn');
    dlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCanvasAction(q.quote, q.author, bgImg, dlBtn, 'download');
    });
    
    // Share Handler
    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCanvasAction(q.quote, q.author, bgImg, shareBtn, 'share');
    });
    
    grid.appendChild(card);
  });
  
  currentRenderIndex += CHUNK_SIZE;
  
  // Toggle Load More button visibility
  if (currentRenderIndex >= allGalleryQuotes.length || currentRenderIndex > 1000) {
    loadMoreContainer.style.display = 'none';
  } else {
    loadMoreContainer.style.display = 'block';
    // Remove "hidden" if it had it initially
    loadMoreContainer.classList.remove('hidden');
  }
}

// Master function for handling Canvas generation, then either downloading or sharing
function handleCanvasAction(text, author, imageUrl, btnElement, actionType) {
  if (!imageUrl) {
    alert("Image is still loading, please wait a moment.");
    return;
  }
  
  // Visual feedback
  const originalIcon = btnElement.innerHTML;
  btnElement.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
  
  const canvas = document.getElementById('downloadCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 1080;
  canvas.height = 1350;
  
  const img = new Image();
  img.crossOrigin = "Anonymous";
  
  img.onload = async () => {
    // 1. Background
    drawCoverImage(ctx, img, canvas.width, canvas.height);
    
    // 2. Glass Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 3. Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = 'italic 400px "Cormorant Garamond", serif';
    ctx.textAlign = 'left';
    ctx.fillText('“', 100, 450);
    
    // 4. Quote Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    let fontSize = 75;
    let lineHeight = 95;
    if (text.length > 100) {
      fontSize = 60;
      lineHeight = 80;
    }
    if (text.length > 150) {
      fontSize = 50;
      lineHeight = 65;
    }
    
    ctx.font = `italic ${fontSize}px "Cormorant Garamond", serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    const maxWidth = 900;
    const lines = wrapText(ctx, `"${text}"`, maxWidth);
    
    let y = (canvas.height / 2) - ((lines.length * lineHeight) / 2) - 30;
    
    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, y);
      y += lineHeight;
    });
    
    // 5. Author
    y += 50;
    ctx.font = '600 45px "Outfit", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.shadowBlur = 8;
    ctx.fillText(`— ${author || 'Unknown'}`, canvas.width / 2, y);
    
    // 6. Branding
    ctx.font = '500 30px "Outfit", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 4;
    ctx.letterSpacing = '2px';
    ctx.fillText('quotebook.me', canvas.width / 2, canvas.height - 60);
    
    // Perform Action
    try {
      if (actionType === 'share') {
        await executeShare(canvas, text);
      } else {
        executeDownload(canvas, author);
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong handling the image.");
    }
    
    btnElement.innerHTML = originalIcon;
  };
  
  img.onerror = () => {
    alert("Failed to load the background image for rendering.");
    btnElement.innerHTML = originalIcon;
  };
  
  img.src = imageUrl;
}

// Perform Native Share (Web Share API)
async function executeShare(canvas, text) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return reject("Canvas empty");
      
      const file = new File([blob], 'quotebook-poster.png', { type: 'image/png' });
      const shareData = {
        title: 'Quotebook Poster',
        text: `"${text}" \n\nCreate your own free posters at https://quotebook.me`,
        files: [file]
      };
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share(shareData);
          resolve();
        } catch (err) {
          // User aborted or error
          if (err.name !== 'AbortError') {
            console.error(err);
            fallbackDownload(canvas, "Shared-Quote");
          }
          resolve();
        }
      } else {
        // Fallback for desktop browsers that don't support file sharing
        alert("Native sharing is not supported on this browser. The poster will be downloaded instead, and text copied to your clipboard!");
        fallbackDownload(canvas, "Quotebook-Poster");
        navigator.clipboard.writeText(shareData.text).catch(console.error);
        resolve();
      }
    }, 'image/png');
  });
}

function executeDownload(canvas, author) {
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `Quotebook-${(author || 'Quote').replace(/[^a-z0-9]/gi, '_')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function fallbackDownload(canvas, filename) {
  executeDownload(canvas, filename);
}

// Utility: Draw Cover
function drawCoverImage(ctx, img, w, h) {
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let renderW, renderH, x, y;
  
  if (imgRatio < canvasRatio) {
    renderW = w;
    renderH = w / imgRatio;
    x = 0;
    y = (h - renderH) / 2;
  } else {
    renderW = h * imgRatio;
    renderH = h;
    x = (w - renderW) / 2;
    y = 0;
  }
  
  ctx.drawImage(img, x, y, renderW, renderH);
}

// Utility: Wrap text
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
