import * as vscode from 'vscode';
import {
    WebviewMessage,
    HostMessage,
    InitializationRequest,
    DependencySelection,
    ProjectConfiguration,
    GenerationRequest,
    GenerateRequest,
    GenerateProject,
    FolderSelection
} from '../initializr/types';
import { SpringBootPanel } from './SpringBootPanel';
import { Logger } from '../utils/logger';
import { fetchMetadata } from '../initializr/metadata';
import { ProjectService } from '../project/ProjectService';
import { WorkspaceService } from '../project/WorkspaceService';

export class MessageHandler {
    private readonly _panel: SpringBootPanel;
    private readonly _context: vscode.ExtensionContext;
    private _isProcessing: boolean = false;

    // ─── Public API ──────────────────────────────────────────────────────────

    constructor(panel: SpringBootPanel, context: vscode.ExtensionContext) {
        this._panel = panel;
        this._context = context;
        Logger.info('MessageHandler initialized');
    }

    public async handle(message: WebviewMessage): Promise<void> {
        if (this._isProcessing) {
            Logger.info(`Message processing already in progress, ignoring: ${message.type}`);
            return;
        }

        this._isProcessing = true;

        try {
            switch (message.type) {
                case 'initializationRequest':
                    await this._handleInitializationRequest(message as InitializationRequest);
                    break;
                case 'dependencySelection':
                    await this._handleDependencySelection(message as DependencySelection);
                    break;
                case 'configurationUpdate':
                    await this._handleConfigurationUpdate(message.payload as ProjectConfiguration);
                    break;
                case 'SELECT_FOLDER':
                    await this._handleSelectFolder(message as FolderSelection);
                    break;
                case 'GENERATE_PROJECT':
                    await this._handleGenerateProject(message as GenerateProject);
                    break;
                case 'generationRequest':
                    await this._handleGenerationRequest(message as GenerationRequest);
                    break;
                case 'progressUpdate':
                    await this._handleProgressUpdate(message);
                    break;
                default:
                    Logger.warn(`Unknown message type received: ${(message as { type: string }).type}`);
            }
        } catch (error) {
            Logger.error('Error handling message:', error);
            this._panel.postMessage({
                type: 'error',
                payload: {
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                }
            } as HostMessage);
        } finally {
            this._isProcessing = false;
        }
    }

    // ─── Private Handlers ─────────────────────────────────────────────────────

    private async _handleInitializationRequest(_request: InitializationRequest): Promise<void> {
        Logger.info('Handling initialization request');

        try {
            const metadata = await fetchMetadata(this._context);
            this._panel.postMessage({
                type: 'metadataLoaded',
                payload: metadata
            } as HostMessage);

            // Provide workspace context (folder + suggested project name).
            const workspaceFolder = WorkspaceService.getCurrentWorkspaceFolder();
            this._panel.postMessage({
                type: 'WORKSPACE_INFO',
                payload: {
                    workspaceFolder,
                    projectName: workspaceFolder
                        ? workspaceFolder.split(/[\\/]/).filter(Boolean).pop()
                        : undefined
                }
            } as HostMessage);
        } catch (error) {
            Logger.error('Error fetching metadata', error);
            this._panel.postMessage({
                type: 'METADATA_ERROR',
                payload: {
                    message: error instanceof Error ? error.message : 'Failed to load metadata',
                    usingCache: false
                }
            } as HostMessage);
        }
    }

    private async _handleDependencySelection(selection: DependencySelection): Promise<void> {
        Logger.info('Handling dependency selection');

        this._panel.postMessage({
            type: 'dependenciesUpdated',
            payload: {
                dependencies: selection.payload.dependencies
            }
        } as HostMessage);
    }

    private async _handleConfigurationUpdate(config: ProjectConfiguration): Promise<void> {
        Logger.info('Handling configuration update');

        await this._storeConfiguration(config);

        this._panel.postMessage({
            type: 'configurationUpdated',
            payload: {
                configuration: config
            }
        } as HostMessage);
    }

