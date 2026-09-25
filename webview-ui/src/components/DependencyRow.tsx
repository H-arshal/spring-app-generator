import type { DependencyOption } from '../services/messageService';

export interface DependencyRowProps {
  dependency: DependencyOption;
  selected: boolean;
  onToggle: (id: string) => void;
}

/**
 * A single selectable dependency. Rendered as a list row (not a card) so
 * groups of deps read as a scannable table rather than a wall of boxes.
 */
export function DependencyRow({ dependency, selected, onToggle }: DependencyRowProps) {
  return (
    <button
      type="button"
      className={`dep-item ${selected ? 'is-selected' : ''}`}
      role="checkbox"
      aria-checked={selected}
      onClick={() => onToggle(dependency.id)}
    >
      <span className="dep-check" aria-hidden="true">
        ✓
      </span>
      <span className="dep-main">
        <span className="dep-name">{dependency.name}</span>
        {dependency.description && (
          <span className="dep-desc">{dependency.description}</span>
        )}
        <span className="dep-id">{dependency.id}</span>
      </span>
    </button>
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
    <div className="dep-list">
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