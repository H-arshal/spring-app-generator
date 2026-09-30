import * as vscode from 'vscode';
import { initializeSpringBoot } from './commands/initializeSpringBoot';
import { SpringBootPanel } from './webview/SpringBootPanel';
import { Logger } from './utils/logger';

export function activate(context: vscode.ExtensionContext): void {
    Logger.initialize(context);
    Logger.info('Spring App Generator activated');

    // ── Command ──────────────────────────────────────────────────────────────
    const command = vscode.commands.registerCommand(
        'springBootInitializer.initialize',
        () => initializeSpringBoot(context)
    );
    context.subscriptions.push(command);

    // ── Activity Bar: Empty tree so the Welcome View renders ─────────────
    const emptyTreeProvider: vscode.TreeDataProvider<never> = {
        getTreeItem: () => { throw new Error('No items'); },
        getChildren: () => [],
    };
    const treeView = vscode.window.createTreeView('springAppGeneratorWelcome', {
        treeDataProvider: emptyTreeProvider,
    });
    context.subscriptions.push(treeView);

    // ── Status Bar Button ────────────────────────────────────────────────────
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );
    statusBarItem.text = '🌱 Spring App Generator';
    statusBarItem.tooltip = 'Create a new Spring Boot project';
    statusBarItem.command = 'springBootInitializer.initialize';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    Logger.info('Activity Bar view and Status Bar button registered');
}

export function deactivate(): void {
    SpringBootPanel.dispose();
    Logger.info('Spring App Generator deactivated');
}
