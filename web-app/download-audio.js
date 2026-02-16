const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
  {
    url: "https://taira-komori.jpn.org/sound/event01/fireworks2.mp3",
    dest: "firework.mp3"
  },
  {
    url: "https://raw.githubusercontent.com/j3ygh/gong-xi-fa-cai/master/gong_xi_fa_cai/resources/gong_xi_fa_cai.mp3", 
    dest: "bgm.mp3"
  }
];

const downloadFile = (url, filename) => {
  const dest = path.join(__dirname, 'public', filename);
  const file = fs.createWriteStream(dest);
  
  console.log(`Downloading ${filename} from ${url}...`);
  
  https.get(url, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
      console.log(`Redirecting to: ${response.headers.location}`);
      downloadFile(response.headers.location, filename);
      return;
    }
    
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${filename}: ${response.statusCode}`);
      if (filename === 'bgm.mp3') {
          // Fallback
          console.log("Trying fallback for bgm.mp3...");
          downloadFile("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "bgm.mp3");
      }
      return;
    }

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

// Only download bgm since firework worked (or try both again, it's fine)
downloadFile(files[1].url, files[1].dest);
