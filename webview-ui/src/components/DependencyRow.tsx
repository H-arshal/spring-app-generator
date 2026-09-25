import type { DependencyOption } from '../services/messageService';

export interface DependencyRowProps {
  dependency: DependencyOption;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function DependencyRow({ dependency, selected, onToggle }: DependencyRowProps) {
  return (
    <div
      className={`border-2 border-black p-2.5 flex items-start gap-3 relative cursor-pointer hover:bg-black/5 transition-colors ${
        selected ? 'bg-[#faf6ee]' : 'bg-panel-bg'
      }`}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onToggle(dependency.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(dependency.id);
        }
      }}
    >
      <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${selected ? 'bg-pixel-mint' : 'bg-white'}`}>
        {selected && (
          <svg className="w-3.5 h-3.5 text-black stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        )}
      </div>

      <div className="flex-grow min-w-0 pr-1">
        <div className="font-sans font-bold text-sm text-black leading-tight break-words">{dependency.name}</div>
        {dependency.description && (
          <p className="text-[11px] font-mono text-black font-medium leading-snug mt-0.5 break-words">{dependency.description}</p>
        )}
        <span className="inline-block mt-1 text-[10px] font-mono font-bold text-black/70 bg-black/5 px-1 break-all">{dependency.id}</span>
      </div>
    </div>
  );
}

export interface DependencyListProps {
  dependencies: DependencyOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function DependencyList({ dependencies, selectedIds, onToggle }: DependencyListProps) {
  const selected = new Set(selectedIds);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-1 w-full">
      {dependencies.map(dep => (
        <DependencyRow
          key={dep.id}
          dependency={dep}
          selected={selected.has(dep.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}