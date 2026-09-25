import * as vscode from 'vscode';
import { SpringBootPanel } from '../webview/SpringBootPanel';

export function initializeSpringBoot(context: vscode.ExtensionContext): void {
    SpringBootPanel.createOrShow(context);
}
