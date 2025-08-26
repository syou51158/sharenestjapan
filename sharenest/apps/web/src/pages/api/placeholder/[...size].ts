import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const sizeParam = req.query.size as string[] | undefined;
  const [wStr, hStr] = Array.isArray(sizeParam) ? sizeParam : [];

  const width = Number.parseInt(wStr || '', 10) || 400;
  const height = Number.parseInt(hStr || '', 10) || 300;

  const bg = '#0ea5e9'; // cyan-500
  const bg2 = '#6366f1'; // indigo-500
  const textColor = '#ffffff';
  const label = `${width}×${height}`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1">
    <path d="M0 0 L${width} ${height}" />
    <path d="M0 ${height} L${width} 0" />
  </g>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="${Math.max(12, Math.min(width, height) / 6)}" font-weight="700">${label}</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  // Cache for 1 day
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400');
  res.status(200).send(svg);
}