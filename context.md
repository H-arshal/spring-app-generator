# Spring Boot Initializer — Project Context

> Generated for AI-assisted development. This file is the single source of truth for understanding the codebase.
> Last updated: 2026-09-25

---

## Project Overview

**Spring Boot Initializer** is a VS Code extension that lets users generate Spring Boot projects without leaving the editor. It connects to a Spring Initializr server (default: `https://start.spring.io`), presents a 4-step wizard in a webview, and downloads/extracts the generated project ZIP into a user-chosen location.

- **Type**: VS Code Extension (Node.js + TypeScript)
- **Webview UI**: React 18 + Vite + TypeScript
- **Extension host**: TypeScript, compiled to `out/`
- **License**: MIT
- **Version**: 0.1.0
- **VS Code engine**: ^1.85.0
- **Main entry**: `./out/extension.js`

---

## Directory Structure

```
spring-boot-initializer/
├── .vscode/                          # VS Code workspace settings
├── docs/                             # Architecture/protocol documentation
├── node_modules/                     # Root dependencies
├── out/                              # Compiled extension output (gitignored)
├── src/                              # Extension host TypeScript source
│   ├── extension.ts                  # activate/deactivate entry point
│   ├── commands/
│   │   └── initializeSpringBoot.ts   # Command handler
│   ├── initializr/
│   │   ├── InitializrClient.ts       # HTTP client for Spring Initializr
│   │   ├── metadata.ts               # Metadata fetching + caching
│   │   └── types.ts                  # All shared types/interfaces
│   ├── project/
│   │   ├── ProjectService.ts         # Generation orchestrator (7 steps)
│   │   ├── FileService.ts            # ensureDir, cleanupFiles
│   │   ├── WorkspaceService.ts       # Directory checks, explorer refresh
│   │   └── ZipService.ts             # ZIP extraction + path traversal protection
│   ├── utils/
│   │   ├── errors.ts                 # Custom error classes
│   │   └── logger.ts                 # Output channel logger
│   ├── validation/
│   │   ├── dependencyValidator.ts    # Dependency ID validation
│   │   └── projectValidator.ts       # Config field validation
│   └── webview/
│       ├── SpringBootPanel.ts        # Webview panel lifecycle + HTML template
│       ├── messageHandler.ts         # Message routing (webview ↔ host)
│       ├── state.ts                  # (state management helper)
│       ├── webviewIntegrationTest.ts # Integration test scaffolding
│       ├── WebviewMessages.md        # Message protocol docs
│       └── WebviewProtocol.md        # Protocol definition docs
├── webview-ui/                       # React webview application
│   ├── build/                        # Vite build output (loaded by webview)
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── App.tsx                   # Main app shell (4-step wizard)
│   │   ├── App.css                   # Application layout styles
│   │   ├── index.css                 # Design tokens + base styles
│   │   ├── main.tsx                  # React entry point
│   │   ├── components/               # Reusable UI components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── pages/                    # Step-specific pages
│   │   └── services/                 # Message service (typed postMessage wrapper)
│   ├── index.html                    # Vite HTML entry
│   ├── vite.config.ts                # Vite config (fixed asset names)
│   ├── package.json                  # Webview-specific deps
│   ├── tsconfig.app.json             # App TS config
│   ├── tsconfig.node.json            # Node TS config
│   └── eslint.config.js              # Webview ESLint config
├── .eslintrc.json                    # Extension ESLint config
├── context.md                        # This file
├── package.json                      # Extension manifest + scripts
├── package-lock.json
├── README.md                         # Project documentation
└── tsconfig.json                     # Extension TS config
```

---

## package.json Scripts

```json
"vscode:prepublish": "npm run compile && npm run build:webview",
"compile": "tsc -p ./",
"watch": "tsc -watch -p ./",
"build:webview": "cd webview-ui && npm run build",
"watch:webview": "cd webview-ui && npm run dev",
"pretest": "npm run compile",
"test": "node ./out/test/runTest.js",
"test:unit": "mocha --require ts-node/register 'test/unit/**/*.test.ts'",
"lint": "eslint src --ext ts",
"package": "vsce package",
"publish": "vsce publish"
```

### Dependencies
- **Runtime**: `adm-zip` (ZIP handling)
- **Dev**: TypeScript 5.5.3, ESLint 8.57, Mocha, ts-node, @types/vscode, @vscode/test-electron

### Extension Configuration
```json
"springBootInitializer.initializrUrl": {
  "type": "string",
  "default": "https://start.spring.io",
  "description": "Spring Initializr server URL..."
}
```

---

## Extension Commands & Activation

- **Command ID**: `springBootInitializer.initialize`
- **Title**: `Spring Boot: Initialize Spring Boot`
- **Category**: `Spring Boot`
- **Activation event**: `onCommand:springBootInitializer.initialize`
- **Entry point**: `src/extension.ts`

### activate(context)
```typescript
export function activate(context: vscode.ExtensionContext): void {
    Logger.initialize(context);
    Logger.info('Spring Boot Initializer activated');
    const command = vscode.commands.registerCommand(
        'springBootInitializer.initialize',
        () => initializeSpringBoot(context)
    );
    context.subscriptions.push(command);
}
```

### deactivate()
```typescript
export function deactivate(): void {
    SpringBootPanel.dispose();
    Logger.info('Spring Boot Initializer deactivated');
}
```

### initializeSpringBoot(context)
```typescript
export function initializeSpringBoot(context: vscode.ExtensionContext): void {
    SpringBootPanel.createOrShow(context);
}
```

