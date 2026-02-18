import requests
from bs4 import BeautifulSoup
import sys

def scrape(url):
    print(f"Scraping {url}...")
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        found = False
        # Strategy 1: Look for direct <a> tags with .mp3
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '.mp3' in href.lower():
                # Handle relative URLs
                if href.startswith('//'):
                    full_url = 'https:' + href
                elif href.startswith('/'):
                    # simple domain extraction
                    domain = '/'.join(url.split('/')[:3])
                    full_url = domain + href
                elif not href.startswith('http'):
                    full_url = url.rsplit('/', 1)[0] + '/' + href
                else:
                    full_url = href
                
                print(f"FOUND_MP3: {full_url}")
                found = True

        # Strategy 2: Look for <audio> tags source
        for audio in soup.find_all('audio'):
            for source in audio.find_all('source'):
                src = source.get('src')
                if src and '.mp3' in src.lower():
                    if src.startswith('//'):
                        full_url = 'https:' + src
                    elif src.startswith('/'):
                        domain = '/'.join(url.split('/')[:3])
                        full_url = domain + src
                    elif not src.startswith('http'):
                        full_url = url.rsplit('/', 1)[0] + '/' + src
                    else:
                        full_url = src
                    print(f"FOUND_MP3_AUDIO: {full_url}")
                    found = True
                    
        if not found:
            print(f"No MP3 found on {url}")

    except Exception as e:
        print(f"Error scraping {url}: {e}")

if __name__ == "__main__":
    urls = [
        "https://bigsoundbank.com/detail-0863-horse-neighing-3.html",
        "https://www.freesoundslibrary.com/horse-neigh-sound-effect/"
    ]
    for url in urls:
        scrape(url)
