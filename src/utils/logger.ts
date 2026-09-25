import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

export const Logger = {
    initialize(_context: vscode.ExtensionContext): void {
        outputChannel = vscode.window.createOutputChannel('Spring Boot Initializer');
    },

    info(message: string): void {
        outputChannel?.appendLine(`[INFO]  ${timestamp()} ${message}`);
    },

    warn(message: string, err?: unknown): void {
        const detail = err instanceof Error ? ` — ${err.message}` : '';
        outputChannel?.appendLine(`[WARN]  ${timestamp()} ${message}${detail}`);
    },

    error(message: string, err?: unknown): void {
        const detail = err instanceof Error ? ` — ${err.message}` : '';
        outputChannel?.appendLine(`[ERROR] ${timestamp()} ${message}${detail}`);
    },

    show(): void {
        outputChannel?.show(true);
    }
};

function timestamp(): string {
    return new Date().toISOString();
}