---

## Initializr Client (`src/initializr/InitializrClient.ts`)

### Configuration
- Reads `springBootInitializer.initializrUrl` from VS Code settings (default: `https://start.spring.io`)
- Exposes `baseUrl` getter

### getMetadata(): Promise<any>
- **Endpoint**: `GET {baseUrl}/` (Spring Initializr metadata endpoint)
- **Headers**: `Accept: application/json`, `User-Agent: VS Code Spring Boot Initializer Extension`
- **Timeout**: 10 seconds
- **Success**: Parses JSON response, returns parsed object
- **Errors**: Throws `InitializrError` for non-200 or invalid JSON; `NetworkError` for connection failures/timeouts

### generateProject(config: ProjectConfiguration): Promise<Uint8Array>
- **Endpoint**: `POST {baseUrl}/starter.zip`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Timeout**: 30 seconds
- **Success**: Concatenates response chunks into `Buffer`, returns as `Uint8Array`
- **Errors**: Throws `InitializrError` for non-200 (attempts to parse JSON error message); `NetworkError` for connection failures

### _buildFormData(config): string
Form parameters sent to Spring Initializr:
```
type         = config.projectType
language     = config.language
bootVersion  = config.bootVersion
groupId      = config.groupId
artifactId   = config.artifactId
name         = config.name
description  = config.description
packageName  = config.packageName
packaging    = config.packaging
javaVersion  = config.javaVersion
dependencies = config.dependencies.join(',')  // only if length > 0
```

---

## Metadata Fetching & Caching (`src/initializr/metadata.ts`)

### Constants
- `CACHE_TTL_MS`: 24 hours (86400000ms)
- `CACHE_KEY`: `'initializr.metadata.cache'`

### fetchMetadata(context): Promise<InitializrMetadata>
- Checks `context.globalState` for cached metadata first
- If cache exists and age < 24h: returns cached, triggers background refresh (fire-and-forget)
- If cache missing or expired: fetches fresh, parses, caches, returns

### Cache Structure
```typescript
interface MetadataCache {
    timestamp: number;
    data: InitializrMetadata;
    sourceUrl: string;
}
```

### parseMetadata(raw): InitializrMetadata
Transforms Spring Initializr raw response to typed format:
- `bootVersions`, `javaVersions`, `languages`, `projectTypes`, `packagingTypes` from select options
- `dependencyGroups` from grouped dependency values
- `defaults` extracted from raw defaults or fallback values:
  - bootVersion: raw default || first option || `'3.3.4'`
  - language: raw default || `'java'`
  - projectType: raw default || `'maven-project'`
  - packaging: raw default || `'jar'`
  - javaVersion: raw default || first option || `'21'`
  - groupId: `'com.example'`
  - artifactId: `'demo'`

### parseSelectOptions(values): SelectOption[]
```typescript
values.map(v => ({ id: v.id || '', name: v.name || v.id || '', default: v.default === true }))
```

### parseDependencyGroups(values): DependencyGroup[]
```typescript
values.map(group => ({
    name: group.name || '',
    dependencies: (group.values || []).map(dep => ({
        id: dep.id || '',
        name: dep.name || dep.id || '',
        description: dep.description || '',
        versionRange: dep.versionRange
    }))
}))
```

---

## Types & Interfaces (`src/initializr/types.ts`)

### SelectOption
```typescript
{ id: string; name: string; default?: boolean }
```

### DependencyOption extends SelectOption
```typescript
{ id: string; name: string; description: string; versionRange?: string }
```

### DependencyGroup
```typescript
{ name: string; dependencies: DependencyOption[] }
```

### MetadataDefaults
```typescript
{
    bootVersion: string;
    language: string;
    projectType: string;
    packaging: string;
    javaVersion: string;
    groupId: string;
    artifactId: string;
}
```

### InitializrMetadata
```typescript
{
    bootVersions: SelectOption[];
    javaVersions: SelectOption[];
    languages: SelectOption[];
    projectTypes: SelectOption[];
    packagingTypes: SelectOption[];
    dependencyGroups: DependencyGroup[];
    defaults: MetadataDefaults;
}
```

### ProjectConfiguration
```typescript
{
    bootVersion: string;
    language: string;
    projectType: string;
    packaging: string;
    javaVersion: string;
    groupId: string;
    artifactId: string;
    name: string;
    description: string;
    packageName: string;
    dependencies: string[];
}
```

### GenerateRequest extends ProjectConfiguration
```typescript
{
    // ...all ProjectConfiguration fields
    targetPath: string;
    createSubfolder: boolean;
}
```

### ProgressUpdate
```typescript
{ step: number; total: number; message: string; details?: string }
```

### DirectoryMode
```typescript
'workspace' | 'newFolder' | 'chooseFolder'
```

### DirectoryStatus
```typescript
'empty' | 'nonEmpty' | 'springProject' | 'notFound' | 'noPermission'
```

### ErrorCode
```typescript
'VALIDATION_ERROR'
| 'NETWORK_ERROR'
| 'INITIALIZR_ERROR'
| 'ZIP_INVALID'
| 'ZIP_PATH_TRAVERSAL'
| 'EXTRACTION_ERROR'
| 'FILESYSTEM_ERROR'
| 'DIRECTORY_CONFLICT'
| 'CANCELLED'
```

### DirectoryMode/Status Notes
- `TargetDirectory` interface: `{mode: DirectoryMode, path: string, newFolderName?: string}`

---

## Project Service (`src/project/ProjectService.ts`)

