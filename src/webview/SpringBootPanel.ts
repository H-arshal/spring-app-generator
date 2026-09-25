import * as vscode from 'vscode';

import * as crypto from 'crypto';
import { HostMessage, WebviewMessage } from '../initializr/types';
import { MessageHandler } from './messageHandler';
import { Logger } from '../utils/logger';

export class SpringBootPanel {
    public static currentPanel: SpringBootPanel | undefined;

    private readonly _panel: vscode.WebviewPanel;
    private readonly _context: vscode.ExtensionContext;
    private readonly _messageHandler: MessageHandler;
    private _disposables: vscode.Disposable[] = [];

    // ─── Public API ──────────────────────────────────────────────────────────

    public static createOrShow(context: vscode.ExtensionContext): void {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If panel already exists, bring it to focus
        if (SpringBootPanel.currentPanel) {
            SpringBootPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'springBootInitializer',
            '🌱 Spring Boot Initializer',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'build'),
                    vscode.Uri.joinPath(context.extensionUri, 'media')
                ],
                retainContextWhenHidden: true
            }
        );

        SpringBootPanel.currentPanel = new SpringBootPanel(panel, context);
    }

    public static dispose(): void {
        SpringBootPanel.currentPanel?.disposePanel();
    }

    public postMessage(message: HostMessage): void {
        this._panel.webview.postMessage(message).then(
            undefined,
            (err) => Logger.error('Failed to post message to webview', err)
        );
    }

    // ─── Private Constructor ─────────────────────────────────────────────────

    private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
        this._panel = panel;
        this._context = context;
        this._messageHandler = new MessageHandler(this, context);

        // Set the webview content
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        // Set icon
        this._panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');

        // Listen for messages from the webview
        this._panel.webview.onDidReceiveMessage(
            (message: WebviewMessage) => this._messageHandler.handle(message),
            null,
            this._disposables
        );

        // Clean up when the panel is closed
        this._panel.onDidDispose(
            () => this.disposePanel(),
            null,
            this._disposables
        );

        Logger.info('SpringBootPanel created');
    }

    private disposePanel(): void {
        SpringBootPanel.currentPanel = undefined;
        this._panel.dispose();
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
        Logger.info('SpringBootPanel disposed');
    }

    // ─── HTML Generation ─────────────────────────────────────────────────────

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const nonce = crypto.randomBytes(16).toString('base64');

        // In production, load the Vite-compiled bundle.
        // vite.config.ts emits to `webview-ui/build` with fixed asset names
        // (`assets/index.js`, `assets/index.css`).
        const buildPath = vscode.Uri.joinPath(
            this._context.extensionUri, 'webview-ui', 'build'
        );

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(buildPath, 'assets', 'index.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(buildPath, 'assets', 'index.css')
        );

        const cspSource = webview.cspSource;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy"
        content="
            default-src 'none';
            script-src 'nonce-${nonce}';
            style-src ${cspSource} 'unsafe-inline';
            img-src ${cspSource} https: data:;
            font-src ${cspSource};
        "
    />
    <link rel="stylesheet" href="${styleUri}" />
    <title>Spring Boot Initializer</title>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    // ─── Webview URI helper ───────────────────────────────────────────────────

    public getWebviewUri(...pathSegments: string[]): vscode.Uri {
        return this._panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this._context.extensionUri, ...pathSegments)
        );
    }

    public get extensionUri(): vscode.Uri {
        return this._context.extensionUri;
    }

    public get webview(): vscode.Webview {
        return this._panel.webview;
    }
}

// Helper used in Architecture.md §4 — locate compiled asset by walking dist/
export function findAssetPath(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    ...segments: string[]
): vscode.Uri {
    return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...segments));
}
