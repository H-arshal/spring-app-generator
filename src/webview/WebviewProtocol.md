# Webview Protocol Documentation

## Overview

This document defines the complete message protocol between the React webview frontend and the Spring Boot Initializer backend extension.

## Protocol Overview

The protocol follows a request-response pattern where:
- **Webview → Backend**: User interactions and configuration data
- **Backend → Webview**: Metadata, progress updates, and generation results

## Message Types

### Backend → Webview (HostMessages)

| Type | Description | When Sent |
|------|-------------|-----------|
| `metadataLoaded` | Spring Initializr metadata for project configuration | In response to `initializationRequest` |
| `dependenciesUpdated` | Acknowledgment of selected dependencies | In response to `dependencySelection` |
| `configurationUpdated` | Confirmation of configuration changes | In response to `configurationUpdate` |
| `generationStarted` | Project generation has begun | In response to `generationRequest` |
| `generationProgress` | Progress update during generation | Periodically during generation |
| `generationComplete` | Project generation finished successfully | When generation completes |
| `generationError` | Error during generation | When generation fails |
| `METADATA_ERROR` | Error loading metadata | When metadata fetch fails |
| `FOLDER_SELECTED` | User selected target directory | When user chooses output folder |
| `DIRECTORY_STATUS` | Status of target directory | When checking directory |

### Webview → Backend (WebviewMessages)

| Type | Description | When Sent |
|------|-------------|-----------|
| `initializationRequest` | Request for initial metadata | When webview loads |
| `dependencySelection` | User-selected project dependencies | When user selects dependencies |
| `configurationUpdate` | Updated project configuration | When user changes configuration |
| `generationRequest` | Request to generate project | When user clicks Generate |
| `progressUpdate` | Progress update to backend | To report generation progress |
| `error` | Error report from webview | When errors occur |
| `GET_METADATA` | Request for metadata | To refresh metadata |
| `GENERATE_PROJECT` | Alias for generation request | Alternative to `generationRequest` |
| `SELECT_FOLDER` | Request to select output directory | When user chooses output folder |
| `CHECK_DIRECTORY` | Check directory status | When validating output path |
| `CANCEL_GENERATION` | Cancel ongoing generation | When user cancels generation |

## Message Flow Example

```
1. Webview loads → sends initializationRequest
2. Backend → sends metadataLoaded (with bootVersions, dependencies, etc.)
3. Webview loads UI with metadata
4. User selects dependencies → sends dependencySelection
5. Backend → sends dependenciesUpdated
6. User updates config → sends configurationUpdate
7. Backend → sends configurationUpdated
8. User clicks Generate → sends generationRequest
9. Backend → sends generationStarted
10. Backend → sends generationProgress (periodically)
11. Backend → sends generationComplete (success) OR generationError (failure)
```

## Type Definitions

### ProjectConfiguration Interface
```typescript
interface ProjectConfiguration {
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

### ProgressUpdate Interface
```typescript
interface ProgressUpdate {
    step: number;
    total: number;
    message: string;
}
```

### ErrorCode Enum
```typescript
enum ErrorCode {
    VALIDATION_ERROR,
    NETWORK_ERROR,
    INITIALIZR_ERROR,
    ZIP_INVALID,
    ZIP_PATH_TRAVERSAL,
    EXTRACTION_ERROR,
    FILESYSTEM_ERROR,
    DIRECTORY_CONFLICT,
    CANCELLED
}
```

## Implementation Notes

### MessageHandler Class
Located in `src/webview/messageHandler.ts`, this class handles:
- Message routing based on type
- Error handling and logging
- Processing state management
- Posting responses back to webview

### SpringBootPanel Class
Located in `src/webview/SpringBootPanel.ts`, this class:
- Creates and manages the webview panel
- Posts messages to webview
- Listens for webview messages
- Manages webview HTML generation

### React Integration
- Webview messages are received via `webview.onDidReceiveMessage()`
- Messages are typed using TypeScript interfaces for type safety
- Error handling ensures graceful failure

## Testing the Protocol

To test the protocol:
1. Start the extension in VS Code
2. Open Command Palette → "Spring Boot Initializer"
3. Verify webview loads and sends initializationRequest
4. Check console logs for message flow
5. Test each user interaction and verify corresponding responses

## Troubleshooting

Common issues:
- **No metadata received**: Check Spring Initializr service connectivity
- **Generation fails**: Verify error messages in webview console
- **Messages not sent**: Check webview connection state
- **Type errors**: Ensure TypeScript types match between frontend and backend

## Future Enhancements

Potential protocol extensions:
- Real-time project preview
- Dependency search and filtering
- Template selection
- Version compatibility checking