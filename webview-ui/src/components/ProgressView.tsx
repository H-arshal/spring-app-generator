import type { ProgressUpdate } from '../services/messageService';

export interface ProgressViewProps {
  progress: ProgressUpdate;
  /** Optional human labels for each step, in order. */
  stepLabels?: string[];
}

/**
 * Generation progress. Shows a determinate bar plus, when step labels are
 * known, a compact timeline of completed / current / pending steps.
 */
export function ProgressView({ progress, stepLabels }: ProgressViewProps) {
  const total = progress.total || 1;
  const current = Math.min(progress.step, total);
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div>
      <div className="progress-head">
        <span className="progress-title">{progress.message || 'Generating…'}</span>
        <span className="progress-step-count">
          {current + 1} / {total}
        </span>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {progress.details && <p className="subtle" style={{ marginTop: 12, fontSize: 12 }}>{progress.details}</p>}

      {stepLabels && stepLabels.length > 0 && (
        <div className="timeline">
          {stepLabels.map((label, index) => {
            const status =
              index < progress.step
                ? 'complete'
                : index === progress.step
                  ? 'current'
                  : 'pending';
            return (
              <div key={label} className={`tl-item ${status}`}>
                <span className="tl-marker" aria-hidden="true">
                  {status === 'complete' ? '✓' : index + 1}
                </span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}