### Constructor
```typescript
constructor(
    private readonly _context: vscode.ExtensionContext,
    private readonly _onProgress: (update: ProgressUpdate) => void,
    private readonly _isCancelled: () => boolean
) {}
```

### Generation Steps (7 total)
```typescript
const STEPS = [
    'Validating configuration...',     // 0
    'Fetching project metadata...',    // 1
    'Preparing request...',            // 2
    'Generating project...',           // 3
    'Downloading project...',          // 4
    'Extracting files...',             // 5
    'Finalizing workspace...'          // 6
];
```

### generate(request: GenerateRequest): Promise<GenerateResult>
Full generation flow:
1. **Step 0 (Validate)**: Fetch metadata, call `throwIfInvalid(request, metadata)`, check cancelled
2. **Step 1 (Prepare)**: Dynamically import `InitializrClient`
3. **Step 2**: Progress update
4. **Step 3 (Generate + download)**: `client.generateProject(request)` -> ZIP bytes
5. **Step 4**: Progress update
6. **Resolve target path**: `WorkspaceService.resolveTargetPath(request.targetPath, request.artifactId, request.createSubfolder)`
7. **Ensure directory**: `ensureDir(targetPath)` (throws `FilesystemError` on failure)
8. **Step 5 (Extract)**: `extractZip(zipBytes, targetPath)` (cleans up on error)
9. **Step 6 (Workspace)**: `WorkspaceService.refreshExplorer()`
10. Return `{projectPath, projectName, openedInNewWindow: false}`

### Private Methods
- `_progress(step)`: Calls `_onProgress({step, total: STEPS.length, message: STEPS[step]})`
- `_checkCancelled()`: If `_isCancelled()` returns true, cleans up partial writes and throws `Error('CANCELLED')`
- `_getMetadata()`: Fetches metadata via dynamic import; returns `null` on error (validation proceeds without version checks)

### GenerateResult
```typescript
{ projectPath: string; projectName: string; openedInNewWindow: boolean }
```

---

## ZIP Extraction & Path Traversal Protection (`src/project/ZipService.ts`)

### extractZip(zipBytes: Uint8Array, targetDir: string): Promise<string[]>
Two-phase extraction for security:

**Phase 1 - Validate ALL entries before writing any file:**
```typescript
const resolvedBase = path.resolve(targetDir);
for (const entry of entries) {
    const entryName = normalizeEntryName(entry.entryName);
    if (!isSafePath(resolvedBase, entryName)) {
        throw new PathTraversalError(entry.entryName);
    }
}
```

**Phase 2 - Extract (all entries are pre-validated):**
```typescript
for (const entry of entries) {
    const destPath = path.resolve(targetDir, entryName);
    if (entry.isDirectory) {
        fs.mkdirSync(destPath, { recursive: true });
    } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, entry.getData());
        writtenPaths.push(destPath);
    }
}
```

Returns: array of written file paths

### isSafePath(resolvedBase: string, entryName: string): boolean
Core path traversal protection:
```typescript
const normalised = entryName.replace(/\\/g, '/');  // Windows separator normalization
const resolved = path.resolve(resolvedBase, normalised);
const base = resolvedBase.endsWith(path.sep) ? resolvedBase : resolvedBase + path.sep;
return resolved.startsWith(base) || resolved === resolvedBase;
```

### normalizeEntryName(entryName: string): string
Strips top-level project folder from Spring Initializr ZIP entries:
```typescript
const parts = entryName.replace(/\\/g, '/').split('/');
if (parts.length > 1) {
    return parts.slice(1).join('/');  // Remove leading empty segments and top-level project folder
}
return entryName;
```

---

## File Service (`src/project/FileService.ts`)

### cleanupFiles(filePaths: string[], targetDir: string): Promise<void>
- Deletes files in reverse order (deepest first)
- Uses `fs.unlinkSync` for each existing file
- Then calls `removeEmptyDirs(targetDir)` to clean up empty directories

### removeEmptyDirs(dir: string): void (private)
- Recursively traverses directory tree
- Removes directories that are empty using `fs.rmdirSync`

### ensureDir(dirPath: string): void
- Creates directory and parents using `fs.mkdirSync(dirPath, { recursive: true })`
- Throws `FilesystemError` on failure

---

## Workspace Service (`src/project/WorkspaceService.ts`)

### SPRING_BUILD_FILES
```typescript
const SPRING_BUILD_FILES = ['pom.xml', 'build.gradle', 'build.gradle.kts'];
```

### getCurrentWorkspaceFolder(): string | undefined
Returns first workspace folder path, or `undefined` if none open.

### checkDirectory(dirPath: string): Promise<DirectoryStatus>
Returns status of target directory:
- `notFound`: directory doesn't exist
- `noPermission`: not a directory, or error accessing it
- `empty`: directory exists and has no entries
- `springProject`: directory contains `pom.xml`, `build.gradle`, or `build.gradle.kts`
- `nonEmpty`: directory has entries but no Spring build files

### refreshExplorer(): Promise<void>
Executes `workbench.files.action.refreshFilesExplorer` VS Code command.

### openInNewWindow(folderPath: string): Promise<void>
Executes `vscode.openFolder` with `forceNewWindow: true`.

### addFolderToWorkspace(folderPath: string): Promise<void>
Adds folder to current workspace via `vscode.workspace.updateWorkspaceFolders`.

### resolveTargetPath(basePath: string, artifactId: string, createSubfolder: boolean): string
```typescript
if (createSubfolder) {
    return path.join(basePath, artifactId);
}
return basePath;
```

