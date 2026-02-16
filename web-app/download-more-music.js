const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
  {
    // A nice upbeat Chinese instrumental track from Free Music Archive (via direct link)
    // "Chinese New Year" by Alex-Productions
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/7b/7b2a6081-424a-4467-9370-34d310183068.mp3",
    dest: "happy-cny.mp3"
  },
  {
    // Another traditional sounding track (generic asian folk)
    url: "https://taira-komori.jpn.org/sound/event01/chinesegong.mp3", 
    dest: "chinese-gong.mp3"
  }
];

const downloadFile = (url, filename) => {
  const dest = path.join(__dirname, 'public', 'music', filename);
  
  console.log(`Downloading ${filename} from ${url}...`);
  
  https.get(url, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
      console.log(`Redirecting to: ${response.headers.location}`);
      downloadFile(response.headers.location, filename);
      return;
    }
    
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${filename}: ${response.statusCode}`);
      return;
    }

    const file = fs.createWriteStream(dest);
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        console.log(`Downloaded ${filename} successfully!`);
      });
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
};

files.forEach(f => downloadFile(f.url, f.dest));
