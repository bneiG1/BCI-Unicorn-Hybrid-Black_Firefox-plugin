import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the file paths to process
const filesToProcess = [
    path.join(__dirname, '..', 'dist', 'src', 'flasher', 'EEGselector.js'),
    path.join(__dirname, '..', 'src', 'flasher', 'EEGselector.ts')
];

// Function to remove `export {};` from a file
function removeExportStatement(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
        }

        // Remove `export {};` from the file content
        const updatedContent = data.replace(/^\s*export\s*{\s*};?\s*$/gm, '');

        // Write the updated content back to the file
        fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file ${filePath}:`, err);
            } else {
                console.log(`Removed 'export {};' from ${filePath}`);
            }
        });
    });
}

// Process each file
filesToProcess.forEach(removeExportStatement);