---

## Validation (`src/validation/`)

### projectValidator.ts

**Regex Patterns:**
```typescript
const GROUP_ID_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;
const ARTIFACT_ID_REGEX = /^[a-z][a-z0-9-]*$/;
const PACKAGE_NAME_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;
```

### validateProjectConfig(config, metadata): ValidationResult
Validates each field:
- **groupId**: Required, must match GROUP_ID_REGEX
- **artifactId**: Required, must match ARTIFACT_ID_REGEX
- **name**: Required, max 100 characters
- **packageName**: Required, must match PACKAGE_NAME_REGEX
- **description**: Optional, max 255 characters
- **bootVersion**: Required, must exist in metadata.bootVersions if metadata available
- **javaVersion**: Required, must exist in metadata.javaVersions if metadata available

Returns: `{ valid: boolean; errors: FieldError[] }`
FieldError: `{ field: string; message: string }`

### throwIfInvalid(config, metadata): void
Throws `ValidationError` with first error message and field name if invalid.

### derivePackageName(groupId, artifactId): string
```typescript
const safeArtifact = artifactId.toLowerCase().replace(/[^a-z0-9]/g, '');
return `${groupId}.${safeArtifact}`;
```
Example: `"com.example"` + `"ecommerce-api"` -> `"com.example.ecommerceapi"`

---

### dependencyValidator.ts

### validateDependencies(dependencies, metadata): { valid: string[]; unknown: string[] }
- Builds Set of all valid dependency IDs from metadata.dependencyGroups
- Partitions dependencies into valid/unknown arrays
- Logs warnings for unknown dependency IDs

---

## Utilities (`src/utils/`)

### logger.ts
Output channel-based logger with timestamps:
```typescript
export const Logger = {
    initialize(_context)              // Creates output channel 'Spring Boot Initializer'
    info(message)                     // [INFO]  <timestamp> <message>
    warn(message, err?)               // [WARN]  <timestamp> <message> — <err.message>
    error(message, err?)              // [ERROR] <timestamp> <message> — <err.message>
    show()                            // Shows output channel
}
```

Timestamp format: ISO 8601 (`new Date().toISOString()`)

### errors.ts
Custom error classes:
```typescript
class NetworkError extends Error {
    constructor(message: string, public readonly cause?: unknown)
}

class InitializrError extends Error {
    constructor(message: string, public readonly statusCode?: number, public readonly serverMessage?: string)
}

class ParseError extends Error {
    constructor(message: string, public readonly cause?: unknown)
}

class ValidationError extends Error {
    constructor(message: string, public readonly field?: string)
}

class ZipError extends Error {
    constructor(message: string, public readonly cause?: unknown)
}

class PathTraversalError extends Error {
    constructor(public readonly entryName: string)
}

class FilesystemError extends Error {
    constructor(message: string, public readonly cause?: unknown)
}
```

---

## Webview Panel (`src/webview/SpringBootPanel.ts`)

### SpringBootPanel Class
- **Static**: `currentPanel: SpringBootPanel | undefined`
- **Instance fields**: `_panel: vscode.WebviewPanel`, `_context`, `_messageHandler`, `_disposables: vscode.Disposable[]`

### createOrShow(context: vscode.ExtensionContext): void
- If panel already exists: reveals it and returns
- Otherwise creates `vscode.WebviewPanel` with:
  - View type: `'springBootInitializer'`
  - Title: `'🌱 Spring Boot Initializer'`
  - Options: `enableScripts: true`, `localResourceRoots: [webview-ui/build, media]`, `retainContextWhenHidden: true`

### HTML Template
- Random nonce generated via `crypto.randomBytes(16).toString('base64')`
- CSP: `default-src 'none'; script-src 'nonce-{nonce}'; style-src {cspSource} 'unsafe-inline'; img-src {cspSource} https: data:; font-src {cspSource}`
- Loads compiled Vite bundle: `assets/index.js` (script), `assets/index.css` (stylesheet)
- Mount point: `<div id="root"></div>`

### postMessage(message: HostMessage): void
Forwards messages from host to webview. Logs errors on failure.

### disposePanel(): void
- Clears `currentPanel`
- Disposes panel and all disposables

---

## Message Handler (`src/webview/messageHandler.ts`)

### MessageHandler Class
- **Constructor**: `(panel: SpringBootPanel, context: vscode.ExtensionContext)`
- **State**: `_isProcessing: boolean` — prevents concurrent message processing

### handle(message: WebviewMessage): Promise<void>
Routes messages by type:
```typescript
switch (message.type) {
    case 'initializationRequest':    → _handleInitializationRequest
    case 'dependencySelection':      → _handleDependencySelection
    case 'configurationUpdate':      → _handleConfigurationUpdate
    case 'SELECT_FOLDER':            → _handleSelectFolder
    case 'GENERATE_PROJECT':         → _handleGenerateProject
    case 'generationRequest':        → _handleGenerationRequest
    case 'progressUpdate':           → _handleProgressUpdate
    default:                         → Logger.warn (unknown type)
}
```

### _handleInitializationRequest(request)
1. Fetches metadata via `fetchMetadata(context)`
2. Posts `metadataLoaded` with parsed metadata to webview
3. Gets workspace folder via `WorkspaceService.getCurrentWorkspaceFolder()`
4. Posts `WORKSPACE_INFO` with workspace folder path and suggested project name
5. On error: posts `METADATA_ERROR` with error message

### _handleDependencySelection(selection)
Posts `dependenciesUpdated` with selected dependency IDs to webview.

