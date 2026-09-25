import type { SelectOption } from '../services/messageService';

export interface RadioGroupProps {
  label: string;
  name: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  disabled?: boolean;
}

/** Vertical single-select list. Used where options need labels/subtext. */
export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  hint,
  disabled,
}: RadioGroupProps) {
  return (
    <fieldset className="field" style={{ border: 'none', margin: 0, padding: 0 }}>
      <legend className="field-label" style={{ padding: 0 }}>
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </legend>
      <div className="option-list">
        {options.map(opt => {
          const selected = value === opt.id;
          return (
            <label key={opt.id} className={`option ${selected ? 'is-selected' : ''}`}>
              <input
                type="radio"
                className="option-input"
                name={name}
                value={opt.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(opt.id)}
              />
              <span className="option-title">{opt.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}