import { v4 as uuidv4 } from 'uuid';
import puppeteer from 'puppeteer';
import archiver = require('archiver');
import fs from 'fs';
import path from 'path';

export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  resultUrl?: string;
  error?: string;
  data: any;
}

const jobs = new Map<string, Job>();

export function createJob(data: any, total: number): string {
  const id = uuidv4();
  jobs.set(id, {
    id,
    status: 'pending',
    progress: 0,
    total,
    data
  });
  
  // Start processing asynchronously
  processJob(id).catch(console.error);
  
  return id;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

const TEMP_DIR = path.join(__dirname, '../temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function processJob(id: string) {
  const job = jobs.get(id);
  if (!job) return;

  job.status = 'processing';
  
  try {
    const { items, htmlTemplate } = job.data;
    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const zipPath = path.join(TEMP_DIR, `${id}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = (archiver as any)('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on('request', (req: any) => {
        const type = req.resourceType();
        if (['script', 'xhr', 'fetch', 'websocket'].includes(type)) {
          if (req.url().startsWith('https://cdn.tailwindcss.com')) {
            req.continue();
          } else {
            req.abort();
          }
        } else {
          req.continue();
        }
      });
      
      // We dynamically replace placeholders in the HTML template for this specific row
      // In a real robust system, the frontend sends the data array, and the backend has the React template.
      // Since we decided the frontend sends HTML, the frontend will send an array of HTML strings!
      const html = item.html; 
      
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({ 
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      
      const fileName = `Payslip_${item.employeeName.replace(/\s+/g, '_')}_${item.employeeId}.pdf`;
      archive.append(Buffer.from(pdfBuffer), { name: fileName });
      
      await page.close();
      
      job.progress = i + 1;
    }
    
    await browser.close();
    await archive.finalize();
    
    job.status = 'completed';
    job.resultUrl = `/api/jobs/${id}/download`;
    
  } catch (error: any) {
    job.status = 'failed';
    job.error = error.message;
  }
}
