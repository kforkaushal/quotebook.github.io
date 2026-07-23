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
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      this.bgImage = img;
      this.render();
    };
    img.onerror = () => {
      console.warn("Failed to load background image, using fallback gradient");
      this.bgImage = null;
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
      grad.addColorStop(0, '#fef3c7');
      grad.addColorStop(0.5, '#fff7ed');
      grad.addColorStop(1, '#e0e7ff');
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
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
        break;
      case 'warm-sun':
        this.ctx.fillStyle = 'rgba(254, 243, 199, 0.86)';
        break;
      case 'soft-rose':
        this.ctx.fillStyle = 'rgba(252, 231, 243, 0.86)';
        break;
      case 'serene-teal':
        this.ctx.fillStyle = 'rgba(204, 251, 241, 0.86)';
        break;
      case 'dark-contrast':
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        break;
      default:
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    }

    this.ctx.fillRect(0, 0, w, h);

    // Draw Glass Inner Card Outline
    const margin = 80;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = (this.overlayType === 'dark-contrast') 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(255, 255, 255, 0.8)';
    
    this.ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
    this.ctx.restore();
  }

  drawDecorations(w, h) {
    this.ctx.save();
    const isDark = (this.overlayType === 'dark-contrast');
    
    // Top Logo / Brand Watermark
    this.ctx.font = `600 24px 'Outfit', sans-serif`;
    this.ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('QUOTEBOOK STUDIO', w / 2, 130);

    // Quote Watermark Mark
    this.ctx.font = `italic 700 160px 'Cormorant Garamond', serif`;
    this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillText('“', w / 2, 260);

    this.ctx.restore();
  }

  drawTextContent(w, h) {
    this.ctx.save();
    const isDark = (this.overlayType === 'dark-contrast');
    const primaryColor = isDark ? '#ffffff' : '#0f172a';
    const secondaryColor = isDark ? '#cbd5e1' : '#475569';

    // Calculate Font Size based on text length and canvas width
    const text = `“${this.quote.text}”`;
    let fontSize = 54;
    if (text.length > 200) fontSize = 38;
    else if (text.length > 120) fontSize = 46;

    this.ctx.font = `600 ${fontSize}px '${this.fontFamily}', Georgia, serif`;
    this.ctx.fillStyle = primaryColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const maxTextWidth = w - 240;
    const lines = this.wrapText(text, maxTextWidth);
    const lineHeight = fontSize * 1.35;
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
      this.ctx.font = `500 20px 'Outfit', sans-serif`;
      this.ctx.fillStyle = isDark ? '#e05638' : '#d97706';
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
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}
