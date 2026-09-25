import type { SelectOption } from '../services/messageService';

export interface SegmentedControlProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  disabled?: boolean;
}

export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  hint,
  disabled,
}: SegmentedControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display font-bold text-xs text-black block">
        {label}
        {hint && <span className="ml-2 font-mono text-[10px] text-neutral-500">{hint}</span>}
      </label>
      <div 
        aria-label={label} 
        className="grid border-hard-2 bg-white" 
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        role="radiogroup"
      >
        {options.map((opt, i) => {
          const isActive = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`py-2 px-2 text-xs md:text-sm font-bold text-center border-black focus:outline-none transition-colors ${
                i !== options.length - 1 ? 'border-r-2' : ''
              } ${
                isActive 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(opt.id)}
            >
              {opt.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}