### _handleConfigurationUpdate(config)
1. Stores config via `_storeConfiguration(config)`
2. Posts `configurationUpdated` with configuration to webview

### _handleSelectFolder(message)
1. Opens native folder picker via `vscode.window.showOpenDialog`
2. Posts `FOLDER_SELECTED` with selected path to webview
3. No action if user cancels

### _handleGenerateProject(message)
Primary generation path — delegates to `_runGeneration(request, config)` using webview-provided `targetPath`.

### _handleGenerationRequest(request)
Legacy path — uses current workspace folder as target, or prompts for folder if none open. Sets `createSubfolder: true`.

### _runGeneration(request: GenerateRequest, config: ProjectConfiguration)
1. Posts `generationStarted` to webview
2. Creates `ProjectService` with progress callback (posts `GENERATION_PROGRESS`)
3. Runs `projectService.generate(request)`
4. On success: posts `generationComplete` with result, then shows VS Code notification with "Open in New Window" / "Open in Current Window" options
5. On error: posts `generationError` with error message

### _storeConfiguration(config)
Saves to `context.globalState` under key `'springBootInitializerConfig'`.

---

## Message Protocol

### Webview → Host Messages

| Message Type | Payload | Purpose |
|---|---|---|
| `initializationRequest` | `{projectId?, template?}` | Request metadata on webview mount |
| `dependencySelection` | `{dependencies: string[], groups?: string[]}` | Notify host of dependency changes |
| `configurationUpdate` | `ProjectConfiguration` | Save/update project configuration |
| `SELECT_FOLDER` | (none) | Open native folder picker |
| `GENERATE_PROJECT` | `GenerateRequest` | Trigger project generation (primary path) |
| `generationRequest` | `ProjectConfiguration` | Trigger project generation (legacy path) |
| `progressUpdate` | `ProgressUpdate` | Report progress (webview → host) |
| `GET_METADATA` | (none) | Request metadata refresh |
| `CHECK_DIRECTORY` | `{path: string}` | Check directory status |
| `CANCEL_GENERATION` | (none) | Cancel in-progress generation |

### Host → Webview Messages

| Message Type | Payload | Purpose |
|---|---|---|
| `metadataLoaded` | `InitializrMetadata` | Send parsed metadata to webview |
| `METADATA_ERROR` | `{message, usingCache}` | Notify metadata fetch failure |
| `dependenciesUpdated` | `{dependencies: string[]}` | Acknowledge dependency changes |
| `configurationUpdated` | `{configuration: ProjectConfiguration}` | Acknowledge config save |
| `generationStarted` | `{configuration: ProjectConfiguration}` | Signal generation start |
| `GENERATION_PROGRESS` | `ProgressUpdate` | Report generation progress |
| `generationComplete` | `{result: {success, projectPath, filesGenerated, extractedSize, nextSteps}}` | Signal generation success |
| `generationError` | `{message: string}` | Signal generation failure |
| `FOLDER_SELECTED` | `{path: string}` | Send selected folder path |
| `DIRECTORY_STATUS` | `{path, status: DirectoryStatus}` | Send directory check result |
| `WORKSPACE_INFO` | `{workspaceFolder?, projectName?}` | Send workspace context |
| `error` | `{message: string}` | Generic error notification |

---

## Webview UI (`webview-ui/src/`)

### Core Application (`App.tsx`)

**4-Step Wizard:**
```typescript
const STEPS: StepDef[] = [
  { id: 'project',     label: 'Platform',    meta: 'Runtime & build tool' },
  { id: 'details',     label: 'Details',     meta: 'Coordinates & output' },
  { id: 'dependencies', label: 'Dependencies', meta: 'Starters & libraries' },
  { id: 'review',      label: 'Review',      meta: 'Confirm & generate' },
];
```

**State:**
- `stepIndex: number` — current step (0-3)
- `furthestIndex: number` — highest reachable step
- `dirMode: DirectoryMode` — 'workspace' | 'newFolder' | 'chooseFolder'
- `dirPath: string` — selected folder path
- `folderName: string` — new subfolder name
- `workspaceFolder: string | undefined` — current workspace folder

**resolveTargetPath():**
```typescript
if (dirMode === 'chooseFolder') return dirPath;
if (dirMode === 'newFolder') return workspaceFolder ?? '';
return workspaceFolder ?? '';
```

**handleGenerate():**
```typescript
const cfg = projectConfig.config;
const basePath = resolveTargetPath();
generation.generate({
    bootVersion: cfg.bootVersion,
    language: cfg.language,
    projectType: cfg.projectType,
    packaging: cfg.packaging,
    javaVersion: cfg.javaVersion,
    groupId: cfg.groupId,
    artifactId: cfg.artifactId,
    name: cfg.name,
    description: cfg.description,
    packageName: cfg.packageName,
    dependencies: cfg.dependencies,
    targetPath: basePath,
    createSubfolder: dirMode !== 'chooseFolder',
});
```

**Layout:**
- `.shell` — flex column container (topbar + body + footer)
- `.rail` — vertical stepper (desktop)
- `.stage` — main content area
- `.shell-bar` — bottom action bar (Back/Continue/Generate)

**Modals:**
- Loading spinner while `metadata.loading`
- Error screen with Retry button if `metadata.error`
- Generation progress modal (non-dismissible) when `isGenerating`
- Success modal with project location and next steps
- Error modal with code-specific title, retry, and change location actions

---

### Hooks (`webview-ui/src/hooks/`)

