import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { DirectoryStatus } from '../initializr/types';
import { Logger } from '../utils/logger';

const SPRING_BUILD_FILES = ['pom.xml', 'build.gradle', 'build.gradle.kts'];

export class WorkspaceService {
    /**
     * Returns the first workspace folder path, or undefined if none is open.
     */
    static getCurrentWorkspaceFolder(): string | undefined {
        const folders = vscode.workspace.workspaceFolders;
        return folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;
    }

    /**
     * Checks the state of a target directory.
     */
    static async checkDirectory(dirPath: string): Promise<DirectoryStatus> {
        try {
            if (!fs.existsSync(dirPath)) {
                return 'notFound';
            }

            const stat = fs.statSync(dirPath);
            if (!stat.isDirectory()) {
                return 'noPermission';
            }

            const entries = fs.readdirSync(dirPath);

            if (entries.length === 0) {
                return 'empty';
            }

            // Check for Spring project indicators
            const isSpringProject = SPRING_BUILD_FILES.some(f =>
                entries.includes(f)
            );

            return isSpringProject ? 'springProject' : 'nonEmpty';
        } catch (err) {
            Logger.warn(`checkDirectory failed for ${dirPath}`, err);
            return 'noPermission';
        }
    }

    /**
     * Refreshes the VS Code Explorer view.
     */
    static async refreshExplorer(): Promise<void> {
        try {
            await vscode.commands.executeCommand(
                'workbench.files.action.refreshFilesExplorer'
            );
        } catch (err) {
            Logger.warn('Failed to refresh Explorer', err);
        }
    }

    /**
     * Opens a folder in a new VS Code window.
     */
    static async openInNewWindow(folderPath: string): Promise<void> {
        const uri = vscode.Uri.file(folderPath);
        await vscode.commands.executeCommand('vscode.openFolder', uri, true);
    }

    /**
     * Adds a folder to the current workspace.
     */
    static async addFolderToWorkspace(folderPath: string): Promise<void> {
        const uri = vscode.Uri.file(folderPath);
        vscode.workspace.updateWorkspaceFolders(
            vscode.workspace.workspaceFolders
                ? vscode.workspace.workspaceFolders.length
                : 0,
            null,
            { uri }
        );
        await WorkspaceService.refreshExplorer();
    }

    /**
     * Resolves the final target path based on the request.
     * If createSubfolder is true, creates an artifactId subfolder.
     */
    static resolveTargetPath(basePath: string, artifactId: string, createSubfolder: boolean): string {
        if (createSubfolder) {
            return path.join(basePath, artifactId);
        }
        return basePath;
    }
}
