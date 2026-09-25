import * as fs from 'fs';
import * as path from 'path';
import { FilesystemError } from '../utils/errors';
import { Logger } from '../utils/logger';

/**
 * Deletes a list of previously written files (used during cancellation cleanup).
 */
export async function cleanupFiles(filePaths: string[], targetDir: string): Promise<void> {
    // Delete files in reverse order (deepest first)
    const reversed = [...filePaths].reverse();

    for (const filePath of reversed) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            Logger.warn(`Cleanup: failed to delete ${filePath}`);
        }
    }

    // Attempt to remove now-empty directories inside targetDir
    removeEmptyDirs(targetDir);
    Logger.info(`Cleanup complete for: ${targetDir}`);
}

/**
 * Recursively removes empty directories under root.
 */
function removeEmptyDirs(dir: string): void {
    try {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            const full = path.join(dir, entry);
            if (fs.statSync(full).isDirectory()) {
                removeEmptyDirs(full);
                try {
                    fs.rmdirSync(full); // only removes if empty
                } catch {
                    // not empty, skip
                }
            }
        }
    } catch {
        // dir may no longer exist, ignore
    }
}

/**
 * Ensures a directory exists, creating it and any parents as needed.
 */
export function ensureDir(dirPath: string): void {
    try {
        fs.mkdirSync(dirPath, { recursive: true });
    } catch (err) {
        throw new FilesystemError(`Failed to create directory: ${dirPath}`, err);
    }
}
