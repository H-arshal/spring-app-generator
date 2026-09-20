# 🌱 Spring Boot Initializer for VS Code

> Create Spring Boot projects without leaving VS Code.

[![Version](https://img.shields.io/visual-studio-marketplace/v/spring-boot-initializer)](https://marketplace.visualstudio.com/items?itemName=spring-boot-initializer)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/spring-boot-initializer)](https://marketplace.visualstudio.com/items?itemName=spring-boot-initializer)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

---

## What is this?

**Spring Boot Initializer** is a VS Code extension that brings the full [Spring Initializr](https://start.spring.io) experience natively into your editor.

No browser. No tab switching. No manual ZIP download. No manual extraction.

Just:

```
Ctrl + Shift + P
       ↓
Spring Boot: Initialize Spring Boot
       ↓
Configure → Select Dependencies → Generate
       ↓
🚀 Start coding
```

---

## Features

- **Native VS Code UI** — a polished Webview panel that feels like part of VS Code, not a web form
- **Live metadata** — Spring Boot versions, Java versions, and dependencies loaded directly from Spring Initializr — always up to date
- **Full project configuration** — Boot version, Java version, language (Java / Kotlin / Groovy), build tool (Maven / Gradle), packaging (Jar / War), group, artifact, name, description, package name
- **Searchable dependencies** — browse by category or search across all dependencies; selected deps shown as removable chips
- **Auto package name** — derived from Group + Artifact, stays editable
- **Smart directory handling** — generate into current workspace, a new subfolder, or any folder you pick
- **Conflict protection** — warns before generating into a non-empty directory; strongly warns if an existing Spring project is detected
- **Safe ZIP extraction** — path traversal protection; no file is ever silently overwritten
- **7-step progress UI** — visual feedback during generation
- **Workspace integration** — Explorer refreshes automatically; option to open project in a new window
- **Configurable Initializr server** — works with private or enterprise Spring Initializr instances

---

## Installation

### From the VS Code Marketplace

1. Open VS Code
2. Go to **Extensions** (`Ctrl+Shift+X`)
3. Search for `Spring Boot Initializer`
4. Click **Install**

### From a `.vsix` file

```bash
code --install-extension spring-boot-initializer-1.0.0.vsix
```

---

## Usage

1. Open the Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type: `Spring Boot: Initialize Spring Boot`
3. Press **Enter**
4. Configure your project:
   - **Project tab** — Spring Boot version, Java version, language, build tool, packaging
   - **Details tab** — Group, Artifact, Name, Description, Package Name
   - **Dependencies tab** — search and select dependencies
5. Choose where to generate the project
6. Click **Generate Project**
7. Open or continue in workspace

---

## Screenshots

> Screenshots will be added after the UI is implemented.

---

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `springBootInitializer.initializrUrl` | `string` | `https://start.spring.io` | Spring Initializr server URL. Change this to use a private or enterprise Initializr instance. |

### Using a Custom Initializr Server

Open VS Code Settings (`Ctrl+,`) and search for `springBootInitializer`:

```json
{
    "springBootInitializer.initializrUrl": "https://your-internal-initializr.company.com"
}
```

---

## Commands

| Command | Description |
|---------|-------------|
| `Spring Boot: Initialize Spring Boot` | Open the Spring Boot project initializer |

---

## Requirements

- Visual Studio Code `1.85.0` or higher
- Internet access to reach Spring Initializr (or a configured private server)
- No Java installation required — the extension generates the project, it does not run it

---

## How It Works

```
VS Code
   │
   ├── React Webview (UI)
   │       │
   │       │ postMessage()
   │       ▼
   └── Extension Host (Node.js)
               │
               │ HTTPS
               ▼
       Spring Initializr API
       (https://start.spring.io)
               │
               │ ZIP
               ▼
       Extract → Write to disk
               │
               ▼
       VS Code Workspace updated
```

The Webview handles all user interaction. The Extension Host handles all privileged operations (network, filesystem, VS Code API). They communicate exclusively via `postMessage`.

---

## Development

### Prerequisites

```bash
node --version   # 20.x LTS recommended
npm --version    # 10.x+
git --version
vsce --version   # npm install -g @vscode/vsce
```

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/spring-boot-initializer-vscode.git
cd spring-boot-initializer-vscode

# Install extension host dependencies
npm install

# Install Webview UI dependencies
cd webview-ui
npm install
cd ..
```

### Build

```bash
# Build everything (Webview UI + Extension Host)
npm run build
```

### Run in Development

Press **F5** in VS Code to launch the **Extension Development Host** — a separate VS Code window with the extension loaded.

Then: `Ctrl+Shift+P → Spring Boot: Initialize Spring Boot`

### Watch Mode

```bash
npm run watch
```

Watches both the Extension Host (`src/`) and Webview UI (`webview-ui/src/`) for changes.

### Tests

```bash
# All tests
npm test

# Unit tests only (no VS Code instance needed)
npm run test:unit

# Integration tests (launches VS Code)
npm run test:integration
```

---

## Project Structure

```
spring-boot-initializer/
│
├── src/                        # Extension Host (TypeScript)
│   ├── extension.ts            # Entry point
│   ├── commands/               # Command handlers
│   ├── webview/                # Panel lifecycle + messaging
│   ├── initializr/             # Spring Initializr HTTP client
│   ├── project/                # Generation pipeline + workspace
│   ├── validation/             # Config validators
│   └── utils/                  # Logger, error types
│
├── webview-ui/                 # Webview React app (TypeScript + Vite)
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Project / Details / Dependencies
│       ├── hooks/              # useVsCodeApi, useMetadata, useProjectConfig
│       └── services/           # Typed postMessage service
│
├── test/                       # Unit + integration tests
├── docs/                       # Architecture, design, planning docs
├── media/                      # Extension icon
├── package.json                # Extension manifest
└── .gitignore
```

Full architecture details: [`docs/Architecture.md`](./docs/Architecture.md)

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/Architecture.md`](./docs/Architecture.md) | System design, runtime boundaries, data flows |
| [`docs/Design.md`](./docs/Design.md) | Component design, message contracts, UI layout |
| [`docs/API-Contracts.md`](./docs/API-Contracts.md) | Spring Initializr API, postMessage types, validation rules |
| [`docs/Implementation-Plan.md`](./docs/Implementation-Plan.md) | Milestones, task breakdown, tech decisions |
| [`docs/Tasks.md`](./docs/Tasks.md) | Task tracker with acceptance criteria |
| [`docs/Progress.md`](./docs/Progress.md) | Progress dashboard and session log |
| [`docs/Decisions.md`](./docs/Decisions.md) | Technical decision log with rationale |
| [`docs/Testing.md`](./docs/Testing.md) | Test specs and manual test scenarios |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following the coding conventions in `docs/Architecture.md`
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

Please read [`docs/Design.md`](./docs/Design.md) before contributing to understand the architecture and component boundaries.

---

## Roadmap

### 1.0.0 — MVP (current target)
- Native Initializr UI inside VS Code
- Full project configuration
- Dependency search and selection
- Safe project generation and extraction
- Workspace integration

### 1.1.0 — Productivity
- Recent configurations
- Saved project presets
- Manual metadata refresh command

### 1.2.0 — Spring Project Management
- Add dependency to existing project
- Dependency management

### Future
- AI-assisted configuration (natural language → suggested dependencies)

---

## License

[MIT](./LICENSE)

---

## Acknowledgements

- [Spring Initializr](https://start.spring.io) — the project generation engine this extension is built on
- [VS Code Extension API](https://code.visualstudio.com/api) — the platform
