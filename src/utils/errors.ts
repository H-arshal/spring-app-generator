export class NetworkError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'NetworkError';
    }
}

export class InitializrError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly serverMessage?: string
    ) {
        super(message);
        this.name = 'InitializrError';
    }
}

export class ParseError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'ParseError';
    }
}

export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly field?: string
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ZipError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'ZipError';
    }
}

export class PathTraversalError extends Error {
    constructor(public readonly entryName: string) {
        super(`Path traversal detected in archive entry: ${entryName}`);
        this.name = 'PathTraversalError';
    }
}

export class FilesystemError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'FilesystemError';
    }
}
