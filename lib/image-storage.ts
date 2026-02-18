import fs from 'fs';
import path from 'path';
import https from 'https';
import { IncomingMessage } from 'http';

const STORAGE_DIR = path.join(process.cwd(), 'public', 'generated');
const MAX_IMAGES = 30;

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export async function saveGeneratedImage(imageUrl: string): Promise<string> {
  const timestamp = Date.now();
  const filename = `bg-${timestamp}.png`;
  const filepath = path.join(STORAGE_DIR, filename);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(imageUrl, (response: IncomingMessage) => {
      if (response.statusCode !== 200) {
        fs.unlink(filepath, () => {}); // Cleanup
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        rotateImages(); // Cleanup old images after saving new one
        resolve(`/generated/${filename}`);
      });
    }).on('error', (err: Error) => {
      fs.unlink(filepath, () => {}); // Cleanup
      reject(err);
    });
  });
}

function rotateImages() {
  try {
    const files = fs.readdirSync(STORAGE_DIR)
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
      .map(file => {
        const fullPath = path.join(STORAGE_DIR, file);
        return {
          name: file,
          time: fs.statSync(fullPath).mtime.getTime()
        };
      })
      .sort((a, b) => b.time - a.time); // Newest first

    if (files.length > MAX_IMAGES) {
      const toDelete = files.slice(MAX_IMAGES);
      toDelete.forEach(file => {
        try {
          fs.unlinkSync(path.join(STORAGE_DIR, file.name));
          console.log(`Deleted old generated image: ${file.name}`);
        } catch (err) {
          console.error(`Failed to delete old image ${file.name}:`, err);
        }
      });
    }
  } catch (err) {
    console.error('Error rotating generated images:', err);
  }
}
