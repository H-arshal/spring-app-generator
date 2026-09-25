import type { ReactNode } from 'react';

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Rendered inside the control, pinned to the right edge. */
  affix?: ReactNode;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  disabled,
  autoFocus,
  affix,
}: TextFieldProps) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </span>
      <span className="field-control">
        <input
          type="text"
          className={`control ${error ? 'is-invalid' : ''} ${affix ? 'has-affix' : ''}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          spellCheck={false}
        />
        {affix && <span className="field-affix">{affix}</span>}
      </span>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}