#### useVsCodeApi.ts
- Provides `VsCodeApi` interface: `{postMessage, getState, setState}`
- In production: calls `acquireVsCodeApi()` once per webview session
- In dev: uses `mockVsCodeApi` with simulated responses and sample metadata
- `useVsCodeApi()` hook: lazily resolves API via `useState` initializer

#### useMetadata.ts
- `MetadataState`: `{metadata, loading, error, refreshedAt}`
- `MetadataHookResult extends MetadataState`: adds `refresh(): void`
- Sends `initializationRequest` on mount
- Listens for `metadataLoaded` and `METADATA_ERROR` messages
- `refresh()`: re-triggers metadata fetch

#### useProjectConfig.ts
- `ProjectConfigState extends ProjectConfiguration`: adds `packageNameEditing: boolean`
- `ProjectConfigHookResult`: `{config, updateField, setGroupId, setArtifactId, setPackageName, resetPackageName, setDependencies, toggleDependency}`
- **FALLBACK defaults**: bootVersion '', language 'java', projectType 'maven-project', packaging 'jar', javaVersion '', groupId 'com.example', artifactId 'demo', name 'demo', packageName 'com.example.demo'
- `seedFromMetadata(metadata)`: initializes from metadata defaults
- `mergeDefaults(prev, metadata)`: fills empty fields from metadata without clobbering user values
- Auto-derives `packageName` from `groupId + derivePackageSuffix(artifactId)` unless `packageNameEditing` is true
- `resetPackageName()`: re-derives from current groupId + artifactId, clears editing flag
- `derivePackageSuffix(artifactId)`: lowercases and strips non-alphanumeric chars

#### useGeneration.ts
- `GenerationStatus`: `'idle' | 'running' | 'success' | 'error'`
- `GenerationResult`: `{success, projectPath, filesGenerated, extractedSize, nextSteps}`
- `GenerationError`: `{message, code?, step?, details?}`
- `GenerationHookResult`: `{status, progress, result, error, generate, dismiss}`
- Listens for: `generationStarted`, `GENERATION_PROGRESS`, `generationComplete`, `generationError`, `error`
- `generate(payload)`: posts `GENERATE_PROJECT`, resets state
- `dismiss()`: clears all state, returns to idle

---

### Pages (`webview-ui/src/pages/`)

#### ProjectPage.tsx
- Platform settings: Spring Boot version, Java version, Language, Packaging, Build tool
- Uses `SelectField` for versions and packaging
- Uses `SegmentedControl` for ≤3 options (Language, Build tool), `RadioGroup` for >3 options
- Receives `metadata: InitializrMetadata | null` and `config: ProjectConfigHookResult`

#### DetailsPage.tsx
- **Coordinates section**: Group, Artifact, Name, Package, Description
- **Output section**: `DirectoryPicker` component
- Package field has "auto" badge or "Reset" button depending on `packageNameEditing` state
- Description field spans 2 columns (`.span-2`)

#### DependenciesPage.tsx
- Search/filter input (matches name, id, description)
- Shows selected dependencies as `SelectedDeps` chips
- Groups dependencies by category with `DependencyList`
- Shows "N selected" count
- `SearchIcon` is an inline SVG component

#### ReviewPage.tsx
- Read-only summary of full configuration
- Resolves option IDs to display names via `label()` helper
- Passes resolved labels to `ReviewView` component
- `allDeps` map resolves dependency IDs to names

---

### Components (`webview-ui/src/components/`)

#### SelectField.tsx
- Props: `{label, value, options: SelectOption[], onChange, hint?, error?, disabled?}`
- Renders `<select>` with mapped `<option>` elements
- Optional hint text and error message

#### RadioGroup.tsx
- Props: `{label, name, options: SelectOption[], value, onChange, hint?, disabled?}`
- Vertical list of radio options with `.option` styling
- Selected option gets `.is-selected` class

#### SegmentedControl.tsx
- Horizontal button group for 2-3 options
- Selected option uses `aria-pressed="true"`
- Compact height (28px)

#### TextField.tsx
- Props: `{label, value, onChange, placeholder?, hint?, error?, disabled?, autoFocus?, affix?}`
- Labeled input with optional affix (badge/button pinned right)
- `.has-affix` class adds right padding for affix

#### Stepper.tsx
- Props: `{steps: StepDef[], currentIndex, furthestIndex, onSelect, variant?: 'rail' | 'compact'}`
- Vertical rail (desktop) or horizontal pills (mobile ≤900px)
- Steps beyond `furthestIndex` are disabled
- Active step highlighted, completed steps show checkmark

#### DirectoryPicker.tsx
- Props: `{mode, path, newFolderName, onModeChange, onPathChange, onFolderNameChange, onBrowseClick, workspaceFolder?}`
- Radio list for three modes: workspace, newFolder, chooseFolder
- Shows folder name input for 'newFolder' mode
- Shows path input + Browse button for 'chooseFolder' mode

#### DependencyRow.tsx
- Exports `DependencyRow` and `DependencyList`
- `DependencyRow`: single selectable dependency (checkbox-style button)
- `DependencyList`: renders list of `DependencyRow` components
- Shows dependency name, description, and id

#### SelectedDeps.tsx
- Removable chips for selected dependencies
- Each chip shows dependency name with × remove button

#### ReviewView.tsx
- Read-only configuration summary
- Sections: Project (coordinates), Runtime (versions), Dependencies (list)
- `Row` helper component for label/value pairs

