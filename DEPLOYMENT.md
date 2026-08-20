# 🚀 PayDocs Deployment Guide

This guide details how to deploy **PayDocs Frontend** (Next.js) and **PayDocs Backend** (Express + Prisma + Puppeteer) to production platforms such as Vercel, Render, Railway, Docker, or DigitalOcean.

---

## 📋 Pre-Deployment Verification Status

| Component | Status | Details |
| :--- | :---: | :--- |
| **Frontend Production Build** | ✅ PASS | `next build` compiled all 29 routes cleanly in 17.2s. |
| **Backend TypeScript Build** | ✅ PASS | `tsc` compiled cleanly to `dist/server.js`. |
| **Puppeteer Optimization** | ✅ PASS | Singleton browser pool with auto-closing page tabs. |
| **Reverse Proxy Rate-Limiting** | ✅ PASS | `trust proxy` configured for Cloudflare / ALB / Nginx. |
| **Type Safety & Linting** | ✅ PASS | 0 TypeScript errors across codebase. |

---

## 🌐 1. Deploying Frontend (Vercel)

1. Push your code to GitHub / GitLab.
2. Go to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Import your `PayDocs` repository and set the **Root Directory** to `frontend`.
4. Set the Framework Preset to **Next.js**.
5. Add the following **Environment Variables**:
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
   NEXTAUTH_SECRET=your_production_nextauth_secret
   NEXTAUTH_URL=https://your-frontend-domain.vercel.app
   ```
6. Click **Deploy**. Vercel will build and deploy the Next.js frontend globally.

---

## ⚙️ 2. Deploying Backend (Render / Railway / Render Docker)

Because the backend utilizes **Puppeteer** (Chromium) for vector PDF generation, deploy to a platform that supports Node.js with Chromium headless support (e.g. Render, Railway, or Docker).

### Option A: Render.com Web Service
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and set the **Root Directory** to `backend`.
3. Set **Build Command**:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
4. Set **Start Command**:
   ```bash
   npm start
   ```
5. Add **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   JWT_SECRET=your_secure_jwt_secret_key
   DATABASE_URL=postgresql://user:password@ep-host.supabase.co/paydocs?sslmode=require
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM="PayDocs Support" <your_email@gmail.com>
   CONVERTAPI_SECRET=your_convertapi_secret
   ```

### Option B: Railway.app / Docker
If deploying via Docker, ensure `puppeteer` dependencies (`libnss3`, `libatk1.0-0`, `libxss1`) are installed in the base container.

---

## 🗄️ 3. Database Migration (SQLite to PostgreSQL)

For cloud production environments where disk storage is ephemeral:
1. In `backend/prisma/schema.prisma`, update provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Run database migration command:
   ```bash
   npx prisma db push
   ```

---

## 🔍 Health Check & Smoke Test

After deploying both services:
- **Backend Health Check**: Open `https://your-backend-domain.com/api/health` ➔ Should return `{"status":"ok"}`.
- **Frontend Check**: Open `https://your-frontend-domain.com` ➔ Test payslip generation, PDF export, and currency switching.
