# Webview Message Flow Documentation

This document outlines the expected message flow between the React frontend and the Spring Boot Initializer backend.

## Message Types

### Webview -> Backend (Messages Sent TO the Extension)

**1. Initialization Request**
```typescript
{
  type: 'initializationRequest';
  payload?: {
    projectId?: string;
    template?: string;
  };
}
```
- Sent when the webview UI first loads
- Requests initial metadata from Spring Initializr

**2. Dependency Selection**
```typescript
{
  type: 'dependencySelection';
  payload: {
    dependencies: string[];
    groups?: string[];
  };
}
```
- Sent when user selects project dependencies
- Contains array of selected dependency IDs

**3. Configuration Update**
```typescript
{
  type: 'configurationUpdate';
  payload: ProjectConfiguration;
}
```
- Sent when user updates project configuration
- Contains full project configuration

**4. Generation Request**
```typescript
{
  type: 'generationRequest';
  payload: ProjectConfiguration;
}
```
- Sent when user clicks "Generate Project"
- Triggers project generation

**5. Progress Update**
```typescript
{
  type: 'progressUpdate';
  payload: ProgressUpdate;
}
```
- Sent to report generation progress

**6. Error Message**
```typescript
{
  type: 'error';
  payload: {
    message: string;
    code?: string;
    step?: number;
  };
}
```
- Sent when errors occur

### Backend -> Webview (Messages Sent FROM the Extension)

**1. Metadata Loaded**
```typescript
{
  type: 'metadataLoaded';
  payload: InitializrMetadata;
}
```
- Response to initializationRequest
- Contains Spring Initializr metadata

**2. Dependencies Updated**
```typescript
{
  type: 'dependenciesUpdated';
  payload: {
    dependencies: string[];
  };
}
```
- Response to dependencySelection
- Acknowledges selected dependencies

**3. Configuration Updated**
```typescript
{
  type: 'configurationUpdated';
  payload: {
    configuration: ProjectConfiguration;
  };
}
```
- Response to configurationUpdate
- Confirms configuration update

**4. Generation Started**
```typescript
{
  type: 'generationStarted';
  payload: {
    configuration: ProjectConfiguration;
  };
}
```
- Response to generationRequest
- Indicates project generation has started

**5. Generation Complete**
```typescript
{
  type: 'generationComplete';
  payload: {
    result: {
      success: boolean;
      projectPath: string;
      filesGenerated: number;
      extractedSize: string;
      nextSteps: string[];
    };
  };
}
```
- Response when generation is complete
- Contains generation results

**6. Generation Error**
```typescript
{
  type: 'generationError';
  payload: {
    message: string;
  };
}
```
- Response when generation fails

## MessageHandler Implementation

The `MessageHandler` class in `src/webview/messageHandler.ts` handles all incoming messages from the webview:

- `_handleInitializationRequest`: Loads metadata from Spring Initializr
- `_handleDependencySelection`: Updates panel with selected dependencies
- `_handleConfigurationUpdate`: Stores configuration in extension context
- `_handleGenerationRequest`: Starts project generation process
- `_handleProgressUpdate`: Forwards progress updates

## Error Handling

All message handlers are wrapped in try-catch blocks that:
1. Log errors using the Logger
2. Send error messages back to the webview
3. Ensure processing flag is reset

## Integration Points

1. **SpringBootPanel.postMessage()**: Sends messages to the webview
2. **webview.onDidReceiveMessage()**: Receives messages from the webview
3. **MessageHandler.handle()**: Routes messages to appropriate handlers