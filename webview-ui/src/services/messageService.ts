import type { VsCodeApi } from '../hooks/useVsCodeApi';

// ---------------------------------------------------------------------------
// Message types (Webview -> Host)
// ---------------------------------------------------------------------------

export interface InitializationRequestMsg {
  type: 'initializationRequest';
  payload?: {
    projectId?: string;
    template?: string;
  };
}

export interface DependencySelectionMsg {
  type: 'dependencySelection';
  payload: {
    dependencies: string[];
    groups?: string[];
  };
}

export interface ConfigurationUpdateMsg {
  type: 'configurationUpdate';
  payload: ProjectConfiguration;
}

export interface GenerationRequestMsg {
  type: 'generationRequest';
  payload: GenerationPayload;
}

export interface GetMetadataMsg {
  type: 'GET_METADATA';
}

export interface GenerateProjectMsg {
  type: 'GENERATE_PROJECT';
  payload: GenerationPayload;
}

export interface SelectFolderMsg {
  type: 'SELECT_FOLDER';
}

export interface CheckDirectoryMsg {
  type: 'CHECK_DIRECTORY';
  payload: {
    path: string;
  };
}

export interface CancelGenerationMsg {
  type: 'CANCEL_GENERATION';
}

export type WebviewMessage =
  | InitializationRequestMsg
  | DependencySelectionMsg
  | ConfigurationUpdateMsg
  | GenerationRequestMsg
  | GetMetadataMsg
  | GenerateProjectMsg
  | SelectFolderMsg
  | CheckDirectoryMsg
  | CancelGenerationMsg;

// ---------------------------------------------------------------------------
// Message types (Host -> Webview)
// ---------------------------------------------------------------------------

export interface MetadataLoadedMsg {
  type: 'metadataLoaded';
  payload: InitializrMetadata;
}

export interface MetadataErrorMsg {
  type: 'METADATA_ERROR';
  payload: {
    message: string;
    usingCache: boolean;
  };
}

export interface DependenciesUpdatedMsg {
  type: 'dependenciesUpdated';
  payload: {
    dependencies: string[];
  };
}

export interface ConfigurationUpdatedMsg {
  type: 'configurationUpdated';
  payload: {
    configuration: ProjectConfiguration;
  };
}

export interface GenerationStartedMsg {
  type: 'generationStarted';
  payload: {
    configuration: ProjectConfiguration;
  };
}

export interface GenerationProgressMsg {
  type: 'GENERATION_PROGRESS';
  payload: ProgressUpdate;
}

export interface GenerationCompleteMsg {
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

export interface GenerationErrorMessage {
  type: 'generationError';
  payload: {
    message: string;
    code?: string;
    step?: number;
    details?: string;
  };
}

export interface DirectoryStatusMsg {
  type: 'DIRECTORY_STATUS';
  payload: {
    path: string;
    status: DirectoryStatus;
  };
}

export interface FolderSelectedMsg {
  type: 'FOLDER_SELECTED';
  payload: {
    path: string;
  };
}

export interface WorkspaceInfoMsg {
  type: 'WORKSPACE_INFO';
  payload: {
    workspaceFolder?: string;
    projectName?: string;
  };
}

export type HostMessage =
  | MetadataLoadedMsg
  | MetadataErrorMsg
  | DependenciesUpdatedMsg
  | ConfigurationUpdatedMsg
  | GenerationStartedMsg
  | GenerationProgressMsg
  | GenerationCompleteMsg
  | GenerationErrorMessage
  | DirectoryStatusMsg
  | FolderSelectedMsg
  | WorkspaceInfoMsg
  | { type: 'error'; payload: { message: string } };

// ---------------------------------------------------------------------------
// Payload / data interfaces
// ---------------------------------------------------------------------------

export interface ProjectConfiguration {
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

export interface GenerationPayload extends ProjectConfiguration {
  targetPath: string;
  createSubfolder: boolean;
}

export interface SelectOption {
  id: string;
  name: string;
  default?: boolean;
}

export interface DependencyOption {
  id: string;
  name: string;
  description: string;
  versionRange?: string;
}

export interface DependencyGroup {
  name: string;
  dependencies: DependencyOption[];
}

export interface MetadataDefaults {
  bootVersion: string;
  language: string;
  projectType: string;
  packaging: string;
  javaVersion: string;
  groupId: string;
  artifactId: string;
}

export interface InitializrMetadata {
  bootVersions: SelectOption[];
  javaVersions: SelectOption[];
  languages: SelectOption[];
  projectTypes: SelectOption[];
  packagingTypes: SelectOption[];
  dependencyGroups: DependencyGroup[];
  defaults: MetadataDefaults;
}

export interface ProgressUpdate {
  step: number;
  total: number;
  message: string;
  details?: string;
}

export type DirectoryMode = 'workspace' | 'newFolder' | 'chooseFolder';

export type DirectoryStatus =
  | 'empty'
  | 'nonEmpty'
  | 'springProject'
  | 'notFound'
  | 'noPermission';

export interface TargetDirectory {
  mode: DirectoryMode;
  path: string;
  newFolderName?: string;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'INITIALIZR_ERROR'
  | 'ZIP_INVALID'
  | 'ZIP_PATH_TRAVERSAL'
  | 'EXTRACTION_ERROR'
  | 'FILESYSTEM_ERROR'
  | 'DIRECTORY_CONFLICT'
  | 'CANCELLED';

// ---------------------------------------------------------------------------
// Typed message service
// ---------------------------------------------------------------------------

export type MessageHandler = (message: HostMessage) => void;

/** Extracts the payload type associated with a particular Webview message. */
type MessagePayload<T extends WebviewMessage['type']> =
  Extract<WebviewMessage, { type: T }> extends infer M
    ? M extends { payload?: infer P }
      ? P
      : never
    : never;

export interface MessageService {
  post: <T extends WebviewMessage['type']>(
    type: T,
    payload?: MessagePayload<T>
  ) => void;
  onMessage: (handler: MessageHandler) => () => void;
}

/**
 * Creates a message service that wraps the VS Code postMessage API with
 * proper TypeScript types. Messages are dispatched to all registered handlers.
 */
export function createMessageService(vscodeApi: VsCodeApi): MessageService {
  const handlers: Set<MessageHandler> = new Set();

  const post = <T extends WebviewMessage['type']>(
    type: T,
    payload?: MessagePayload<T>
  ): void => {
    const message: WebviewMessage =
      payload === undefined
        ? ({ type } as WebviewMessage)
        : ({ type, payload } as WebviewMessage);
    vscodeApi.postMessage(message);
  };

  const onMessage = (handler: MessageHandler): (() => void) => {
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  };

  window.addEventListener('message', (event: MessageEvent) => {
    const message = event.data as HostMessage;
    if (!message || typeof message.type !== 'string') return;
    handlers.forEach(handler => handler(message));
  });

  return { post, onMessage };
}