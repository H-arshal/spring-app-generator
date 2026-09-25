import type { DependencyOption } from '../services/messageService';

export interface SelectedDepsProps {
  dependencies: DependencyOption[];
  onRemove: (id: string) => void;
}

export function SelectedDeps({ dependencies, onRemove }: SelectedDepsProps) {
  if (dependencies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {dependencies.map(dep => (
        <div key={dep.id} className="bg-pixel-orange border-2 border-black flex items-center shadow-[2px_2px_0px_#000]">
          <span className="font-mono text-xs font-bold text-black px-2 py-1 border-r-2 border-black">
            {dep.name}
          </span>
          <button
            type="button"
            className="w-6 h-full flex items-center justify-center hover:bg-black/20 text-black font-bold font-mono transition-colors"
            onClick={() => onRemove(dep.id)}
            aria-label={`Remove ${dep.name}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}