#### ProgressView.tsx
- Props: `{progress: ProgressUpdate, stepLabels?: string[]}`
- Determinate progress bar based on `step/total`
- Optional timeline showing completed/current/pending steps
- Uses `role="progressbar"` with aria attributes

#### ErrorView.tsx
- Props: `{message, code?, step?, details?, recoverable?, onRetry, onChooseLocation}`
- Maps error codes to user-friendly titles (e.g., `NETWORK_ERROR` -> "Couldn't reach Spring Initializr")
- Shows error message, optional details block, step number
- Footer: "Change location" and "Retry" buttons

---

### Message Service (`webview-ui/src/services/messageService.ts`)

### createMessageService(vscodeApi): MessageService
- Wraps VS Code `postMessage` with typed WebviewMessage/HostMessage interfaces
- Maintains Set of registered message handlers
- Listens for `window.addEventListener('message', ...)` events
- Returns `{post, onMessage}`

### MessageService Interface
```typescript
{
    post: <T extends WebviewMessage['type']>(type: T, payload?: MessagePayload<T>) => void
    onMessage: (handler: MessageHandler) => () => void  // returns unsubscribe function
}
```

### Webview Types (duplicated in webview-ui for independent compilation)
- `ProjectConfiguration`, `GenerationPayload`, `InitializrMetadata`, `SelectOption`, `DependencyOption`, `DependencyGroup`, `MetadataDefaults`, `ProgressUpdate`, `DirectoryMode`, `DirectoryStatus`, `TargetDirectory`, `ErrorCode`
- Message types: `InitializationRequestMsg`, `DependencySelectionMsg`, `ConfigurationUpdateMsg`, `GenerationRequestMsg`, `GetMetadataMsg`, `GenerateProjectMsg`, `SelectFolderMsg`, `CheckDirectoryMsg`, `CancelGenerationMsg`
- Host messages: `MetadataLoadedMsg`, `MetadataErrorMsg`, `DependenciesUpdatedMsg`, `ConfigurationUpdatedMsg`, `GenerationStartedMsg`, `GenerationProgressMsg`, `GenerationCompleteMsg`, `GenerationErrorMessage`, `DirectoryStatusMsg`, `FolderSelectedMsg`, `WorkspaceInfoMsg`

---

### CSS Design System (`webview-ui/src/`)

#### index.css — Design Tokens & Base
**Color Palette (light mode):**
- Backgrounds: `--bg: #ffffff`, `--bg-subtle: #f7f7f8`, `--bg-inset: #f1f1f3`, `--bg-raised: #ffffff`
- Borders: `--border: #e6e6e9`, `--border-strong: #d4d4da`
- Text: `--text: #1b1c20`, `--text-muted: #63656e`, `--text-subtle: #8b8d96`
- Accent: `--accent: #2f7d5b` (green), `--accent-soft: #eaf4ef`
- Danger: `--danger: #c0392b`, `--danger-soft: #fbecea`

**Color Palette (dark mode via `prefers-color-scheme`):**
- Backgrounds: `--bg: #17181b`, `--bg-subtle: #1c1d21`, `--bg-inset: #212227`, `--bg-raised: #1e1f23`
- Accent: `--accent: #63c896` (light green)

**Spacing Scale:**
`--sp-1: 4px` through `--sp-10: 40px`

**Border Radius:**
`--r-xs: 3px`, `--r-sm: 5px`, `--r-md: 7px`

**Typography:**
- Sans: system font stack (-apple-system, Segoe UI, Roboto, etc.)
- Mono: ui-monospace, SFMono-Regular, Menlo, Consolas, etc.
- Base font size: 13px, line-height: 1.5

**Layout Constants:**
- `--content-max: 720px`, `--rail-w: 232px`, `--topbar-h: 56px`

#### App.css — Application Layout
- `.shell` — flex column (100vh)
- `.topbar` — 56px height, border-bottom
- `.rail` — 232px fixed width, vertical stepper
- `.stage` — flex 1, overflow-y auto, max-width 720px content
- `.shell-bar` — bottom action bar, border-top
- `.modal` / `.scrim` — centered modal with backdrop
- Responsive: ≤900px switches to horizontal stepper, ≤640px single column

---

## Vite Configuration (`webview-ui/vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
```

Fixed asset names ensure predictable paths for `SpringBootPanel._getHtmlForWebview()`.

---

## Complete Data Flow

### Webview → Host
```
App.tsx (handleGenerate)
  → useProjectConfig (config state)
  → useGeneration (generation state)
  → messageService.post('GENERATE_PROJECT', payload)
  → vscodeApi.postMessage(message)
  → VS Code webview bridge
  → SpringBootPanel.onDidReceiveMessage
  → MessageHandler.handle(message)
```

### Host Generation Pipeline
```
MessageHandler._handleGenerateProject(message)
  → _runGeneration(request, config)
    → ProjectService(context, onProgress, isCancelled)
      → projectService.generate(request)
        1. fetchMetadata() → cache or fresh fetch
        2. throwIfInvalid() → validateProjectConfig()
        3. InitializrClient.generateProject() → POST /starter.zip → Uint8Array
        4. WorkspaceService.resolveTargetPath()
        5. FileService.ensureDir()
        6. ZipService.extractZip() → validate all entries → extract files
        7. WorkspaceService.refreshExplorer()
      → postMessage('generationComplete', result)
    → showInformationMessage('Open in New/Current Window?')
```

### Progress Reporting
```
ProjectService._progress(step)
  → onProgress callback
  → MessageHandler posts 'GENERATION_PROGRESS'
  → webview useGeneration hook updates progress state
  → ProgressView component displays progress bar
