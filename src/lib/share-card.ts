/**
 * Gerador de card de compartilhamento via Canvas API.
 *
 * Cria uma imagem vertical (1080x1920) com:
 *  - Background-artistic como fundo
 *  - Card com glassmorphism simulado (blur da área + overlay branco)
 *  - Caixa de referência ao post original (apenas em replies)
 *  - Texto do post + imagem (se houver)
 *  - Watermark (icon.png) centralizado no topo
 *  - Texto "Deck 🎭" centralizado no rodapé
 */

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
const CARD_PADDING = 80;
const GLASS_RADIUS = 40;
const WATERMARK_SIZE = 275;
const WATERMARK_MARGIN = 48;

// Sequência de Halton para distribuição quasi-aleatória dos emojis
function halton(index: number, base: number): number {
  let f = 1; let r = 0; let i = index;
  while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
  return r;
}

// Dimensões da caixa de reply dentro do card
const REPLY_RADIUS = 20;
const REPLY_PADDING_X = 36;
const REPLY_PADDING_Y = 24;
const REPLY_LABEL_SIZE = 32;
const REPLY_TEXT_SIZE = 30;
const REPLY_LINE_HEIGHT = 42;
const REPLY_MAX_LINES = 2;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
    img.src = src;
  });
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function countTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): number {
  const words = text.split(' ');
  let line = '';
  let lines = 1;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++;
      line = word;
    } else {
      line = test;
    }
  }
  return lines;
}

/**
 * Quebra texto em array de linhas, respeitando maxLines.
 * Última linha truncada com "…" se o texto for cortado.
 */
function buildLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  let truncated = false;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      if (lines.length === maxLines) { truncated = true; break; }
      line = word;
    } else {
      line = test;
    }
  }
  if (!truncated && line) lines.push(line);

  if (truncated) {
    lines[lines.length - 1] = lines[lines.length - 1].trimEnd() + '…';
  }
  return lines;
}

function calcReplyBoxHeight(
  ctx: CanvasRenderingContext2D,
  replyContent: string,
  maxTextW: number,
): number {
  ctx.font = `${REPLY_TEXT_SIZE}px system-ui, -apple-system, sans-serif`;
  const lines = Math.min(countTextLines(ctx, replyContent, maxTextW), REPLY_MAX_LINES);
  return REPLY_PADDING_Y + (REPLY_LABEL_SIZE + 10) + 12 + lines * REPLY_LINE_HEIGHT + REPLY_PADDING_Y;
}

function drawReplyBox(
  ctx: CanvasRenderingContext2D,
  replyToPost: { authorName: string; content: string },
  x: number, y: number, w: number,
): number {
  const maxTextW = w - REPLY_PADDING_X * 2;
  const boxH = calcReplyBoxHeight(ctx, replyToPost.content, maxTextW);

  ctx.save();
  drawRoundRect(ctx, x, y, w, boxH, REPLY_RADIUS);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  const textX = x + REPLY_PADDING_X;
  let cursorY = y + REPLY_PADDING_Y;

  // "↩ Respondendo a Nome"
  cursorY += REPLY_LABEL_SIZE + 10;
  ctx.font = `bold ${REPLY_LABEL_SIZE}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fillText(`↩ Respondendo a ${replyToPost.authorName}`, textX, cursorY);
  cursorY += 12;

  // Linhas do conteúdo (máx REPLY_MAX_LINES)
  ctx.font = `${REPLY_TEXT_SIZE}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
  ctx.shadowBlur = 3;
  const lines = buildLines(ctx, replyToPost.content, maxTextW, REPLY_MAX_LINES);
  for (const line of lines) {
    cursorY += REPLY_LINE_HEIGHT;
    ctx.fillText(line, textX, cursorY);
  }

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  return y + boxH;
}

