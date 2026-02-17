import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { CSSProperties } from 'react';
import { themes } from '../../card/themes';

// export const runtime = 'edge'; // Switch to Node.js runtime for better stability and debugging

async function loadGoogleFont(font: string, text: string) {
  const fetchFont = async (baseUrl: string) => {
    const url = `${baseUrl}/css2?family=${font}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status == 200) {
        return await response.arrayBuffer();
      }
    }
    throw new Error('Failed to fetch font resource');
  };

  try {
    // Try reliable mirror first (fonts.loli.net is a Google Fonts mirror for China)
    return await fetchFont('https://fonts.loli.net');
  } catch (e) {
    console.warn('Failed to load from mirror, trying Google Fonts...', e);
    try {
      return await fetchFont('https://fonts.googleapis.com');
    } catch (e2) {
      console.error('Font loading failed from all sources:', e2);
      throw e2;
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('Generating card image...');
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') || '朋友';
    const poemRaw = searchParams.get('poem');
    const wish = searchParams.get('wish') || '新春快乐，万事如意';
    const themeId = searchParams.get('themeId');
    
    // Find theme or default to classic-red
    const theme = themes.find(t => t.id === themeId) || themes[0];
    
    let poem: string[] = [];
    if (poemRaw) {
      try {
        poem = JSON.parse(poemRaw);
      } catch {
        poem = ['新春佳节到', '福气满门绕'];
      }
    } else {
      poem = ['新春佳节到', '福气满门绕'];
    }

    // Combine all text for font subsetting
    const allText = name + poem.join('') + wish + '新年快乐2026丙午马年汕头水电车间智轨先锋组✨';
    
    // Load font
    let fontData: ArrayBuffer | null = null;
    try {
        fontData = await loadGoogleFont('Noto+Serif+SC', allText);
    } catch (e) {
        console.warn('Failed to load Google Font, using fallback or default if available', e);
        throw new Error('Font loading failed. Please ensure internet access to Google Fonts or provide a local font.');
    }

    // Dynamic font size based on wish length (Optimized for long text)
    const wishLength = wish.length;
    // Scale 2x for high resolution (Base sizes: 12->24, 13->26, 14->28, 16->32, 18->36)
    const wishFontSize = wishLength > 300 ? 24 : wishLength > 200 ? 26 : wishLength > 150 ? 28 : wishLength > 100 ? 32 : 36;
    const wishLineHeight = wishLength > 200 ? '1.5' : '1.8';

    // Helper for Corner Decoration
    const Corner = ({ style, rotate }: { style: CSSProperties, rotate: string }) => (
      <div style={{ ...style, display: 'flex', transform: rotate }}>
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
           <path d="M5 5 H40 M5 5 V40" stroke={theme.hexColors.border} strokeWidth="2" strokeLinecap="round" />
           <path d="M10 10 H35 M10 10 V35" stroke={theme.hexColors.border} strokeWidth="1" strokeLinecap="round" />
           <circle cx="5" cy="5" r="2" fill={theme.hexColors.border} />
           <path d="M50 5 Q30 5 20 20 Q5 30 5 50" stroke={theme.hexColors.border} strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
           <circle cx="20" cy="20" r="1.5" fill={theme.hexColors.border} />
        </svg>
      </div>
    );

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: theme.cardBg,
            fontFamily: '"Noto Serif SC"',
            position: 'relative',
            padding: '80px', // Scaled 2x
            color: theme.hexColors.primary,
          }}
        >
          {/* Background Texture Overlay */}
           {theme.textureUrl && (
             <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url('${theme.textureUrl}')`,
                opacity: theme.textureOpacity,
                pointerEvents: 'none',
              }}
            />
           )}
          
          {/* Cloud Pattern Background (Simplified as opacity layer) */}
           <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 0%, #000 100%)', pointerEvents: 'none' }} />

          {/* Border */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              right: '40px',
              bottom: '40px',
              border: `4px solid ${theme.hexColors.border}`, // Scaled 2x
              borderRadius: '32px', // Scaled 2x
              pointerEvents: 'none',
            }}
          />

          {/* Corner Decorations */}
          <Corner style={{ position: 'absolute', top: '50px', left: '50px' }} rotate="rotate(0deg)" />
          <Corner style={{ position: 'absolute', top: '50px', right: '50px' }} rotate="rotate(90deg)" />
          <Corner style={{ position: 'absolute', bottom: '50px', right: '50px' }} rotate="rotate(180deg)" />
          <Corner style={{ position: 'absolute', bottom: '50px', left: '50px' }} rotate="rotate(-90deg)" />

          {/* Horse Silhouette */}
          <div style={{ position: 'absolute', bottom: '100px', right: '-40px', opacity: 0.1, transform: 'rotate(-10deg) scale(1.5)' }}>
            <svg width="300" height="300" viewBox="0 0 100 100" fill={theme.hexColors.primary}>
               <path d="M20 80 Q40 60 60 70 T90 50 Q80 30 60 40 T30 50 Q20 70 20 80 Z" />
            </svg>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
            <div style={{ 
              fontSize: 112, // Scaled 2x
              fontWeight: 700, 
              color: theme.hexColors.accent, 
              textShadow: '0 8px 16px rgba(0,0,0,0.3)', 
              marginBottom: 20,
              letterSpacing: '0.1em'
            }}>
              新年快乐
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', opacity: 0.9 }}>
               <div style={{ width: 80, height: 2, backgroundColor: theme.hexColors.secondary }}></div>
               <div style={{ fontSize: 40, color: theme.hexColors.secondary, letterSpacing: '0.2em' }}>2026 丙午马年</div>
               <div style={{ width: 80, height: 2, backgroundColor: theme.hexColors.secondary }}></div>
            </div>
          </div>

          {/* Content Container */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexGrow: 1,
            width: '100%',
            gap: '60px', // Scaled 2x
            padding: '40px 0',
          }}>
            
            {/* Poem */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
              {poem.map((line, index) => (
                <div key={index} style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.hexColors.accent, opacity: 0.6 }}></div>
                  <div style={{ fontSize: 56, letterSpacing: '0.15em', color: theme.hexColors.primary, textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                    {line}
                  </div>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.hexColors.accent, opacity: 0.6 }}></div>
                </div>
              ))}
            </div>

            {/* Wish */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '90%',
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                borderTop: `2px solid ${theme.hexColors.border}`,
                borderBottom: `2px solid ${theme.hexColors.border}`,
                padding: '40px',
                marginTop: '40px',
              }}
            >
              <div
                style={{
                  fontSize: wishFontSize,
                  lineHeight: wishLineHeight,
                  color: theme.hexColors.primary,
                  textAlign: 'justify',
                  textIndent: '2em',
                }}
              >
                {wish}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%',
            paddingTop: '20px',
            borderTop: `2px solid ${theme.hexColors.border}`,
            marginBottom: '20px',
            gap: '20px'
          }}>
            {/* Seal SVG */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="80" height="80" viewBox="0 0 100 100" style={{ color: theme.hexColors.secondary, opacity: 0.9 }}>
                  <rect x="5" y="5" width="90" height="90" rx="10" stroke="currentColor" strokeWidth="3" fill="none" />
                  <rect x="12" y="12" width="76" height="76" rx="5" fill="currentColor" fillOpacity="0.1" />
                  <text x="50" y="65" fontFamily='"Noto Serif SC"' fontSize="40" fontWeight="bold" fill="currentColor" textAnchor="middle">马到成功</text>
               </svg>
            </div>
            
            <div style={{ fontSize: 28, color: theme.hexColors.secondary, opacity: 0.8, letterSpacing: '0.1em' }}>
              汕头水电车间 · 智轨先锋组
            </div>
          </div>
          
        </div>
      ),
      {
        width: 1200,
        height: 1800,
        fonts: [
          {
            name: 'Noto Serif SC',
            data: fontData!,
            style: 'normal',
            weight: 700,
          },
        ],
      },
    );
  } catch (e: unknown) {
    console.error('Error generating card image:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return new Response(`Failed to generate image: ${errorMessage}`, {
      status: 500,
    });
  }
}
