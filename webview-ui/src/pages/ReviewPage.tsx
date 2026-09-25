import { ReviewView } from '../components';
import type { ProjectConfigHookResult } from '../hooks/useProjectConfig';
import type { InitializrMetadata, DependencyOption } from '../services/messageService';

export interface ReviewPageProps {
  metadata: InitializrMetadata | null;
  config: ProjectConfigHookResult;
}

function label(
  options: { id: string; name: string }[] | undefined,
  id: string
): string {
  return options?.find(o => o.id === id)?.name ?? id;
}

export function ReviewPage({ metadata, config }: ReviewPageProps) {
  const { config: cfg } = config;

  const allDeps = new Map<string, DependencyOption>();
  metadata?.dependencyGroups.forEach(g =>
    g.dependencies.forEach(d => allDeps.set(d.id, d))
  );

  const dependencyNames = cfg.dependencies.map(
    id => allDeps.get(id)?.name ?? id
  );

  return (
    <div className="relative flex flex-col flex-grow w-full">
      {/* Top Right Stepped Pixel Pattern Cluster */}
      <div className="absolute top-0 right-0 pointer-events-none select-none hidden sm:block z-0">
        <div className="relative w-64 h-32">
          <div className="absolute top-4 right-44 w-5 h-5 bg-pixel-pink"></div>
          <div className="absolute top-12 right-36 w-5 h-5 bg-pixel-orange"></div>
          <div className="absolute top-20 right-4 w-5 h-5 bg-pixel-pink"></div>
          <div className="absolute top-0 right-0 w-44 h-7 bg-gradient-to-r from-pixel-pink to-pixel-orange"></div>
          <div className="absolute top-7 right-0 w-36 h-7 bg-gradient-to-r from-[#ff3879] to-pixel-orange"></div>
          <div className="absolute top-14 right-0 w-28 h-6 bg-pixel-orange"></div>
          <div className="absolute top-14 right-10 w-8 h-6 bg-black"></div>
          <div className="absolute top-20 right-6 w-14 h-8 bg-black"></div>
          <div className="absolute top-24 right-0 w-8 h-8 bg-[#000000]"></div>
        </div>
      </div>

      <div className="relative z-10 mb-6">
        <div className="font-mono font-bold text-xs sm:text-sm text-pixel-pink tracking-wider mb-1 uppercase">
          STEP 4 OF 4
        </div>
        <h2 className="font-pixel text-4xl sm:text-5xl text-black tracking-tight font-bold mb-1">
          Review
        </h2>
        <p className="font-mono text-xs sm:text-sm text-neutral-800 font-bold mt-1">
          Confirm the configuration, then generate the project.
        </p>
      </div>

      <ReviewView
        config={cfg}
        dependencyNames={dependencyNames}
        labels={{
          bootVersion: label(metadata?.bootVersions, cfg.bootVersion),
          javaVersion: label(metadata?.javaVersions, cfg.javaVersion),
          language: label(metadata?.languages, cfg.language),
          projectType: label(metadata?.projectTypes, cfg.projectType),
          packaging: label(metadata?.packagingTypes, cfg.packaging),
        }}
      />
    </div>
  );
}