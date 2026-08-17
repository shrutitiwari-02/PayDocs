import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendPasswordResetEmail, sendPayslipEmail, sendInvoiceEmail, sendQuotationEmail, sendReceiptEmail, sendOtpEmail } from './services/email';
import { validateAuthenticEmail } from './services/verification';
import puppeteer from 'puppeteer';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import path from 'path';
import fs from 'fs';
import { calculatePayslip, calculateInvoice } from '@paydocs/shared';
import { createJob, getJob } from './queue';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { initCronJobs } from './cron';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down gracefully...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down gracefully...', err);
  process.exit(1);
});

// Strict JWT check for production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in production environment.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';

// Secure In-Memory OTP Store
// email -> { otp: string, expiresAt: number, hashedPassword: string, attempts: number, lastSentAt: number }
interface OtpEntry {
  otp: string;
  expiresAt: number;
  hashedPassword: string;
  attempts: number;
  lastSentAt: number;
}
const otpStore = new Map<string, OtpEntry>();

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });
const app = express();

app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 for normal usage
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Strict limit for CPU intensive routes
  standardHeaders: true,
  legacyHeaders: false,
});

async function setupSecurePage(browser: any, html: string) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req: any) => {
    const type = req.resourceType();
    // Block potentially malicious scripts/requests, allow Tailwind CDN
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
  await page.setContent(html, { waitUntil: 'load' });
  return page;
}
app.use(globalLimiter);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '5mb' }));

const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuthMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

const PORT = process.env.PORT || 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test shared module calculation
app.post('/api/test-calc', (req, res) => {
  const { type, data } = req.body || {};
  if (type === 'payslip') {
    res.json(calculatePayslip(data));
  } else if (type === 'invoice') {
    res.json(calculateInvoice(data));
  } else {
    res.status(400).json({ error: 'Invalid type' });
  }
});

// PDF Generation Route (Single)
const pdfPayslipSchema = z.object({
  html: z.string().min(1),
  type: z.string().optional(),
  entityName: z.string().optional(),
  totalAmount: z.union([z.number(), z.string()]).optional(),
});

app.post('/api/pdf/payslip', optionalAuthMiddleware, pdfLimiter, async (req, res) => {
  let browser;
  try {
    const parseResult = pdfPayslipSchema.safeParse(req.body);
    if (!parseResult.success) return res.status(400).json({ error: 'Invalid input data' });
    const { html, type, entityName, totalAmount } = parseResult.data;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await setupSecurePage(browser, html);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    // Record History in Database if metadata is provided & user is authenticated
    const userId = (req as any).user?.id;
    if (type && entityName && totalAmount !== undefined) {
      const amountFloat = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
      if (!isNaN(amountFloat)) {
        await prisma.documentHistory.create({
          data: {
            type,
            entityName,
            totalAmount: amountFloat,
            userId: userId || null
          }
        }).catch(err => console.error('Failed to save history:', err));
      }
    }

    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (browser) await browser.close();
  }
});

