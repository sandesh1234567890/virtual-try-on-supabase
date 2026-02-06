-- Paste this into your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Create Product table
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Create TryOnStats table
CREATE TABLE IF NOT EXISTS "TryOnStats" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TryOnStats_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TryOnStats_productId_fkey') THEN
        ALTER TABLE "TryOnStats" 
        ADD CONSTRAINT "TryOnStats_productId_fkey" 
        FOREIGN KEY ("productId") 
        REFERENCES "Product"("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;