```

---

## Key Design Decisions & Patterns

1. **Two-phase ZIP extraction**: All paths validated before any file written (prevents partial extraction on traversal attack)
2. **Dynamic imports**: `InitializrClient` and `metadata` loaded lazily via `await import()` to reduce startup cost
3. **Metadata caching**: 24-hour cache in `globalState` with background refresh (stale-while-revalidate pattern)
4. **Message serialization**: `_isProcessing` flag prevents concurrent message handling
5. **Singleton webview panel**: Only one `SpringBootPanel` at a time; `createOrShow` reveals existing
6. **Fixed asset names**: Vite configured with `entryFileNames: 'assets/[name].js'` for predictable webview paths
7. **CSP nonce**: Random nonce generated per HTML render for script-src security
8. **Package auto-derivation**: `packageName` derived from `groupId + artifactId` with editing override flag
9. **Retain context**: `retainContextWhenHidden: true` preserves webview state when switching tabs
10. **Mock API in dev**: `mockVsCodeApi` provides sample data for local browser development without VS Code

---

## Error Handling Strategy

### Custom Error Classes (`src/utils/errors.ts`)
All errors extend base `Error` with optional contextual properties:
- `NetworkError(message, cause?)` — network/connection failures
- `InitializrError(message, statusCode?, serverMessage?)` — server-side errors
- `ParseError(message, cause?)` — JSON/response parsing failures
- `ValidationError(message, field?)` — config validation failures
- `ZipError(message, cause?)` — ZIP processing failures
- `PathTraversalError(entryName)` — security violation
- `FilesystemError(message, cause?)` — disk I/O failures

### Error Propagation
1. `InitializrClient` throws typed errors on HTTP/network failures
2. `ProjectService.generate()` propagates errors, cleans up partial writes on extraction failure
3. `MessageHandler._runGeneration()` catches errors, posts `generationError` to webview
4. Webview `useGeneration` hook updates error state, `ErrorView` displays appropriate UI

### Error Codes in UI
- `ERROR_TITLES` map in `ErrorView.tsx` translates error codes to human-readable titles
- Unknown codes fall back to "Generation failed"

---

## Configuration Persistence

- **Key**: `'springBootInitializerConfig'`
- **Storage**: `context.globalState` (extension-wide, persists across sessions)
- **Saved by**: `MessageHandler._storeConfiguration(config)`
- **Triggered by**: Webview posts `configurationUpdate` message

---

## Webview HTML & Security

### CSP Policy
```
default-src 'none';
script-src 'nonce-{nonce}';
style-src {cspSource} 'unsafe-inline';
img-src {cspSource} https: data:;
font-src {cspSource};
```

### Local Resource Roots
- `webview-ui/build` — compiled Vite assets
- `media` — extension icons

### Webview Options
- `enableScripts: true`
- `retainContextWhenHidden: true` — preserves state when tab is hidden

---

## Testing & Build

### Build Commands
```bash
npm run compile          # Compile extension (tsc -p ./)
npm run build:webview    # Build webview (vite build)
npm run watch            # Watch extension compilation
npm run watch:webview    # Watch webview development
npm run lint             # Lint extension source
npm run package          # Package as .vsix
```

### Dependencies
- **Extension host**: `adm-zip` (ZIP handling)
- **Webview**: React 18, Vite, TypeScript

### Integration Test
- `src/webview/webviewIntegrationTest.ts` — test scaffolding for webview integration

---

## Development Workflow

### 1. Modify Extension Host Code
```bash
npm run watch    # Auto-compile on changes
```

### 2. Modify Webview UI
```bash
npm run watch:webview    # Vite dev server with HMR
```

### 3. Build for Production
```bash
npm run compile && npm run build:webview
```

### 4. Run in VS Code
- Press F5 in VS Code to launch Extension Development Host
- Run "Spring Boot: Initialize Spring Boot" command

### 5. Test Changes
```bash
npm run lint
npm test
```

---

## Protocol Documentation

Detailed protocol documentation available in:
- `src/webview/WebviewMessages.md` — Message protocol specification
- `src/webview/WebviewProtocol.md` — Communication protocol definition
- `docs/` — Architecture documentation

---

## Key Constraints for Future Development

1. **Keep types synchronized**: `src/initializr/types.ts` and `webview-ui/src/services/messageService.ts` duplicate message/data types (webview cannot import from extension host). Changes to message types must be applied in BOTH files.

2. **Fixed Vite asset names**: Do NOT change `entryFileNames` in `vite.config.ts` — `SpringBootPanel._getHtmlForWebview()` expects `assets/index.js` and `assets/index.css`.

3. **Path traversal protection**: Never bypass `isSafePath()` validation in `ZipService.extractZip()`. The two-phase pattern (validate all, then extract) is intentional.

4. **Message `_isProcessing` flag**: Do not remove the concurrency guard in `MessageHandler.handle()` — it prevents overlapping state mutations.

5. **CSP nonce**: Never use inline scripts without the nonce in the webview HTML template.

6. **Metadata cache invalidation**: Cache TTL is 24h. To force refresh during development, clear the `initializr.metadata.cache` key from `globalState`.

7. **`retainContextWhenHidden`**: Changing this to `false` will reset webview state when switching tabs.

8. **Error handling**: Always use the custom error classes from `src/utils/errors.ts` — they carry contextual information (status codes, field names, entry names) used in the UI.

---

*End of context document. This file is maintained for AI-assisted development continuity.*
