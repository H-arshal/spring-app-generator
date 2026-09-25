import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { ZipError, PathTraversalError } from '../utils/errors';
import { Logger } from '../utils/logger';

/**
 * Validates and extracts a ZIP archive to the target directory.
 * ALL entries are validated for path traversal BEFORE any file is written.
 */
export async function extractZip(
    zipBytes: Uint8Array,
    targetDir: string
): Promise<string[]> {
    let zip: AdmZip;

    try {
        zip = new AdmZip(Buffer.from(zipBytes));
    } catch (err) {
        throw new ZipError('Generated archive is invalid or corrupted', err);
    }

    const entries = zip.getEntries();

    if (entries.length === 0) {
        Logger.warn('ZIP archive contains no entries');
        return [];
    }

    // ── Phase 1: Validate ALL entries before writing any file ─────────────────
    const resolvedBase = path.resolve(targetDir);

    for (const entry of entries) {
        const entryName = normalizeEntryName(entry.entryName);

        if (!isSafePath(resolvedBase, entryName)) {
            throw new PathTraversalError(entry.entryName);
        }
    }

    // ── Phase 2: Extract (all entries are safe) ───────────────────────────────
    const writtenPaths: string[] = [];

    for (const entry of entries) {
        const entryName = normalizeEntryName(entry.entryName);
        const destPath = path.resolve(targetDir, entryName);

        if (entry.isDirectory) {
            fs.mkdirSync(destPath, { recursive: true });
        } else {
            const parentDir = path.dirname(destPath);
            fs.mkdirSync(parentDir, { recursive: true });
            fs.writeFileSync(destPath, entry.getData());
            writtenPaths.push(destPath);
            Logger.info(`  Extracted: ${entryName}`);
        }
    }

    Logger.info(`Extracted ${writtenPaths.length} files to: ${targetDir}`);
    return writtenPaths;
}

/**
 * Returns true if the resolved destination path stays inside targetDir.
 * This is the core path traversal protection.
 */
export function isSafePath(resolvedBase: string, entryName: string): boolean {
    // Normalise separators for Windows
    const normalised = entryName.replace(/\\/g, '/');
    const resolved = path.resolve(resolvedBase, normalised);
    const base = resolvedBase.endsWith(path.sep)
        ? resolvedBase
        : resolvedBase + path.sep;

    // Must start with base dir, or equal it (for root-level files)
    return resolved.startsWith(base) || resolved === resolvedBase;
}

/**
 * Strips the top-level project folder from Spring Initializr ZIP entries.
 * Spring Initializr wraps everything in a top-level folder (e.g. "demo/").
 * We extract the contents directly into the target directory.
 */
function normalizeEntryName(entryName: string): string {
    const parts = entryName.replace(/\\/g, '/').split('/');
    // Remove leading empty segments and the top-level project folder
    if (parts.length > 1) {
        return parts.slice(1).join('/');
    }
    return entryName;
}
