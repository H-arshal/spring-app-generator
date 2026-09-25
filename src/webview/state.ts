import { HostMessage, ErrorCode } from '../initializr/types';
import {
    NetworkError,
    InitializrError,
    ZipError,
    PathTraversalError,
    FilesystemError,
    ValidationError
} from '../utils/errors';

/**
 * Converts a caught error into a typed GENERATION_ERROR host message.
 */
export function errorToHostMessage(err: unknown): HostMessage {
    if (err instanceof ValidationError) {
        return makeError('VALIDATION_ERROR', err.message, 0, false);
    }
    if (err instanceof NetworkError) {
        return makeError('NETWORK_ERROR', err.message, 3, true);
    }
    if (err instanceof InitializrError) {
        return makeError('INITIALIZR_ERROR', err.message, 3, true);
    }
    if (err instanceof PathTraversalError) {
        return makeError('ZIP_PATH_TRAVERSAL', err.message, 5, false);
    }
    if (err instanceof ZipError) {
        return makeError('ZIP_INVALID', err.message, 4, true);
    }
    if (err instanceof FilesystemError) {
        return makeError('FILESYSTEM_ERROR', err.message, 5, true);
    }

    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return makeError('INITIALIZR_ERROR', message, 0, true);
}

function makeError(
    errorCode: ErrorCode,
    message: string,
    step: number,
    recoverable: boolean
): HostMessage {
    return {
        type: 'GENERATION_ERROR',
        payload: { message, step, recoverable, cancelled: false, errorCode }
    };
}