export async function generateShareCard(post: {
  content: string;
  authorName: string;
  imagePath?: string | null;
  replyToPost?: { authorName: string; content: string } | null;
  reactions?: { emoji: string; count: number }[];
}): Promise<Blob | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // ── 1. Background ─────────────────────────────────────────
    let bgImage: HTMLImageElement | null = null;
    try {
      bgImage = await loadImage('/images/Background-artistic.jpg');
      const scale = Math.max(CARD_WIDTH / bgImage.width, CARD_HEIGHT / bgImage.height);
      const w = bgImage.width * scale;
      const h = bgImage.height * scale;
      ctx.drawImage(bgImage, (CARD_WIDTH - w) / 2, (CARD_HEIGHT - h) / 2, w, h);
    } catch {
      const grad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
      grad.addColorStop(0, '#667eea');
      grad.addColorStop(0.5, '#764ba2');
      grad.addColorStop(1, '#f093fb');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    }

    // ── 2. Calcular altura do glass card ──────────────────────
    const glassX = CARD_PADDING;
    const glassW = CARD_WIDTH - CARD_PADDING * 2;
    const glassMaxH = CARD_HEIGHT - CARD_PADDING * 2 - WATERMARK_SIZE;
    const textMaxW = glassW - 80;
    const replyBoxW = glassW - 80;

    let replyBoxH = 0;
    if (post.replyToPost) {
      replyBoxH = calcReplyBoxHeight(ctx, post.replyToPost.content, replyBoxW - REPLY_PADDING_X * 2);
    }
    const replySection = post.replyToPost ? replyBoxH + 28 : 0;

    ctx.font = '40px system-ui, -apple-system, sans-serif';
    const textLines = countTextLines(ctx, post.content, textMaxW);
    const textHeight = textLines * 54;
    const authorHeight = 60;
    const imageHeight = post.imagePath ? 400 : 0;
    const contentH = 50 + replySection + authorHeight + 30 + textHeight + 40 + imageHeight + 60;
    const glassH = Math.min(contentH, glassMaxH);
    const glassY = (CARD_HEIGHT - glassH) / 2 + 80;

    // ── 3. Glassmorphism simulado ─────────────────────────────
    if (bgImage) {
      ctx.save();
      drawRoundRect(ctx, glassX, glassY, glassW, glassH, GLASS_RADIUS);
      ctx.clip();
      ctx.filter = 'blur(20px) saturate(1.5) brightness(1.1)';
      // Reutiliza bgImage já carregada — sem segundo fetch de rede
      const scale = Math.max(CARD_WIDTH / bgImage.width, CARD_HEIGHT / bgImage.height);
      const w = bgImage.width * scale;
      const h = bgImage.height * scale;
      ctx.drawImage(bgImage, (CARD_WIDTH - w) / 2, (CARD_HEIGHT - h) / 2, w, h);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(glassX - 10, glassY - 10, glassW + 20, glassH + 20);
      ctx.restore();
    } else {
      drawRoundRect(ctx, glassX, glassY, glassW, glassH, GLASS_RADIUS);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
    }

    // Borda externa
    drawRoundRect(ctx, glassX, glassY, glassW, glassH, GLASS_RADIUS);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner highlight
    drawRoundRect(ctx, glassX + 1, glassY + 1, glassW - 2, glassH - 2, GLASS_RADIUS - 1);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sombra externa
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 8;
    drawRoundRect(ctx, glassX, glassY, glassW, glassH, GLASS_RADIUS);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
    ctx.lineWidth = 0.1;
    ctx.stroke();
    ctx.restore();

    // ── 4. Conteúdo do card ───────────────────────────────────
    let cursorY = glassY + 50;
    const contentX = glassX + 40;

    // ── 4a. Caixa de reply (apenas em respostas) ──────────────
    if (post.replyToPost) {
      cursorY = drawReplyBox(ctx, post.replyToPost, contentX - 4, cursorY, replyBoxW);
      cursorY += 28;
    }

    // ── 4b. Autor ─────────────────────────────────────────────
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillText(post.authorName, contentX, cursorY + 36);
    cursorY += authorHeight + 20;

    // ── 4c. Texto do post ─────────────────────────────────────
    ctx.font = '40px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    cursorY = wrapText(ctx, post.content, contentX, cursorY + 34, textMaxW, 54);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // ── 4d. Imagem do post (se houver) ────────────────────────
    if (post.imagePath) {
      cursorY += 20;
      try {
        const postImg = await loadImage(post.imagePath);
        const maxImgW = glassW - 80;
        const maxImgH = 380;
        const imgScale = Math.min(maxImgW / postImg.width, maxImgH / postImg.height);
        const imgW = postImg.width * imgScale;
        const imgH = postImg.height * imgScale;
        const imgX = glassX + (glassW - imgW) / 2;
        ctx.save();
        drawRoundRect(ctx, imgX, cursorY, imgW, imgH, 20);
        ctx.clip();
        ctx.drawImage(postImg, imgX, cursorY, imgW, imgH);
        ctx.restore();
      } catch { /* silencioso */ }
      cursorY += 20;
    }

    // ── 5. Watermark (icon.png) — centralizado no topo ────────
    try {
      const icon = await loadImage('/images/icon.png');
      ctx.globalAlpha = 0.7;
      ctx.shadowBlur = 0;
      ctx.drawImage(icon, (CARD_WIDTH - WATERMARK_SIZE) / 2, WATERMARK_MARGIN, WATERMARK_SIZE, WATERMARK_SIZE);
      ctx.globalAlpha = 1;
    } catch { /* silencioso */ }

    // ── 5b. Texto "Deck 🎭" no rodapé ──────────────────
    const footerText = 'Deck 🎭';
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    const footerMetrics = ctx.measureText(footerText);
    ctx.fillText(footerText, (CARD_WIDTH - footerMetrics.width) / 2, CARD_HEIGHT - WATERMARK_MARGIN);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // ── 5c. Emojis de reação espalhados nas áreas livres ──────
    // Áreas protegidas (não sobrepõem):
    //   Topo: watermark  (y: 0 → WATERMARK_MARGIN + WATERMARK_SIZE + 40)
    //   Meio: glass card (y: glassY - 20 → glassY + glassH + 20)
    //   Rodapé: texto    (y: CARD_HEIGHT - WATERMARK_MARGIN - 60 → CARD_HEIGHT)
    const reactionsWithCount = (post.reactions ?? []).filter(r => r.count > 0);
    if (reactionsWithCount.length > 0) {
      // Zonas livres: faixa entre watermark e glass + faixa entre glass e rodapé
      const topClear  = WATERMARK_MARGIN + WATERMARK_SIZE + 40;
      const glassTop  = glassY - 20;
      const glassBot  = glassY + glassH + 20;
      const footerTop = CARD_HEIGHT - WATERMARK_MARGIN - 80;

      // Gera candidatos de posição nas duas faixas livres
      type Spot = { x: number; y: number };
      const spots: Spot[] = [];

      // Faixa 1: entre watermark e glass (se houver espaço)
      const zone1H = glassTop - topClear;
      if (zone1H > 60) {
        for (let k = 0; k < 8; k++) {
          spots.push({
            x: 80 + halton(k + 1, 2) * (CARD_WIDTH - 160),
            y: topClear + 30 + halton(k + 1, 3) * (zone1H - 60),
          });
        }
      }

      // Faixa 2: entre glass e rodapé (se houver espaço)
      const zone2H = footerTop - glassBot;
      if (zone2H > 60) {
        for (let k = 0; k < 8; k++) {
          spots.push({
            x: 80 + halton(k + 9, 2) * (CARD_WIDTH - 160),
            y: glassBot + 30 + halton(k + 9, 3) * (zone2H - 60),
          });
        }
      }

      // Embaralha os spots deterministicamente (Halton base 5)
      spots.sort((a, b) => halton(spots.indexOf(a) + 1, 5) - halton(spots.indexOf(b) + 1, 5));

      ctx.globalAlpha = 0.65;
      const fontSize = 58;
      const countFontSize = 28;
      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;

      reactionsWithCount.forEach((reaction, i) => {
        if (i >= spots.length) return;
        const spot = spots[i];

        // Emoji
        ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(reaction.emoji, spot.x - fontSize / 2, spot.y + fontSize / 2);

        // Contador acima do emoji, fonte 15 canvas (≈28px)
        ctx.font = `bold ${countFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        const countText = String(reaction.count);
        const countW = ctx.measureText(countText).width;
        ctx.fillText(countText, spot.x - countW / 2, spot.y - 4);
        ctx.shadowBlur = 0;
      });

      ctx.globalAlpha = 1;
    }

    // ── 6. Exportar ───────────────────────────────────────────
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
  } catch {
    return null;
  }
}

/**
 * Converte Blob para data URL base64.
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Gera o card e retorna o dataUrl para visualização.
 */
export async function generateShareCardForPost(post: {
  content: string;
  authorName: string;
  imagePath?: string | null;
  replyToPost?: { authorName: string; content: string } | null;
  reactions?: { emoji: string; count: number }[];
}): Promise<{ dataUrl: string; blob: Blob } | null> {
  const blob = await generateShareCard(post);
  if (!blob) return null;

  const dataUrl = await blobToDataUrl(blob);
  return { dataUrl, blob };
}
