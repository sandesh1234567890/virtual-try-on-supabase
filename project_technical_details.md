# Project Technical Details

## Architecture Description
The application follows a modern **Monolithic** architecture built on the **Next.js** framework, which handles both the frontend UI and backend API routes.
*   **Frontend:** React 19 with Tailwind CSS for a responsive, high-performance user interface.
*   **Backend:** Next.js Server Actions and API Routes serve as the backend layer, handling secure API requests and database interactions.
*   **Database:** **Supabase** (PostgreSQL) is used for persistent storage of product data and user sessions, managed via **Prisma ORM**.
*   **AI Engine:** A stateless integration with **Large Language Models (LLMs)** facilitates the core virtual try-on and chatbot features. Images are processed and sent to the LLM inference endpoint, and results are returned to the client.

## System Flow / Workflow Explanation
1.  **User Onboarding:** The user accesses the web app and browses the product catalog (fetched from Supabase).
2.  **Selection:** The user selects a garment (Single mode) or a combination of garments (Combo mode/Dragon Studio).
3.  **Input:** The user uploads their own photo or selects a model.
4.  **Processing:**
    *   The frontend sends the user image and product image(s) to the Next.js API route.
    *   The API route constructs a prompt and payload for the LLM.
    *   The LLM processes the visual data and synthesizes a new image/video.
5.  **Output:** The generated image or 360° video is returned to the frontend and displayed in the "Virtual Mirror" component.
6.  **Interaction:** Users can refine the result or ask the **AI Stylist Chatbot** for advice, which triggers a separate text-based LLM workflow.

## Key Features Implemented
*   **V-Round (360° Try-On):** Generates a rotating video view of the user in the selected outfit.
*   **Dragon Studio (Combo Mode):** Allows independent selection and simultaneous try-on of tops and bottoms.
*   **Real-time AI Chatbot:** Context-aware fashion assistant for style advice and navigation.
*   **Responsive UI:** Optimized for both mobile and desktop experiences.
*   **Secure Admin Panel:** For managing inventory and viewing analytics.

## APIs Used
*   **Google Gemini API (LLM):** Used for both image synthesis (Virtual Try-On) and text generation (Chatbot).
*   **Supabase API:** Managed via Prisma Client for database CRUD operations.

## Datasets Used
*   **Product Catalog:** A curated dataset of clothing items (Tops, Bottoms, Dresses) with metadata stored in our Supabase database.
*   **User Inputs:** Real-time user-uploaded images (processed ephemerally, not stored for training).

## Hardware Used
*   **N/A:** This is a pure software-based web application. No specific IoT or specialized hardware is required beyond a standard server environment for hosting (e.g., Vercel) and a client device (Smartphone/Laptop) for access.