    /**
     * Opens the native folder picker and reports the chosen path back to the
     * webview. Used by the "Browse…" button on the output-location control.
     */
    private async _handleSelectFolder(_message: FolderSelection): Promise<void> {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Use this folder'
        });

        if (!folderUri || folderUri.length === 0) {
            return;
        }

        this._panel.postMessage({
            type: 'FOLDER_SELECTED',
            payload: { path: folderUri[0].fsPath }
        } as HostMessage);
    }

    /**
     * Generates a project using the target path chosen in the webview. This is
     * the primary path used by the current UI.
     */
    private async _handleGenerateProject(message: GenerateProject): Promise<void> {
        const request = message.payload;
        const config: ProjectConfiguration = request;

        Logger.info('Handling GENERATE_PROJECT');
        await this._runGeneration(request, config);
    }

    /**
     * Legacy path: generation request without a resolved target path. Falls
     * back to the current workspace folder (or prompts if none is open).
     */
    private async _handleGenerationRequest(request: GenerationRequest): Promise<void> {
        const config = request.payload;
        Logger.info('Handling generation request');

        const workspaceFolder = WorkspaceService.getCurrentWorkspaceFolder();
        let targetPath = workspaceFolder;

        if (!targetPath) {
            const folderUri = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Generate Here'
            });

            if (!folderUri || folderUri.length === 0) {
                Logger.info('Project generation cancelled by user');
                return;
            }
            targetPath = folderUri[0].fsPath;
        }

        const generateReq: GenerateRequest = {
            ...config,
            targetPath,
            createSubfolder: true
        };

        await this._runGeneration(generateReq, config);
    }

    /** Shared generation routine used by both message entry points. */
    private async _runGeneration(request: GenerateRequest, config: ProjectConfiguration): Promise<void> {
        try {
            this._panel.postMessage({
                type: 'generationStarted',
                payload: { configuration: config }
            } as HostMessage);

            const projectService = new ProjectService(
                this._context,
                (update) => {
                    this._panel.postMessage({
                        type: 'GENERATION_PROGRESS',
                        payload: update
                    } as HostMessage);
                },
                () => false
            );

            const result = await projectService.generate(request);

            this._panel.postMessage({
                type: 'generationComplete',
                payload: {
                    result: {
                        success: true,
                        projectPath: result.projectPath,
                        filesGenerated: 0,
                        extractedSize: 'Unknown',
                        nextSteps: [
                            'Open the generated project in VS Code',
                            'Run your build tool (Maven/Gradle)'
                        ]
                    }
                }
            } as HostMessage);

            const selection = await vscode.window.showInformationMessage(
                `Successfully generated ${result.projectName}. Would you like to open it?`,
                'Open in New Window',
                'Open in Current Window'
            );

            if (selection === 'Open in New Window') {
                vscode.commands.executeCommand(
                    'vscode.openFolder',
                    vscode.Uri.file(result.projectPath),
                    true
                );
            } else if (selection === 'Open in Current Window') {
                vscode.commands.executeCommand(
                    'vscode.openFolder',
                    vscode.Uri.file(result.projectPath),
                    false
                );
            }
        } catch (error) {
            Logger.error('Error generating project', error);
            this._panel.postMessage({
                type: 'generationError',
                payload: {
                    message: error instanceof Error ? error.message : 'Generation failed'
                }
            } as HostMessage);
        }
    }

    private async _handleProgressUpdate(message: unknown): Promise<void> {
        Logger.info('Handling progress update');
        void message;
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private async _storeConfiguration(config: ProjectConfiguration): Promise<void> {
        const configKey = 'springBootInitializerConfig';
        await this._context.globalState.update(configKey, config);
        Logger.info(`Configuration stored: ${configKey}`);
    }
}