// Email Payslip Route
app.post('/api/pdf/email-payslip', optionalAuthMiddleware, pdfLimiter, async (req, res) => {
  let browser;
  try {
    const { html, employeeEmail, employeeName, payPeriod, totalAmount } = req.body;
    if (!html || !employeeEmail || !employeeName || !payPeriod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await setupSecurePage(browser, html);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await sendPayslipEmail(employeeEmail, Buffer.from(pdfBuffer), employeeName, payPeriod);

    // Save history
    const userId = (req as any).user?.id;
    if (totalAmount !== undefined) {
      const amountFloat = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
      if (!isNaN(amountFloat)) {
        await prisma.documentHistory.create({
          data: {
            type: 'PAYSLIP',
            entityName: employeeName,
            totalAmount: amountFloat,
            userId: userId || null
          }
        }).catch(err => console.error('Failed to save email payslip history:', err));
      }
    }

    res.json({ message: 'Payslip emailed successfully' });
  } catch (error) {
    console.error('Email Payslip Error:', error);
    res.status(500).json({ error: 'Failed to email payslip' });
  } finally {
    if (browser) await browser.close();
  }
});

// Email Invoice Route
app.post('/api/pdf/email-invoice', optionalAuthMiddleware, pdfLimiter, async (req, res) => {
  let browser;
  try {
    const { html, clientEmail, clientName, invoiceNumber, totalAmount } = req.body;
    if (!html || !clientEmail || !clientName || !invoiceNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await setupSecurePage(browser, html);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await sendInvoiceEmail(clientEmail, Buffer.from(pdfBuffer), clientName, invoiceNumber);

    // Save history
    const userId = (req as any).user?.id;
    if (totalAmount !== undefined) {
      const amountFloat = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
      if (!isNaN(amountFloat)) {
        await prisma.documentHistory.create({
          data: {
            type: 'INVOICE',
            entityName: clientName,
            totalAmount: amountFloat,
            userId: userId || null
          }
        }).catch(err => console.error('Failed to save email invoice history:', err));
      }
    }

    res.json({ message: 'Invoice emailed successfully' });
  } catch (error) {
    console.error('Email Invoice Error:', error);
    res.status(500).json({ error: 'Failed to email invoice' });
  } finally {
    if (browser) await browser.close();
  }
});

// Email Quotation Route
app.post('/api/pdf/email-quotation', optionalAuthMiddleware, pdfLimiter, async (req, res) => {
  let browser;
  try {
    const { html, clientEmail, clientName, quotationNumber, totalAmount } = req.body;
    if (!html || !clientEmail || !clientName || !quotationNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await setupSecurePage(browser, html);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await sendQuotationEmail(clientEmail, Buffer.from(pdfBuffer), clientName, quotationNumber);

    // Save history
    const userId = (req as any).user?.id;
    if (totalAmount !== undefined) {
      const amountFloat = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
      if (!isNaN(amountFloat)) {
        await prisma.documentHistory.create({
          data: {
            type: 'QUOTATION',
            entityName: clientName,
            totalAmount: amountFloat,
            userId: userId || null
          }
        }).catch(err => console.error('Failed to save email quotation history:', err));
      }
    }

    res.json({ message: 'Quotation emailed successfully' });
  } catch (error) {
    console.error('Email Quotation Error:', error);
    res.status(500).json({ error: 'Failed to email quotation' });
  } finally {
    if (browser) await browser.close();
  }
});

// Email Receipt Route
app.post('/api/pdf/email-receipt', optionalAuthMiddleware, pdfLimiter, async (req, res) => {
  let browser;
  try {
    const { html, clientEmail, clientName, receiptNumber, totalAmount } = req.body;
    if (!html || !clientEmail || !clientName || !receiptNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await setupSecurePage(browser, html);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await sendReceiptEmail(clientEmail, Buffer.from(pdfBuffer), clientName, receiptNumber);

    // Save history
    const userId = (req as any).user?.id;
    if (totalAmount !== undefined) {
      const amountFloat = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
      if (!isNaN(amountFloat)) {
        await prisma.documentHistory.create({
          data: {
            type: 'RECEIPT',
            entityName: clientName,
            totalAmount: amountFloat,
            userId: userId || null
          }
        }).catch(err => console.error('Failed to save email receipt history:', err));
      }
    }

    res.json({ message: 'Receipt emailed successfully' });
  } catch (error) {
    console.error('Email Receipt Error:', error);
    res.status(500).json({ error: 'Failed to email receipt' });
  } finally {
    if (browser) await browser.close();
  }
});

// Bulk Generation Route
app.post('/api/pdf/payslip/bulk', optionalAuthMiddleware, pdfLimiter, (req, res) => {
  try {
    const { items } = req.body || {};
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid items array' });

    const jobId = createJob({ items }, items.length);
    res.json({ jobId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Job Status Route
app.get('/api/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// Job Download Route
app.get('/api/jobs/:id/download', (req, res) => {
  const job = getJob(req.params.id);
  if (!job || job.status !== 'completed') return res.status(404).json({ error: 'Job result not found' });

  const zipPath = path.join(__dirname, '../temp', `${req.params.id}.zip`);
  if (!fs.existsSync(zipPath)) return res.status(404).json({ error: 'File not found' });

  res.download(zipPath);
});

import multer from 'multer';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// PDF Merge Route
app.post('/api/pdf/merge', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files to merge.' });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      try {
        let buffer = file.buffer;
        const pdfHeaderIndex = buffer.indexOf('%PDF-');
        if (pdfHeaderIndex > 0) {
          buffer = buffer.subarray(pdfHeaderIndex);
        }

        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } catch (err: any) {
        throw new Error(`Failed to parse "${file.originalname}": ${err.message}. Ensure it is a valid PDF.`);
      }
    }

    const mergedPdfFile = await mergedPdf.save();

    res.contentType('application/pdf');
    res.send(Buffer.from(mergedPdfFile));
  } catch (error: any) {
    console.error('PDF Merge Error:', error);
    res.status(500).json({ error: error.message || 'Failed to merge PDFs' });
  }
});

// PDF Split Route
app.post('/api/pdf/split', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { startPage, endPage } = req.body || {};

    if (!file) {
      return res.status(400).json({ error: 'Please upload a PDF file to split.' });
    }

    const start = parseInt(startPage, 10);
    const end = parseInt(endPage, 10);

    if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
      return res.status(400).json({ error: 'Invalid startPage or endPage. Must be >= 1 and endPage >= startPage.' });
    }

    const sourcePdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const totalPages = sourcePdf.getPageCount();

    if (start > totalPages || end > totalPages) {
      return res.status(400).json({ error: `Page range out of bounds. Total pages: ${totalPages}` });
    }

    // pdf-lib pages are 0-indexed
    const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => (start - 1) + i);

    const splitPdf = await PDFDocument.create();
    const copiedPages = await splitPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => splitPdf.addPage(page));

    const splitPdfFile = await splitPdf.save();

    res.contentType('application/pdf');
    res.send(Buffer.from(splitPdfFile));
  } catch (error: any) {
    console.error('PDF Split Error:', error);
    res.status(500).json({ error: error.message || 'Failed to split PDF' });
  }
});

// PDF Compress Route
app.post('/api/pdf/compress', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Please upload a PDF file to compress.' });
    }

    // Compress by loading and saving without unused objects and with object streams
    const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
    const compressedPdfFile = await pdf.save({ useObjectStreams: true });

    res.contentType('application/pdf');
    res.send(Buffer.from(compressedPdfFile));
  } catch (error: any) {
    console.error('PDF Compress Error:', error);
    res.status(500).json({ error: error.message || 'Failed to compress PDF' });
  }
});

