import type { ErrorCode } from '../services/messageService';

export interface ErrorViewProps {
  message: string;
  code?: ErrorCode | string;
  step?: number;
  details?: string;
  recoverable?: boolean;
  onRetry: () => void;
  onChooseLocation: () => void;
}

const ERROR_TITLES: Record<string, string> = {
  VALIDATION_ERROR: 'Check your configuration',
  NETWORK_ERROR: 'Couldn’t reach Spring Initializr',
  INITIALIZR_ERROR: 'Spring Initializr rejected the request',
  ZIP_INVALID: 'The downloaded archive was invalid',
  ZIP_PATH_TRAVERSAL: 'Unsafe path in archive',
  EXTRACTION_ERROR: 'Couldn’t extract the archive',
  FILESYSTEM_ERROR: 'Filesystem error',
  DIRECTORY_CONFLICT: 'Target directory already exists',
  CANCELLED: 'Generation cancelled',
};

/**
 * Error details shown when project generation fails. Renders inside the
 * modal body; recovery actions live in the modal footer via the caller.
 */
export function ErrorView({
  message,
  code,
  step,
  details,
  recoverable,
  onRetry,
  onChooseLocation,
}: ErrorViewProps) {
  const title = (code && ERROR_TITLES[code]) || 'Generation failed';

  return (
    <div>
      <div className="alert alert-danger" role="alert">
        <strong style={{ display: 'block', marginBottom: 2 }}>{title}</strong>
        <span>{message}</span>
      </div>

      {details && <pre className="detail-block">{details}</pre>}

      {step !== undefined && (
        <p className="subtle" style={{ marginTop: 12, fontSize: 12 }}>
          Failed at step {step}.
        </p>
      )}

      <div className="modal-foot" style={{ margin: '20px -20px -20px', borderTop: '1px solid var(--border)' }}>
        <button type="button" className="btn btn-ghost" onClick={onChooseLocation}>
          Change location
        </button>
        {recoverable !== false && (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}