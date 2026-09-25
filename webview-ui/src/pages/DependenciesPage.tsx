import { useMemo, useState } from 'react';
import { DependencyList, SelectedDeps } from '../components';
import type { ProjectConfigHookResult } from '../hooks/useProjectConfig';
import type { InitializrMetadata, DependencyOption } from '../services/messageService';

export interface DependenciesPageProps {
  metadata: InitializrMetadata | null;
  config: ProjectConfigHookResult;
}

const BRUTAL_COLORS = [
  'bg-pixel-cyan',
  'bg-pixel-orange',
  'bg-pixel-purple',
  'bg-pixel-pink',
  'bg-pixel-mint',
];

export function DependenciesPage({ metadata, config }: DependenciesPageProps) {
  const [query, setQuery] = useState('');
  const { config: cfg, toggleDependency } = config;
  const selectedIds = cfg.dependencies;

  const groups = useMemo(() => metadata?.dependencyGroups ?? [], [metadata]);

  const allDeps = useMemo(() => {
    const map = new Map<string, DependencyOption>();
    groups.forEach(g => g.dependencies.forEach(d => map.set(d.id, d)));
    return map;
  }, [groups]);

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
    <div className="relative flex flex-col flex-grow w-full">
      {/* Decorative Upper-Right Stepped Pixel Gradient Art */}
      <div className="absolute top-0 right-0 hidden sm:block pointer-events-none z-0">
        <div className="relative w-64 h-32">
          <div className="absolute top-8 left-0 w-4 h-4 bg-pixel-pink"></div>
          <div className="absolute top-14 left-12 w-4 h-4 bg-pixel-pink"></div>
          <div className="absolute bottom-5 right-2 w-4 h-5 bg-pixel-pink"></div>
          <div className="absolute top-0 right-0 flex flex-col items-end">
            <div className="w-48 h-6 bg-gradient-to-r from-pixel-pink to-pixel-orange"></div>
            <div className="w-40 h-6 bg-gradient-to-r from-pixel-pink to-pixel-orange"></div>
            <div className="w-32 h-6 bg-gradient-to-r from-pixel-pink to-pixel-orange"></div>
            <div className="w-24 h-5 bg-gradient-to-r from-pixel-pink to-pixel-orange"></div>
            <div className="w-20 h-5 bg-black"></div>
            <div className="w-16 h-5 bg-black"></div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <span className="font-pixel text-xs sm:text-sm font-bold text-pixel-pink tracking-wider block">
          STEP 3 OF 4
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-pixel tracking-tight text-black mt-1 leading-none">
          Dependencies
        </h2>
        <p className="text-xs sm:text-sm font-mono text-black font-semibold mt-2.5">
          Select the Spring starters and libraries to include in the project.
        </p>
      </div>

      <div className="mt-4 relative z-10 mb-4">
        <div className="relative flex items-center bg-panel-bg border-2 border-black px-3.5 py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <SearchIcon />
          <input
            className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-mono placeholder-black/60 focus:ring-0 focus:outline-none text-black font-medium ml-2.5"
            placeholder="Search dependencies by name or id..."
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="mt-2 text-xs font-mono font-bold text-black flex items-center gap-2">
          <span>{selectedIds.length} selected</span>
          {query.trim() && (
            <>
              <span>•</span>
              <span>{totalMatches} match{totalMatches === 1 ? '' : 'es'}</span>
            </>
          )}
        </div>
      </div>

      <SelectedDeps dependencies={selectedDeps} onRemove={toggleDependency} />

      <div className="mt-2 space-y-6 relative z-10 flex-grow">
        {filteredGroups.length === 0 ? (
          <div className="border-2 border-black p-4 bg-panel-bg font-mono text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            No dependencies match "{query.trim()}".
          </div>
        ) : (
          filteredGroups.map((group, idx) => {
            const badgeColor = BRUTAL_COLORS[idx % BRUTAL_COLORS.length];
            return (
              <div key={group.name} className="relative border-2 border-black pt-4 pb-2.5 px-2.5 sm:px-3 bg-transparent">
                <div className={`absolute -top-[14px] left-0 ${badgeColor} border-2 border-black px-3 py-0.5`}>
                  <span className="font-pixel text-[11px] font-bold text-black tracking-wider uppercase">
                    {group.name}
                  </span>
                </div>
                <div className="absolute -top-3 right-3 text-[11px] font-mono font-bold text-black bg-cream-bg px-1 border-x-2 border-cream-bg">
                  {group.dependencies.length} available
                </div>
                <DependencyList
                  dependencies={group.dependencies}
                  selectedIds={selectedIds}
                  onToggle={toggleDependency}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7"></circle>
      <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
    </svg>
  );
}