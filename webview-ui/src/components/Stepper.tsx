export interface StepDef {
  id: string;
  label: string;
  meta?: string;
}

export interface StepperProps {
  steps: StepDef[];
  /** Index of the currently visible step. */
  currentIndex: number;
  /** Highest step index the user is allowed to jump to. */
  furthestIndex: number;
  onSelect: (index: number) => void;
  variant?: 'rail' | 'compact';
}

/**
 * Navigation spine. Renders as a vertical rail (desktop) or a compact
 * horizontal pill row (≤900px). Clicking a reachable step navigates to it;
 * future steps stay disabled until the user has passed through them.
 */
export function Stepper({
  steps,
  currentIndex,
  furthestIndex,
  onSelect,
  variant = 'rail',
}: StepperProps) {
  return (
    <nav
      className={variant === 'rail' ? 'rail' : 'rail-compact'}
      aria-label="Setup steps"
    >
      {variant === 'rail' && <div className="rail-title">Setup</div>}
      {steps.map((step, index) => {
        const state =
          index === currentIndex
            ? 'is-active'
            : index < currentIndex
              ? 'is-done'
              : '';
        const reachable = index <= furthestIndex;
        return (
          <button
            key={step.id}
            type="button"
            className={`step ${state}`}
            aria-current={index === currentIndex ? 'step' : undefined}
            disabled={!reachable}
            onClick={() => reachable && onSelect(index)}
          >
            <span className="step-dot" aria-hidden="true">
              {index < currentIndex ? '✓' : index + 1}
            </span>
            <span className="step-body">
              <span className="step-label">{step.label}</span>
              {step.meta && <span className="step-meta">{step.meta}</span>}
            </span>
          </button>
        );
      })}
    </nav>
  );
}