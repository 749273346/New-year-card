const fs = require('fs');
const https = require('https');
const path = require('path');

const files = [
  {
    // Spring Festival Overture
    url: "https://ia800109.us.archive.org/21/items/SpringFestivalOverture/Spring%20Festival%20Overture.mp3",
    dest: "spring-festival.mp3"
  },
  {
    // Gong Xi Fa Cai (Instrumental/Folk style)
    url: "https://ia601406.us.archive.org/13/items/CNYMusic/Gong%20Xi%20Fa%20Cai.mp3",
    dest: "gong-xi-fa-cai.mp3" 
  },
  {
    // Blooming Flowers and Full Moon
    url: "https://ia803104.us.archive.org/31/items/ChineseTraditionalMusic/Blooming%20Flowers%20and%20Full%20Moon.mp3",
    dest: "blooming-flowers.mp3"
  },
  {
    // Good Luck (Hao Yun Lai) - Instrumental style
    url: "https://ia902606.us.archive.org/17/items/ChineseNewYearSongs/Hao%20Yun%20Lai.mp3",
    dest: "good-luck.mp3"
  }
];

// Fallback URLs from a reliable CDN or GitHub if Archive.org is slow/blocked
const fallbacks = [
    {
        url: "https://github.com/shaunanoordin/cny2019/raw/master/assets/cny2019/bgm.mp3", // A generic festive one
        dest: "festive-generic.mp3"
    },
    {
        url: "https://taira-komori.jpn.org/sound/event01/japanesefestival.mp3", // Japanese festive but sounds similar to generic asian festive
        dest: "festive-drums.mp3"
    }
];

const downloadFile = (url, filename) => {
  const dest = path.join(__dirname, 'public', 'music', filename);
  
  // Create music dir if not exists
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
  }

  const file = fs.createWriteStream(dest);
  
  console.log(`Downloading ${filename} from ${url}...`);
  
  https.get(url, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
      downloadFile(response.headers.location, filename);
      return;
    }
    
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${filename}: ${response.statusCode}`);
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

// Since finding specific copyrighted mp3s directly via script is hard and prone to 404s,
// I will download a set of reliable open source/creative commons festive tracks I know exist
// or simply use the generic one I found earlier and duplicate it with different names for simulation 
// if I can't find real different ones. 
// BUT, I will try to fetch real ones first.

// Let's actually use the one we found earlier that worked (j3ygh) and rename it as one option
// And try to find 1-2 more.

const reliableFiles = [
    {
        url: "https://raw.githubusercontent.com/j3ygh/gong-xi-fa-cai/master/gong_xi_fa_cai/resources/gong_xi_fa_cai.mp3",
        dest: "gong-xi-fa-cai.mp3"
    },
    {
        url: "https://taira-komori.jpn.org/sound/event01/japanesefestival.mp3", // Good alternative
        dest: "festive-drums.mp3"
    },
    {
        // Using a known soundhelix test file as a placeholder if we want 3rd, but let's stick to 2 real festive ones first
        // actually let's try to get a third real one.
        url: "https://raw.githubusercontent.com/shaunanoordin/cny2019/master/assets/cny2019/bgm.mp3",
        dest: "happy-new-year.mp3"
    }
];

reliableFiles.forEach(f => downloadFile(f.url, f.dest));
