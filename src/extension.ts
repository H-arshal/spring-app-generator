import * as vscode from 'vscode';
import { initializeSpringBoot } from './commands/initializeSpringBoot';
import { SpringBootPanel } from './webview/SpringBootPanel';
import { Logger } from './utils/logger';

export function activate(context: vscode.ExtensionContext): void {
    Logger.initialize(context);
    Logger.info('Spring Boot Initializer activated');

    const command = vscode.commands.registerCommand(
        'springBootInitializer.initialize',
        () => initializeSpringBoot(context)
    );

    context.subscriptions.push(command);
}

export function deactivate(): void {
    SpringBootPanel.dispose();
    Logger.info('Spring Boot Initializer deactivated');
}
