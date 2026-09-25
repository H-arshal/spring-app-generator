import type { SelectOption } from '../services/messageService';

export interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
  error,
  disabled,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display font-bold text-xs text-black">
        {label}
        {hint && <span className="ml-2 font-mono text-[10px] text-neutral-500">{hint}</span>}
      </label>
      <div className="relative">
        <select
          className={`w-full bg-white border-hard-2 px-3 py-2 text-xs md:text-sm font-bold text-black appearance-none rounded-none focus:outline-none focus:ring-0 focus:border-black cursor-pointer pr-8 ${
            error ? 'border-red-500' : ''
          }`}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
          </svg>
        </div>
      </div>
      {error && <span className="font-mono text-xs text-red-500">{error}</span>}
    </div>
  );
}