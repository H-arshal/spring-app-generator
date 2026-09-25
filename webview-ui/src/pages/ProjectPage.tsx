import { SelectField, RadioGroup, SegmentedControl } from '../components';
import type { ProjectConfigHookResult } from '../hooks/useProjectConfig';
import type { InitializrMetadata } from '../services/messageService';

export interface ProjectPageProps {
  metadata: InitializrMetadata | null;
  config: ProjectConfigHookResult;
}

export function ProjectPage({ metadata, config }: ProjectPageProps) {
  const { config: cfg, updateField } = config;

  if (!metadata) {
    return (
      <div className="empty">Waiting for Spring Initializr metadata…</div>
    );
  }

  // Show language/project-type as segmented only when there are ≤3 choices.
  const shouldSegment = (
    options: { id: string; name: string }[]
  ): boolean => options.length > 0 && options.length <= 3;

  return (
    <div className="stack">
      <section className="section">
        <div className="section-head">
          <h3 className="section-title">Platform</h3>
          <span className="section-note">Versions and runtime targets</span>
        </div>
        <div className="card card-pad">
          <div className="field-grid">
            <SelectField
              label="Spring Boot"
              value={cfg.bootVersion}
              options={metadata.bootVersions}
              onChange={v => updateField('bootVersion', v)}
            />
            <SelectField
              label="Java"
              value={cfg.javaVersion}
              options={metadata.javaVersions}
              onChange={v => updateField('javaVersion', v)}
            />

            {shouldSegment(metadata.languages) ? (
              <SegmentedControl
                label="Language"
                options={metadata.languages}
                value={cfg.language}
                onChange={v => updateField('language', v)}
              />
            ) : (
              <RadioGroup
                label="Language"
                name="language"
                options={metadata.languages}
                value={cfg.language}
                onChange={v => updateField('language', v)}
              />
            )}

            <SelectField
              label="Packaging"
              value={cfg.packaging}
              options={metadata.packagingTypes}
              onChange={v => updateField('packaging', v)}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3 className="section-title">Build</h3>
          <span className="section-note">Build tool and project format</span>
        </div>
        <div className="card card-pad">
          {shouldSegment(metadata.projectTypes) ? (
            <SegmentedControl
              label="Build tool"
              options={metadata.projectTypes}
              value={cfg.projectType}
              onChange={v => updateField('projectType', v)}
            />
          ) : (
            <RadioGroup
              label="Build tool"
              name="projectType"
              options={metadata.projectTypes}
              value={cfg.projectType}
              onChange={v => updateField('projectType', v)}
            />
          )}
        </div>
      </section>
    </div>
  );
}