// History Route
app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const history = await prisma.documentHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 for now
    });
    res.json(history);
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete History Route
app.delete('/api/history/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const historyId = req.params.id;

    // Verify the record belongs to the user
    const record = await prisma.documentHistory.findUnique({
      where: { id: historyId }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (record.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.documentHistory.delete({
      where: { id: historyId }
    });

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('History Delete Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Auth Route
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues });
    }
    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please sign up.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ id: user.id, email: user.email, name: user.name, token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Send Verification OTP Route (Step 1 of verified registration)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Please provide a valid email and password (minimum 6 characters).' });
    }
    const { email, password } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Strict Email Authenticity & Disposable Domain Verification
    const validation = await validateAuthenticEmail(normalizedEmail);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason || 'Invalid or disposable email address.' });
    }

    // 2. Prevent duplicate user registrations
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    // 3. Rate limiting / cooldown protection per email (60 seconds)
    const existingOtp = otpStore.get(normalizedEmail);
    if (existingOtp && Date.now() - existingOtp.lastSentAt < 60000) {
      const remainingSeconds = Math.ceil((60000 - (Date.now() - existingOtp.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
      });
    }

    // 4. Generate cryptographically secure 6-digit OTP code
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const hashedPassword = await bcrypt.hash(password, 10);

    otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
      hashedPassword,
      attempts: 0,
      lastSentAt: Date.now(),
    });

    // 5. Send verified branded email via SMTP
    await sendOtpEmail(normalizedEmail, otp);

    res.json({
      message: 'Verification code sent successfully. Please check your email inbox.',
      email: normalizedEmail,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Failed to send verification code. Please verify your email and try again.' });
  }
});

// Verify OTP & Create Account Route (Step 2 of verified registration)
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const record = otpStore.get(normalizedEmail);
    if (!record) {
      return res.status(400).json({
        error: 'No active verification code found for this email. Please request a new code.',
      });
    }

    // Check code expiry
    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        error: 'Your verification code has expired. Please request a new one.',
      });
    }

    // Brute-force protection: max 5 failed attempts per OTP
    record.attempts += 1;
    if (record.attempts > 5) {
      otpStore.delete(normalizedEmail);
      return res.status(429).json({
        error: 'Too many incorrect attempts. For your security, this code has been invalidated. Please request a new code.',
      });
    }

    // Constant-time check or exact equality
    if (record.otp !== cleanOtp) {
      const remainingAttempts = 5 - record.attempts;
      return res.status(400).json({
        error: `Incorrect verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Code invalidated.'}`,
      });
    }

    // Verified successfully — remove OTP to prevent reuse
    otpStore.delete(normalizedEmail);

    // Double check user doesn't exist
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (user) {
      return res.status(409).json({ error: 'This email is already registered. Please log in.' });
    }

    // Create authentic verified user account
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: record.hashedPassword,
        name: normalizedEmail.split('@')[0],
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      token,
      message: 'Account successfully verified and created!',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Internal Server Error during verification.' });
  }
});

