import type { ProjectConfiguration } from '../services/messageService';

export interface ReviewViewProps {
  config: ProjectConfiguration;
  dependencyNames: string[];
  labels: {
    bootVersion?: string;
    javaVersion?: string;
    language?: string;
    projectType?: string;
    packaging?: string;
  };
}

function Row({ label, value, isFullWidth }: { label: string; value: string; isFullWidth?: boolean }) {
  return (
    <div className={`flex items-start gap-2.5 ${isFullWidth ? 'md:col-span-2' : ''}`}>
      <div className="w-2.5 h-2.5 bg-black mt-1 shrink-0" />
      <div>
        <div className="font-mono text-[10px] uppercase font-bold text-black tracking-wider leading-none">
          {label}
        </div>
        <div className="font-mono text-xs sm:text-sm font-bold text-black mt-0.5">
          {value || '—'}
        </div>
      </div>
    </div>
  );
}

export function ReviewView({ config, dependencyNames, labels }: ReviewViewProps) {
  return (
    <div className="flex-1 w-full space-y-6 pb-8 relative z-10">
      <section className="border-2 border-black bg-panel-bg shadow-[3px_3px_0px_#000]">
        <div className="border-b-2 border-black flex items-center justify-between">
          <div className="bg-pixel-cyan font-mono font-bold text-xs px-3 py-1.5 tracking-wider border-r-2 border-black">
            PROJECT
          </div>
          <div className="font-mono text-[11px] text-neutral-800 pr-3 flex items-center gap-1.5">
            <span>Project coordinates</span>
            <span className="text-[9px] leading-none">■</span>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="Group" value={config.groupId} />
          <Row label="Artifact" value={config.artifactId} />
          <Row label="Name" value={config.name} />
          <Row label="Package" value={config.packageName} />
          <Row label="Description" value={config.description} isFullWidth />
        </div>
      </section>

      <section className="border-2 border-black bg-panel-bg shadow-[3px_3px_0px_#000]">
        <div className="border-b-2 border-black flex items-center justify-between">
          <div className="bg-pixel-orange font-mono font-bold text-xs px-3 py-1.5 tracking-wider border-r-2 border-black">
            RUNTIME
          </div>
          <div className="font-mono text-[11px] text-neutral-800 pr-3 flex items-center gap-1.5">
            <span>Versions and build settings</span>
            <span className="text-[9px] leading-none">■</span>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="Spring Boot" value={labels.bootVersion ?? config.bootVersion} />
          <Row label="Java" value={labels.javaVersion ?? config.javaVersion} />
          <Row label="Language" value={labels.language ?? config.language} />
          <Row label="Build tool" value={labels.projectType ?? config.projectType} />
          <Row label="Packaging" value={labels.packaging ?? config.packaging} />
        </div>
      </section>

      <section className="border-2 border-black bg-panel-bg shadow-[3px_3px_0px_#000]">
        <div className="border-b-2 border-black flex items-center justify-between">
          <div className="bg-pixel-purple font-mono font-bold text-xs px-3 py-1.5 tracking-wider border-r-2 border-black text-white">
            DEPENDENCIES
          </div>
          <div className="font-mono text-[11px] text-neutral-800 pr-3 flex items-center gap-1.5">
            <span>{dependencyNames.length} selected</span>
            <span className="text-[9px] leading-none">■</span>
          </div>
        </div>
        <div className="p-4">
          {dependencyNames.length === 0 ? (
            <div className="font-mono text-xs sm:text-sm text-neutral-700 font-bold">
              No dependencies selected.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dependencyNames.map((name, index) => (
                <div key={index} className="bg-white border-2 border-black px-3 py-1.5 font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000]">
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}