
import * as vscode from 'vscode';
import { GenerateRequest, ProgressUpdate, InitializrMetadata } from '../initializr/types';
import { extractZip } from './ZipService';
import { cleanupFiles, ensureDir } from './FileService';
import { WorkspaceService } from './WorkspaceService';
import { throwIfInvalid } from '../validation/projectValidator';
import { Logger } from '../utils/logger';
import { FilesystemError } from '../utils/errors';

const STEPS = [
    'Validating configuration...',     // 0
    'Fetching project metadata...',    // 1
    'Preparing request...',            // 2
    'Generating project...',           // 3
    'Downloading project...',          // 4
    'Extracting files...',             // 5
    'Finalizing workspace...'          // 6
];

export interface GenerateResult {
    projectPath: string;
    projectName: string;
    openedInNewWindow: boolean;
}

export class ProjectService {
    private _writtenFiles: string[] = [];

    constructor(
        private readonly _context: vscode.ExtensionContext,
        private readonly _onProgress: (update: ProgressUpdate) => void,
        private readonly _isCancelled: () => boolean
    ) {}

    async generate(request: GenerateRequest): Promise<GenerateResult> {
        // ── Step 0: Validate ──────────────────────────────────────────────────
        this._progress(0);
        const metadata = await this._getMetadata();
        throwIfInvalid(request, metadata);
        this._checkCancelled();

        // ── Step 1/2: Prepare ────────────────────────────────────────────────
        this._progress(1);
        const { InitializrClient } = await import('../initializr/InitializrClient');
        const client = new InitializrClient();
        this._progress(2);
        this._checkCancelled();

        // ── Step 3/4: Generate + download ────────────────────────────────────
        this._progress(3);
        const zipBytes = await client.generateProject(request);
        this._progress(4);
        this._checkCancelled();

        // ── Resolve target path ───────────────────────────────────────────────
        const targetPath = WorkspaceService.resolveTargetPath(
            request.targetPath,
            request.artifactId,
            request.createSubfolder
        );

        // Ensure directory exists
        try {
            ensureDir(targetPath);
        } catch (err) {
            throw new FilesystemError(`Cannot create target directory: ${targetPath}`, err);
        }

        // ── Step 5: Extract ───────────────────────────────────────────────────
        this._progress(5);
        try {
            this._writtenFiles = await extractZip(zipBytes, targetPath);
        } catch (err) {
            // Clean up any partial writes before re-throwing
            await cleanupFiles(this._writtenFiles, targetPath);
            throw err;
        }
        this._checkCancelled();

        // ── Step 6: Workspace ─────────────────────────────────────────────────
        this._progress(6);
        await WorkspaceService.refreshExplorer();

        Logger.info(`Project generated successfully at: ${targetPath}`);

        return {
            projectPath: targetPath,
            projectName: request.name || request.artifactId,
            openedInNewWindow: false
        };
    }

    private _progress(step: number): void {
        this._onProgress({
            step,
            total: STEPS.length,
            message: STEPS[step]
        });
    }

    private _checkCancelled(): void {
        if (this._isCancelled()) {
            // Clean up partial writes
            cleanupFiles(this._writtenFiles, '').catch(() => undefined);
            throw new Error('CANCELLED');
        }
    }

    private async _getMetadata(): Promise<InitializrMetadata | null> {
        try {
            const { fetchMetadata } = await import('../initializr/metadata');
            return await fetchMetadata(this._context);
        } catch {
            return null; // Validation will proceed without version checks
        }
    }
}
