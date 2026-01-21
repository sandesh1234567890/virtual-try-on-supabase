# Virtual Try-On (Supabase & Gemini AI)

A premium virtual try-on application built with **Next.js 15**, **Prisma**, **Supabase (PostgreSQL)**, and **Google Gemini AI**.

![Demo Preview](public/preview.jpg) <!-- Ensure you have a preview image or remove this -->

## 🚀 Features

- **Virtual Try-On**: Powered by Gemini 2.0 Flash (Experimental) for high-quality garment synthesis.
- **Supabase Backend**: Persistence for products and analytics using PostgreSQL.
- **Admin Dashboard**: Secure management of your clothing collection.
- **Responsive Design**: Optimized for mobile, tablet, and desktop browsing.
- **Modern UI**: Clean aesthetics with Tailwind CSS and Lucide icons.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **AI**: Google Gemini 2.0 Flash (Image Generation)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📦 Deployment Instructions

### 1. GitHub Setup
1. Initialize a new git repository: `git init`
2. Add all files: `git add .`
3. Commit: `git commit -m "Initial commit - Ready for Vercel"`
4. Create a new repo on GitHub and follow the instructions to push your code.

### 2. Vercel Deployment
1. Connect your GitHub repository to Vercel.
2. **Environment Variables**: Add the following keys in Vercel Project Settings:
   - `DATABASE_URL`: Your Supabase connection string (transaction mode/pooler).
   - `DIRECT_URL`: Your Supabase direct connection string.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `ADMIN_PASSWORD`: A secure password for your dashboard (default: `admin123`).
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
3. **Build Command**: `prisma generate && next build` (This is usually automatic).

### 3. Database Initialization
Once deployed, Vercel will attempt to connect. If your database is empty, the app will auto-seed initial products on the first load. You can also run:
```bash
npx prisma db push
```
to ensure the schema is synced.

## 🔐 Security
The Admin Dashboard is protected by a password guard. You can change the password by updating the `ADMIN_PASSWORD` environment variable.

## 📄 License
MIT
