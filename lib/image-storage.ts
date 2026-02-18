import fs from 'fs';
import path from 'path';
import https from 'https';
import { IncomingMessage } from 'http';
import os from 'os';

// Use /tmp for ephemeral storage in serverless/container environments
// Note: This storage is NOT persistent across restarts or redeployments unless a volume is mounted.
const STORAGE_DIR = path.join(os.tmpdir(), 'new-year-card-generated');
const MAX_IMAGES = 30;

// Helper to ensure directory exists safely
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    try {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
      throw error;
    }
  }
  return STORAGE_DIR;
}

export async function saveGeneratedImage(imageUrl: string): Promise<string> {
  const dir = ensureStorageDir();
  const timestamp = Date.now();
  const filename = `bg-${timestamp}.png`;
  const filepath = path.join(dir, filename);

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
        // Return the API URL to serve this image
        resolve(`/api/images/${filename}`);
      });
    }).on('error', (err: Error) => {
      fs.unlink(filepath, () => {}); // Cleanup
      reject(err);
    });
  });
}

function rotateImages() {
  try {
    const dir = ensureStorageDir();
    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
      .map(file => {
        const fullPath = path.join(dir, file);
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
          fs.unlinkSync(path.join(dir, file.name));
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

// Export the storage directory path for the API route to use
export const IMAGE_STORAGE_DIR = STORAGE_DIR;
