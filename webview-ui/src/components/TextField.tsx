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
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="font-pixel text-xs font-bold text-black">{label}</label>
        {hint && <span className="text-[11px] text-gray-600 font-mono">{hint}</span>}
      </div>
      <div className="flex relative">
        <input
          type="text"
          className={`w-full bg-[#faf6ee] border-2 border-black px-3 py-1.5 font-mono text-sm text-black focus:outline-none focus:ring-0 focus:border-black shadow-[2px_2px_0px_#000] ${affix ? 'border-r-0' : ''} ${error ? 'border-red-500' : ''}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          spellCheck={false}
        />
        {affix && affix}
      </div>
      {error && <span className="text-red-500 text-xs font-mono mt-1">{error}</span>}
    </div>
  );
}