// Legacy direct signup endpoint - blocked to enforce verified email registration
app.post('/api/auth/signup', (req, res) => {
  return res.status(400).json({
    error: 'Direct unverified registration is disabled. All accounts must be verified through OTP verification.',
  });
});

// Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user doesn't exist for security
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Proceed without failing the request to prevent email enumeration
    }

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Reset Password Route
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Invalid token or password too short' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Image to PDF Route
app.post('/api/pdf/image-to-pdf', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: 'Upload at least one image' });

    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
      let image;
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        image = await pdfDoc.embedJpg(file.buffer);
      } else if (file.mimetype === 'image/png') {
        image = await pdfDoc.embedPng(file.buffer);
      } else {
        continue;
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    const pdfBytes = await pdfDoc.save();
    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Watermark Route
app.post('/api/pdf/watermark', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF' });
    const { text } = req.body || {};
    const pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawText(text || 'CONFIDENTIAL', {
        x: width / 2 - 150,
        y: height / 2,
        size: 50,
        font,
        color: rgb(0.8, 0.8, 0.8),
        rotate: degrees(45),
        opacity: 0.5,
      });
    });
    const pdfBytes = await pdfDoc.save();
    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add Page Numbers Route
app.post('/api/pdf/page-numbers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF' });
    const pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    pages.forEach((page, idx) => {
      const { width } = page.getSize();
      const text = `Page ${idx + 1} of ${pages.length}`;
      page.drawText(text, {
        x: width / 2 - 40,
        y: 20,
        size: 12,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    });
    const pdfBytes = await pdfDoc.save();
    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Rotate PDF Pages Route
app.post('/api/pdf/rotate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF' });
    const rotation = parseInt(req.body?.rotation || '90', 10);
    const pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });

    pdfDoc.getPages().forEach((page) => {
      page.setRotation(degrees(page.getRotation().angle + rotation));
    });
    const pdfBytes = await pdfDoc.save();
    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sign PDF Route
app.post('/api/pdf/sign', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF' });
    const signatureBase64 = req.body?.signature;
    if (!signatureBase64) return res.status(400).json({ error: 'Signature image is required' });

    const pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });

    // Parse the base64 string
    const base64Data = signatureBase64.replace(/^data:image\/png;base64,/, "");
    const signatureImageBytes = Buffer.from(base64Data, 'base64');

    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

    // Scale down the signature
    const signatureDims = signatureImage.scale(0.5);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Draw at bottom right of the first page
    firstPage.drawImage(signatureImage, {
      x: width - signatureDims.width - 50,
      y: 50,
      width: signatureDims.width,
      height: signatureDims.height,
    });

    const pdfBytes = await pdfDoc.save();
    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Word to PDF Route
app.post('/api/word-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a Word document' });

    const token = process.env.CONVERTAPI_SECRET;
    if (!token) return res.status(500).json({ error: 'ConvertAPI Secret is missing. Please add CONVERTAPI_SECRET to your .env file.' });

    const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
    const formData = new FormData();
    formData.append('File', blob, req.file.originalname);

    const response = await fetch('https://v2.convertapi.com/convert/docx/to/pdf', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ConvertAPI Error: ${err}`);
    }

    const data = await response.json();
    if (!data.Files || data.Files.length === 0) throw new Error('No files returned from ConvertAPI');

    const pdfBuffer = Buffer.from(data.Files[0].FileData, 'base64');
    res.contentType('application/pdf');
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PDF to Word Route
app.post('/api/pdf-to-word', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF document' });

    const token = process.env.CONVERTAPI_SECRET;
    if (!token) return res.status(500).json({ error: 'ConvertAPI Secret is missing. Please add CONVERTAPI_SECRET to your .env file.' });

    const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
    const formData = new FormData();
    formData.append('File', blob, req.file.originalname);

    const response = await fetch('https://v2.convertapi.com/convert/pdf/to/docx', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ConvertAPI Error: ${err}`);
    }

    const data = await response.json();
    if (!data.Files || data.Files.length === 0) throw new Error('No files returned from ConvertAPI');

    const docxBuffer = Buffer.from(data.Files[0].FileData, 'base64');
    res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(docxBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    initCronJobs();
  });
}

export { app };
