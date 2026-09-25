import type { DependencyOption } from '../services/messageService';

export interface SelectedDepsProps {
  dependencies: DependencyOption[];
  onRemove: (id: string) => void;
}

/** Removable chips summarising the current dependency selection. */
export function SelectedDeps({ dependencies, onRemove }: SelectedDepsProps) {
  if (dependencies.length === 0) {
    return (
      <p className="subtle" style={{ fontSize: 12.5 }}>
        No dependencies selected yet.
      </p>
    );
  }

  return (
    <div className="chips">
      {dependencies.map(dep => (
        <span key={dep.id} className="chip">
          {dep.name}
          <button
            type="button"
            className="chip-remove"
            onClick={() => onRemove(dep.id)}
            aria-label={`Remove ${dep.name}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}