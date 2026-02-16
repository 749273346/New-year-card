import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// export const runtime = 'edge'; // Switch to Node.js runtime for better stability and debugging

async function loadGoogleFont(font: string, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status == 200) {
        return await response.arrayBuffer();
      }
    }
  } catch (e) {
    console.error('Font loading failed:', e);
    // Fallback or rethrow? 
    // If we don't have a font, Satori might fail or use a default if provided.
    // We will throw to let the main handler catch it.
    throw e;
  }

  throw new Error('failed to load font data');
}

export async function GET(req: NextRequest) {
  try {
    console.log('Generating card image...');
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') || '朋友';
    const poemRaw = searchParams.get('poem');
    const wish = searchParams.get('wish') || '新春快乐，万事如意';
    
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
        // We will proceed. Satori needs at least one font usually, but maybe it has a default?
        // Actually, without font data, Satori will throw "No font data provided".
        // So we MUST provide a font.
        // If Google Font fails, we are in trouble unless we have a local file.
        // For now, let's let it fail but log it clearly.
        throw new Error('Font loading failed. Please ensure internet access to Google Fonts or provide a local font.');
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #8B0000 0%, #B22222 50%, #FF0000 100%)',
            fontFamily: '"Noto Serif SC"',
            position: 'relative',
          }}
        >
          {/* Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.1)',
              backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent, rgba(0,0,0,0.2))',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
              padding: '60px 40px',
              position: 'relative',
              // zIndex: 10, // Removed to avoid Satori unitless error
              color: '#FEF3C7', // text-yellow-100
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 60, fontWeight: 700, color: '#FBBF24', textShadow: '0 4px 8px rgba(0,0,0,0.3)', marginBottom: 10 }}>
                ✨ 新年快乐 ✨
              </div>
              <div style={{ fontSize: 24, opacity: 0.8 }}>2026 丙午马年</div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {/* Name Container */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 48px',
                  borderTop: '2px solid rgba(234, 179, 8, 0.5)',
                  borderBottom: '2px solid rgba(234, 179, 8, 0.5)',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '9999px',
                  marginBottom: '40px',
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {name}
                </div>
              </div>

              {/* Poem */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                {poem.map((line, index) => (
                  <div key={index} style={{ fontSize: 32, letterSpacing: '0.1em', color: '#FFFBEB', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {line}
                  </div>
                ))}
              </div>

              {/* Wish */}
              <div
                style={{
                  display: 'flex', // Added flex
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: 20,
                  fontStyle: 'italic',
                  opacity: 0.9,
                  textAlign: 'center',
                  maxWidth: '80%',
                  justifyContent: 'center', // Center text content
                }}
              >
                “{wish}”
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', fontSize: 16, opacity: 0.6 }}>
              汕头水电车间 智轨先锋组
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
