// Helper to encode SVG for CSS background
const encodeSVG = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

// 1. Red Paper / Noise Texture (Subtle noise)
const paperSvg = `<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
  <filter id='noiseFilter'>
    <feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#noiseFilter)' opacity='1'/>
</svg>`;

// 2. Oriental Tiles (Geometric)
const tilesSvg = `<svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'>
  <g fill='none' fill-rule='evenodd'>
    <g fill='#ffffff' fill-opacity='1'>
      <path d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/>
    </g>
  </g>
</svg>`;

// 3. Wood Grain (Simulated with turbulence)
const woodSvg = `<svg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
  <filter id='grain'>
    <feTurbulence type='fractalNoise' baseFrequency='0.05 0.5' numOctaves='2' stitchTiles='stitch'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#grain)' opacity='1'/>
</svg>`;

// 4. Diamonds
const diamondsSvg = `<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'>
  <g fill='#ffffff' fill-opacity='1' fill-rule='evenodd'>
    <path d='M0 40L40 0H20L0 20M40 40V20L20 40'/>
  </g>
</svg>`;

// 5. Shattered / Rough (Noise with lower frequency)
const shatteredSvg = `<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
  <filter id='noise'>
    <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#noise)' opacity='1'/>
</svg>`;

export const PATTERN_PAPER = encodeSVG(paperSvg);
export const PATTERN_TILES = encodeSVG(tilesSvg);
export const PATTERN_WOOD = encodeSVG(woodSvg);
export const PATTERN_DIAMONDS = encodeSVG(diamondsSvg);
export const PATTERN_SHATTERED = encodeSVG(shatteredSvg);
