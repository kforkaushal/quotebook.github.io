/**
 * QUOTEBOOK POSTER STUDIO - HTML5 Canvas Image Generator
 */

class PosterStudio {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.quote = {
      text: "The man who does not read has no advantage over the man who cannot read.",
      author: "Mark Twain",
      category: "Books & Reading"
    };
    
    this.bgImage = null;
    this.overlayType = 'light-glass'; // light-glass, warm-sun, soft-rose, serene-teal, dark-contrast
    this.fontFamily = 'Cormorant Garamond';
    this.aspectRatio = '1:1'; // 1:1, 4:5, 16:9
    
    this.dimensionMap = {
      '1:1': { width: 1080, height: 1080 },
      '4:5': { width: 1080, height: 1350 },
      '16:9': { width: 1920, height: 1080 }
    };
  }

  setQuote(text, author, category) {
    this.quote = { text, author, category };
    this.render();
  }

  setBgImage(imageUrl) {
    if (!imageUrl) {
      this.bgImage = null;
      this.render();
      return;
    }
    
    const loader = document.getElementById('canvasLoader');
    if (loader) loader.classList.remove('hidden');
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      this.bgImage = img;
      if (loader) loader.classList.add('hidden');
      this.render();
    };
    img.onerror = () => {
      console.warn("Failed to load background image, using fallback gradient");
      this.bgImage = null;
      if (loader) loader.classList.add('hidden');
      this.render();
    };
    img.src = imageUrl;
  }

  setOverlay(overlayType) {
    this.overlayType = overlayType;
    this.render();
  }

  setFont(fontFamily) {
    this.fontFamily = fontFamily;
    this.render();
  }

  setRatio(ratio) {
    if (this.dimensionMap[ratio]) {
      this.aspectRatio = ratio;
      const dims = this.dimensionMap[ratio];
      this.canvas.width = dims.width;
      this.canvas.height = dims.height;
      this.render();
    }
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Clear Canvas
    this.ctx.clearRect(0, 0, w, h);

    // 1. Draw Background Image or Fallback Gradient
    if (this.bgImage) {
      this.drawCoverImage(this.bgImage, w, h);
    } else {
      const grad = this.ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#FAF6F0'); // --paper-50
      grad.addColorStop(0.5, '#F1E9DD'); // --paper-100
      grad.addColorStop(1, '#FBF0E6'); // --orange-50
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    }

    // 2. Draw Overlay Tint / Glassmorphism
    this.drawOverlay(w, h);

    // 3. Draw Decorative Frame / Watermark
    this.drawDecorations(w, h);

    // 4. Draw Quote Typography & Author
    this.drawTextContent(w, h);
  }

  drawCoverImage(img, canvasW, canvasH) {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasW / canvasH;
    let renderW, renderH, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      renderH = canvasH;
      renderW = canvasH * imgRatio;
      offsetX = (canvasW - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = canvasW;
      renderH = canvasW / imgRatio;
      offsetX = 0;
      offsetY = (canvasH - renderH) / 2;
    }

    this.ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  drawOverlay(w, h) {
    this.ctx.save();
    
    switch (this.overlayType) {
      case 'light-glass':
        this.ctx.fillStyle = 'rgba(250, 246, 240, 0.90)'; // --paper-50 at high opacity
        break;
      case 'warm-sun': // Terracotta Warm
        this.ctx.fillStyle = 'rgba(243, 220, 201, 0.88)'; // --orange-100 at 88%
        break;
      case 'soft-rose': // Soft Clay
        this.ctx.fillStyle = 'rgba(227, 165, 121, 0.50)'; // desaturated tint of --orange-300
        break;
      case 'serene-teal': // Serene Teal
        this.ctx.fillStyle = 'rgba(217, 237, 234, 0.88)'; // --teal-100 at 88%
        break;
      case 'dark-contrast':
        this.ctx.fillStyle = 'rgba(33, 29, 26, 0.92)'; // --ink-900 at 92%
        break;
      default:
        this.ctx.fillStyle = 'rgba(250, 246, 240, 0.90)';
    }

    this.ctx.fillRect(0, 0, w, h);

    // Draw Editorial Inner Card Outline
    const margin = 80;
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeStyle = (this.overlayType === 'dark-contrast') 
      ? 'rgba(227, 165, 121, 0.25)'  /* Orange-300 on Dark */
      : 'rgba(193, 89, 44, 0.18)';    /* Orange-600 on Light */
    
    this.ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
    this.ctx.restore();
  }

  drawDecorations(w, h) {
    this.ctx.save();
    const isDark = (this.overlayType === 'dark-contrast');
    
    // Draw canvas dotted pattern and giant background quote watermark if no image is loaded
    if (!this.bgImage) {
      this.ctx.save();
      this.ctx.fillStyle = isDark ? 'rgba(227, 165, 121, 0.05)' : 'rgba(193, 89, 44, 0.04)';
      const dotSpacing = 40;
      for (let x = 20; x < w; x += dotSpacing) {
        for (let y = 20; y < h; y += dotSpacing) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      
      // Giant central quote watermark
      this.ctx.font = `italic 700 480px 'Cormorant Garamond', serif`;
      this.ctx.fillStyle = isDark ? 'rgba(227, 165, 121, 0.035)' : 'rgba(193, 89, 44, 0.025)';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('“', w / 2, h / 2 - 50);
      this.ctx.restore();
    }
    
    // Top Logo / Brand Watermark
    this.ctx.font = `600 20px 'Outfit', sans-serif`;
    this.ctx.fillStyle = isDark ? '#E3A579' : '#C1592C'; // --orange-300 on Dark, --orange-600 on Light
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Q U O T E B O O K   S T U D I O', w / 2, 130);

    // Quote Watermark Mark
    this.ctx.font = `italic 700 160px 'Cormorant Garamond', serif`;
    this.ctx.fillStyle = isDark ? 'rgba(227, 165, 121, 0.08)' : 'rgba(193, 89, 44, 0.05)';
    this.ctx.fillText('“', w / 2, 260);

    this.ctx.restore();
  }

  drawTextContent(w, h) {
    this.ctx.save();
    const isDark = (this.overlayType === 'dark-contrast');
    const primaryColor = isDark ? '#fafaf9' : '#1b1e24';
    const secondaryColor = isDark ? '#d6d3d1' : '#4a4e58';

    // Calculate Font Size based on text length and canvas width
    const text = `“${this.quote.text}”`;
    let fontSize = 52;
    if (text.length > 200) fontSize = 36;
    else if (text.length > 120) fontSize = 44;

    this.ctx.font = `600 ${fontSize}px '${this.fontFamily}', Georgia, serif`;
    this.ctx.fillStyle = primaryColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const maxTextWidth = w - 240;
    const lines = this.wrapText(text, maxTextWidth);
    const lineHeight = fontSize * 1.45;
    const totalTextHeight = lines.length * lineHeight;
    
    let startY = (h / 2) - (totalTextHeight / 2) + 20;

    lines.forEach((line) => {
      this.ctx.fillText(line, w / 2, startY);
      startY += lineHeight;
    });

    // Author Attribution
    this.ctx.font = `600 28px 'Outfit', sans-serif`;
    this.ctx.fillStyle = secondaryColor;
    this.ctx.fillText(`— ${this.quote.author}`, w / 2, startY + 45);

    // Category Tag at bottom
    if (this.quote.category) {
      this.ctx.font = `500 18px 'Outfit', sans-serif`;
      this.ctx.fillStyle = isDark ? '#E3A579' : '#8C3D1D'; // --orange-300 on Dark, --orange-700 on Light
      this.ctx.fillText(this.quote.category.toUpperCase(), w / 2, h - 130);
    }

    this.ctx.restore();
  }

  wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = this.ctx.measureText(currentLine + " " + word).width;
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

  downloadPNG(filename = 'quotebook-poster.png') {
    // Flash effect on canvas in DOM
    const canvas = this.canvas;
    if (canvas) {
      canvas.style.transition = 'none';
      canvas.style.opacity = '0.3';
      canvas.offsetHeight; /* trigger reflow */
      canvas.style.transition = 'opacity 0.4s ease-out';
      canvas.style.opacity = '1';
    }

    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}
