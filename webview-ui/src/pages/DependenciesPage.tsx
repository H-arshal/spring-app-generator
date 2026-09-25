import { useMemo, useState } from 'react';
import { DependencyList, SelectedDeps } from '../components';
import type { ProjectConfigHookResult } from '../hooks/useProjectConfig';
import type { InitializrMetadata, DependencyOption } from '../services/messageService';

export interface DependenciesPageProps {
  metadata: InitializrMetadata | null;
  config: ProjectConfigHookResult;
}

export function DependenciesPage({ metadata, config }: DependenciesPageProps) {
  const [query, setQuery] = useState('');
  const { config: cfg, toggleDependency } = config;
  const selectedIds = cfg.dependencies;

  const groups = useMemo(() => metadata?.dependencyGroups ?? [], [metadata]);

  // Index every dependency by id for name resolution in the summary.
  const allDeps = useMemo(() => {
    const map = new Map<string, DependencyOption>();
    groups.forEach(g => g.dependencies.forEach(d => map.set(d.id, d)));
    return map;
  }, [groups]);

  // Apply the search filter across name, id and description.
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map(group => ({
        name: group.name,
        dependencies: group.dependencies.filter(
          dep =>
            dep.name.toLowerCase().includes(q) ||
            dep.id.toLowerCase().includes(q) ||
            (dep.description ?? '').toLowerCase().includes(q)
        ),
      }))
      .filter(group => group.dependencies.length > 0);
  }, [groups, query]);

  const totalMatches = filteredGroups.reduce((n, g) => n + g.dependencies.length, 0);

  const selectedDeps = useMemo(
    () =>
      selectedIds
        .map(id => allDeps.get(id))
        .filter((d): d is DependencyOption => Boolean(d)),
    [selectedIds, allDeps]
  );

  return (
    <div>
      <div className="deps-toolbar">
        <div className="search">
          <span className="search-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="control"
            placeholder="Search dependencies by name or id…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search dependencies"
            spellCheck={false}
          />
        </div>
        <span className="deps-count">
          {selectedIds.length} selected
          {query.trim() && ` · ${totalMatches} match${totalMatches === 1 ? '' : 'es'}`}
        </span>
      </div>

      {selectedDeps.length > 0 && (
        <div className="section">
          <div className="section-head">
            <h3 className="section-title">Selected</h3>
          </div>
          <SelectedDeps dependencies={selectedDeps} onRemove={toggleDependency} />
        </div>
      )}

      {filteredGroups.length === 0 ? (
        <div className="empty">No dependencies match “{query.trim()}”.</div>
      ) : (
        filteredGroups.map(group => (
          <section className="dep-group" key={group.name}>
            <div className="dep-group-head">
              <h3 className="section-title">{group.name}</h3>
              <span className="section-note">{group.dependencies.length}</span>
            </div>
            <div className="card">
              <DependencyList
                dependencies={group.dependencies}
                selectedIds={selectedIds}
                onToggle={toggleDependency}
              />
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}