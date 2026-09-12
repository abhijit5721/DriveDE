/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Share card for the public trainer (DRI-54): the visitor's round result as a
 * 1080x1350 image drawn on a 2D canvas, plus the caption that travels with it.
 * No dependencies, page fonts, text in the visitor's language.
 */

export const SHARE_URL = 'https://drivede.app/?utm_source=share&utm_medium=result_card&utm_campaign=vorfahrt';

export interface ShareCardData {
  language: 'de' | 'en';
  correct: number;
  total: number;
  /** Seconds already formatted for the language, e.g. "9,3". */
  seconds: string;
  /** Optional comparison line, already localised. */
  comparison?: string | null;
}

export function shareCaption(d: ShareCardData): string {
  const base = d.language === 'de'
    ? `Rechts vor links, Kreisverkehr, Stoppschild: ${d.correct} von ${d.total} richtig in ${d.seconds} Sekunden.`
    : `Right before left, roundabout, stop sign: ${d.correct} of ${d.total} correct in ${d.seconds} seconds.`;
  const dare = d.language === 'de' ? 'Schaffst du das schneller?' : 'Can you beat that?';
  return `${base} ${dare} ${SHARE_URL}`;
}

export function shareHeadline(d: ShareCardData): string {
  return d.language === 'de'
    ? `${d.correct} von ${d.total} richtig in ${d.seconds} s`
    : `${d.correct} of ${d.total} correct in ${d.seconds} s`;
}

const W = 1080;
const H = 1350;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws the card onto the canvas (resizes it to 1080x1350). Pure drawing, no I/O. */
export function drawShareCard(canvas: HTMLCanvasElement, d: ShareCardData): void {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const font = '\'Segoe UI\', system-ui, -apple-system, Roboto, sans-serif';

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Road motif: two lanes crossing, subtle
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 140;
  ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, H * 0.55); ctx.lineTo(W, H * 0.55); ctx.stroke();

  // Brand
  ctx.fillStyle = '#60a5fa';
  ctx.font = `800 44px ${font}`;
  ctx.textAlign = 'left';
  ctx.fillText('DriveDE', 80, 130);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `500 34px ${font}`;
  ctx.fillText(d.language === 'de' ? 'Wer fährt zuerst?' : 'Who goes first?', 80, 185);

  // Big score
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 200px ${font}`;
  ctx.fillText(`${d.correct}/${d.total}`, 80, 470);
  ctx.fillStyle = '#93c5fd';
  ctx.font = `700 60px ${font}`;
  ctx.fillText(d.language === 'de' ? `richtig in ${d.seconds} Sekunden` : `correct in ${d.seconds} seconds`, 80, 560);

  // Rules line
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `500 40px ${font}`;
  const rules = d.language === 'de'
    ? 'Rechts vor links, abknickende Vorfahrt, Stoppschild'
    : 'Right before left, bending priority road, stop sign';
  let y = 660;
  for (const line of wrap(ctx, rules, W - 160)) { ctx.fillText(line, 80, y); y += 52; }

  // Comparison
  if (d.comparison) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = `700 46px ${font}`;
    y += 30;
    for (const line of wrap(ctx, d.comparison, W - 160)) { ctx.fillText(line, 80, y); y += 58; }
  }

  // Dare
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 64px ${font}`;
  const dare = d.language === 'de' ? 'Schaffst du das schneller?' : 'Can you beat that?';
  for (const line of wrap(ctx, dare, W - 160)) { ctx.fillText(line, 80, 1090); }

  // URL pill
  ctx.fillStyle = '#2563eb';
  const pillW = 560;
  const pillH = 96;
  const px = 80;
  const py = 1160;
  ctx.beginPath();
  ctx.roundRect(px, py, pillW, pillH, 48);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 44px ${font}`;
  ctx.textAlign = 'center';
  ctx.fillText('drivede.app', px + pillW / 2, py + 64);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `500 30px ${font}`;
  ctx.fillText(d.language === 'de' ? 'Kostenlos, ohne Anmeldung' : 'Free, no account needed', px + pillW + 30, py + 60);
}

export type ShareMethod = 'webshare' | 'download' | 'copy' | 'none';

/**
 * Shares the card: Web Share API with the image file where the browser allows
 * it, otherwise a PNG download plus the caption on the clipboard. Never throws.
 */
export async function shareResultCard(canvas: HTMLCanvasElement, d: ShareCardData): Promise<ShareMethod> {
  const caption = shareCaption(d);
  const blob = await new Promise<Blob | null>((resolve) => {
    try { canvas.toBlob((b) => resolve(b), 'image/png'); } catch { resolve(null); }
  });
  const fileName = d.language === 'de' ? 'drivede-ergebnis.png' : 'drivede-result.png';
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;

  if (blob && nav?.share) {
    const file = new File([blob], fileName, { type: 'image/png' });
    const payload: ShareData = { files: [file], text: caption };
    const canShareFiles = typeof nav.canShare === 'function' ? nav.canShare(payload) : false;
    try {
      if (canShareFiles) {
        await nav.share(payload);
        return 'webshare';
      }
      await nav.share({ text: caption, url: SHARE_URL });
      return 'webshare';
    } catch {
      // user cancelled or the share failed: fall through to the download path
    }
  }

  let method: ShareMethod = 'none';
  if (blob && typeof document !== 'undefined') {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      method = 'download';
    } catch { /* ignore */ }
  }
  try {
    await nav?.clipboard?.writeText(caption);
    if (method === 'none') method = 'copy';
  } catch { /* clipboard may be unavailable */ }
  return method;
}
