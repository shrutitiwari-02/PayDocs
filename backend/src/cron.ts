import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

export function initCronJobs() {
  // Run every hour to clear old files
  cron.schedule('0 * * * *', () => {
    console.log('Running auto-delete cron job...');
    const tempDir = path.join(__dirname, '../temp');
    
    if (!fs.existsSync(tempDir)) {
      return;
    }

    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error('Error reading temp dir:', err);
        return;
      }

      const now = Date.now();
      const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        if (file === '.gitkeep') continue;
        
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error('Error stating file:', err);
            return;
          }

          if (now - stats.mtimeMs > MAX_AGE) {
            fs.unlink(filePath, err => {
              if (err) {
                console.error(`Failed to delete ${filePath}:`, err);
              } else {
                console.log(`Auto-deleted old file: ${filePath}`);
              }
            });
          }
        });
      }
    });
  });
}
