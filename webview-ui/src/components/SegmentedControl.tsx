import type { SelectOption } from '../services/messageService';

export interface SegmentedControlProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  disabled?: boolean;
}

/**
 * Compact single-select control for small option sets (2–4 choices).
 * Renders as a row of toggles — denser than radios, clearer than a select.
 */
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  hint,
  disabled,
}: SegmentedControlProps) {
  return (
    <div className="field">
      <span className="field-label">
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </span>
      <div className="segmented" role="group" aria-label={label}>
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            className="segmented-option"
            aria-pressed={value === opt.id}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}