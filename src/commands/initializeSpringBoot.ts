import * as vscode from 'vscode';
import { SpringBootPanel } from '../webview/SpringBootPanel';

export function initializeSpringBoot(context: vscode.ExtensionContext): void {
    // Automatically close the secondary side bar (like the AI chat panel) to maximize UI space
    vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');
    
    SpringBootPanel.createOrShow(context);
}
