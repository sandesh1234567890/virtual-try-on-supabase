# Project Implementation Proof & Links

## Implementation Proof

### GitHub Repository Link (required)
*   **Link:** [Insert GitHub Repository URL Here]

### Hosted App Link
*   **Link:** [Insert Vercel/Hosted Deployment URL Here]

### Video Demo Link (Drive / YouTube — required)
*   **Link:** [Insert Google Drive or YouTube Link Here]
    *   *Note: Ensure "Anyone with the link can view" access is enabled. Video should be < 10 minutes.*

### Screenshots (Drive Link)
*   **Link:** [Insert Google Drive Folder Link Here]

### Prototype Link (Figma, etc.)
*   **Link:** [Insert Figma Protocol Link Here]

## Build Instructions / Setup Steps

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   Supabase Account (for Database)
*   Google Cloud Account (for Gemini API)

### Step 1: Clone the Repository
```bash
git clone [Insert GitHub Repository URL Here]
cd [Repository Name]
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory and add the following keys:
```env
# Database Connection (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# AI Integration
GOOGLE_GENERATIVE_AI_API_KEY="[Your Gemini API Key]"

# Authentication & Admin
ADMIN_PASSWORD="[Secure Admin Password]"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Step 4: Database Setup (Prisma)
Initialize the database schema and seed initial data:
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### Step 5: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Step 6: Build for Production
To create an optimized production build:
```bash
npm run build
npm start
```
