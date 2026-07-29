
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findFile(dir, pattern) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === '.next') continue;
            const found = findFile(filePath, pattern);
            if (found) return found;
        } else if (file.startsWith('virtual-try-on-supabase-main') && file.endsWith('.zip')) {
            return filePath;
        }
    }
    return null;
}

async function unzip() {
    const destDir = 'extracted_content';

    console.log('Searching for zip file...');
    const zipFile = findFile('.', 'virtual-try-on-supabase-main');

    if (!zipFile) {
        console.error('File not found matching pattern: virtual-try-on-supabase-main*.zip');
        process.exit(1);
    }

    console.log(`Found zip file: ${zipFile}`);

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
    }

    const safeName = 'temp_archive.zip';
    fs.copyFileSync(zipFile, safeName);

    try {
        console.log('Attempting to unzip using tar...');
        execSync(`tar -xf "${safeName}" -C "${destDir}"`);
        console.log('Unzip successful!');
    } catch (e) {
        console.error('Tar failed:', e.message);
        try {
            console.log('Attempting to unzip using powershell...');
            const absDest = path.resolve(destDir);
            const absZip = path.resolve(safeName);
            const cmd = `powershell -command "Expand-Archive -Path '${absZip}' -DestinationPath '${absDest}' -Force"`;
            execSync(cmd);
            console.log('Unzip successful via PowerShell!');
        } catch (e2) {
            console.error('PowerShell failed:', e2.message);
            process.exit(1);
        }
    }
}

unzip();
