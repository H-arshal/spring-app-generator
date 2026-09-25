import { ReviewView } from '../components';
import type { ProjectConfigHookResult } from '../hooks/useProjectConfig';
import type { InitializrMetadata, DependencyOption } from '../services/messageService';

export interface ReviewPageProps {
  metadata: InitializrMetadata | null;
  config: ProjectConfigHookResult;
}

/** Resolve an option id to its display name within a list. */
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
  );
}