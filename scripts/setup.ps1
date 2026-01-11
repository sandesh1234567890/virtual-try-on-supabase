$env:DATABASE_URL="file:./dev.db"
# Auth secret if needed
$env:AUTH_SECRET="random_secret_string"
# We need this for the build to pass verify, possibly
$env:GEMINI_API_KEY="placeholder_key" 

Write-Host "Setting up environment and generating Prisma client..."
npx prisma generate --schema=prisma/schema.prisma

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated successfully!"
} else {
    Write-Host "❌ Prisma Generation failed with code $LASTEXITCODE"
    exit 1
}
