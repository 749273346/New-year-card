import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
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
    const wishFontSize = wishLength > 300 ? 12 : wishLength > 200 ? 13 : wishLength > 150 ? 14 : wishLength > 100 ? 16 : 18;
    const wishLineHeight = wishLength > 200 ? '1.5' : '1.8';

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
            padding: '40px',
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
          
          {/* Border */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              border: `2px solid ${theme.hexColors.border}`,
              borderRadius: '16px',
              pointerEvents: 'none',
            }}
          />

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            <div style={{ 
              fontSize: 56, 
              fontWeight: 700, 
              color: theme.hexColors.accent, 
              textShadow: '0 4px 8px rgba(0,0,0,0.3)', 
              marginBottom: 10,
              letterSpacing: '0.1em'
            }}>
              新年快乐
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.9 }}>
               <div style={{ width: 40, height: 1, backgroundColor: theme.hexColors.secondary }}></div>
               <div style={{ fontSize: 20, color: theme.hexColors.secondary, letterSpacing: '0.2em' }}>2026 丙午马年</div>
               <div style={{ width: 40, height: 1, backgroundColor: theme.hexColors.secondary }}></div>
            </div>
          </div>

          {/* Content Container - Flex grow to take available space */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexGrow: 1,
            width: '100%',
            gap: '30px',
            padding: '20px 0',
          }}>
            
            {/* Poem */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {poem.map((line, index) => (
                <div key={index} style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.hexColors.accent, opacity: 0.6 }}></div>
                  <div style={{ fontSize: 28, letterSpacing: '0.15em', color: theme.hexColors.primary, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {line}
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.hexColors.accent, opacity: 0.6 }}></div>
                </div>
              ))}
            </div>

            {/* Wish */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '90%',
                backgroundColor: 'rgba(0, 0, 0, 0.15)', // Semi-transparent dark background works well on most themes
                borderTop: `1px solid ${theme.hexColors.border}`,
                borderBottom: `1px solid ${theme.hexColors.border}`,
                padding: '20px',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  fontSize: wishFontSize,
                  lineHeight: wishLineHeight,
                  color: theme.hexColors.primary,
                  textAlign: 'justify', // Satori supports justify
                  textIndent: '2em',
                  // Satori limitation: Inline styling with wrapping is difficult.
                  // We render plain text to ensure correct line wrapping and prevent crashes.
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
            paddingTop: '10px',
            borderTop: `1px solid ${theme.hexColors.border}`,
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: 14, color: theme.hexColors.secondary, opacity: 0.8, letterSpacing: '0.1em' }}>
              汕头水电车间 · 智轨先锋组
            </div>
          </div>
          
        </div>
      ),
      {
        width: 600,
        height: 900,
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
