// ─── Initializr Metadata ─────────────────────────────────────────────────────

export interface SelectOption {
    id: string;
    name: string;
    default?: boolean;
}

export interface DependencyOption extends SelectOption {
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

export interface MetadataCache {
    timestamp: number;
    data: InitializrMetadata;
    sourceUrl: string;
}

// ─── Project Configuration ────────────────────────────────────────────────────

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

// ─── Target Directory ─────────────────────────────────────────────────────────

export type DirectoryMode = 'workspace' | 'newFolder' | 'chooseFolder';

export interface TargetDirectory {
    mode: DirectoryMode;
    path: string;
    newFolderName?: string;
}

export type DirectoryStatus = 'empty' | 'nonEmpty' | 'springProject' | 'notFound' | 'noPermission';

// ─── Generation ───────────────────────────────────────────────────────────────

export interface GenerateRequest extends ProjectConfiguration {
    targetPath: string;
    createSubfolder: boolean;
}

export interface ProgressUpdate {
    step: number;
    total: number;
    message: string;
    details?: string;
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

// ─── Webview Messages ─────────────────────────────────────────────────────────

export type InitializationRequest = {
    type: 'initializationRequest';
    payload?: {
        projectId?: string;
        template?: string;
    };
};

export type DependencySelection = {
    type: 'dependencySelection';
    payload: {
        dependencies: string[];
        groups?: string[];
    };
};

export type ProgressUpdateMessage = {
    type: 'progressUpdate';
    payload: ProgressUpdate;
};

export type ErrorMessage = {
    type: 'error';
    payload: {
        message: string;
        code?: string;
        step?: number;
        details?: string;
    };
};

export type ConfigurationUpdate = {
    type: 'configurationUpdate';
    payload: ProjectConfiguration;
};

export type GenerationRequest = {
    type: 'generationRequest';
    payload: ProjectConfiguration;
};

export type FolderSelection = {
    type: 'SELECT_FOLDER';
};

export type DirectoryCheck = {
    type: 'CHECK_DIRECTORY';
    payload: {
        path: string;
    };
};

export type CancelGeneration = {
    type: 'CANCEL_GENERATION';
};

export type GetMetadata = {
    type: 'GET_METADATA';
};

export type GenerateProject = {
    type: 'GENERATE_PROJECT';
    payload: GenerateRequest;
};

export type MetadataError = {
    type: 'METADATA_ERROR';
    payload: {
        message: string;
        usingCache: boolean;
    };
};

export type FolderSelected = {
    type: 'FOLDER_SELECTED';
    payload: {
        path: string;
    };
};

export type DirectoryStatusMessage = {
    type: 'DIRECTORY_STATUS';
    payload: {
        path: string;
        status: DirectoryStatus;
    };
};

export type GenerationProgress = {
    type: 'GENERATION_PROGRESS';
    payload: ProgressUpdate;
};

export type GenerationSuccess = {
    type: 'GENERATION_SUCCESS';
    payload: {
        projectPath: string;
        projectName: string;
        openedInNewWindow: boolean;
    };
};

export type GenerationError = {
    type: 'GENERATION_ERROR';
    payload: {
        message: string;
        step: number;
        recoverable: boolean;
        cancelled: boolean;
        errorCode: ErrorCode;
    };
};

export type MetadataLoadedMessage = {
    type: 'metadataLoaded';
    payload: InitializrMetadata;
};

export type DependenciesUpdatedMessage = {
    type: 'dependenciesUpdated';
    payload: {
        dependencies: string[];
    };
};

export type ConfigurationUpdatedMessage = {
    type: 'configurationUpdated';
    payload: {
        configuration: ProjectConfiguration;
    };
};

export type GenerationStartedMessage = {
    type: 'generationStarted';
    payload: {
        configuration: ProjectConfiguration;
    };
};

export type GenerationCompleteMessage = {
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
};

export type GenerationErrorMessage = {
    type: 'generationError';
    payload: {
        message: string;
    };
};

export type HostErrorMessage = {
    type: 'error';
    payload: {
        message: string;
    };
};

export type WorkspaceInfoMessage = {
    type: 'WORKSPACE_INFO';
    payload: {
        workspaceFolder?: string;
        projectName?: string;
    };
};

export type WebviewMessage =
    | InitializationRequest
    | DependencySelection
    | ConfigurationUpdate
    | GenerationRequest
    | ProgressUpdateMessage
    | ErrorMessage
    | GetMetadata
    | GenerateProject
    | FolderSelection
    | DirectoryCheck
    | CancelGeneration;

export type HostMessage =
    | MetadataLoadedMessage
    | MetadataError
    | FolderSelected
    | DirectoryStatusMessage
    | GenerationProgress
    | GenerationSuccess
    | GenerationError
    | DependenciesUpdatedMessage
    | ConfigurationUpdatedMessage
    | GenerationStartedMessage
    | GenerationCompleteMessage
    | GenerationErrorMessage
    | HostErrorMessage
    | WorkspaceInfoMessage;
