# Virtual Try-On & Turnaround System - Project Overview

This project is a high-end, Next.js-powered fashion technology suite featuring two flagship modules: **Dragon Studio (Combo Try-On)** and **V-ROUND PRO (360° Turnaround)**.

## Core Features

### 1. Dragon Studio (What Your Dragon)
- **Concept**: A cyberpunk-themed multi-garment synthesis engine.
- **Functionality**: Allows users to select Tops, Bottoms, and Shoes to "ignite" a neural combo onto an uploaded "Identity Node" (user photo).
- **Recent Refinement**: Achieved 1:1 visual parity with the original prototype, including the horizontal neural tray, scanning animations, and sliding notifications.

### 2. V-ROUND PRO
- **Concept**: Automated spatial garment turnaround.
- **Functionality**: Reconstructs a single 2D image into 4 perspectives (Front, Right, Back, Left) and allows for a 360° video export.
- **Recent Refinement**: Restored the cinematic HUD overlay, 800ms frame-sync animation, and professional branding to match the original design exactly.

### 3. Virtual Try-On (Standard)
- A streamlined garment-swapping engine supporting single product "Neural Spells".

## Technical Architecture & Fixes

### API Security & Leak Resolution
- **Problem**: API keys were previously leaked due to being hardcoded in legacy `.html` files in the `public/` and `app/` directories.
- **Fix**: All hardcoded keys have been **removed**. The application now uses a secure server-side proxy pattern.
- **Key Management**: Keys are stored strictly in the `.env` file and accessed via `process.env.GEMINI_API_KEY` in Next.js API routes, ensuring they never reach the client's browser.

### Model Standardization
To resolve "Access Denied" and "Model Not Found" errors, the following models were assigned based on regional availability and capability:
- **Combo Try-On**: `gemini-3-pro-image-preview`
- **Standard Try-On**: `gemini-2.5-flash-image`
- **V-ROUND PRO**: `gemini-2.5-flash-image`

### Backend Routes (`/app/api/`)
- `combo-try-on/`: Handles multi-image synthesis.
- `virtual-try-on/`: Handles standard garment swaps.
- `generate-view/`: Handles spatial view generation for turnarounds.

## Usage Instructions
1.  Ensure `.env` contains a valid `GEMINI_API_KEY`.
2.  Run `npm run dev`.
3.  Navigate to `/dragon` for the Combo Studio or `/v-round` for the 360 Studio.
