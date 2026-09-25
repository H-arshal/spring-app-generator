import type { ProjectConfiguration } from '../services/messageService';

export interface ReviewViewProps {
  config: ProjectConfiguration;
  /** Resolved dependency names (already mapped from ids). */
  dependencyNames: string[];
  /** Resolved option labels for readability. */
  labels: {
    bootVersion?: string;
    javaVersion?: string;
    language?: string;
    projectType?: string;
    packaging?: string;
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{value || '—'}</span>
    </div>
  );
}

/**
 * Read-only summary of the full configuration, shown on the final step so the
 * user can verify before generating.
 */
export function ReviewView({ config, dependencyNames, labels }: ReviewViewProps) {
  return (
    <div className="stack">
      <section>
        <div className="section-head">
          <h3 className="section-title">Project</h3>
        </div>
        <div className="review-grid">
          <Row label="Group" value={config.groupId} />
          <Row label="Artifact" value={config.artifactId} />
          <Row label="Name" value={config.name} />
          <Row label="Package" value={config.packageName} />
          <Row label="Description" value={config.description} />
        </div>
      </section>

      <div className="divider" />

      <section>
        <div className="section-head">
          <h3 className="section-title">Runtime</h3>
        </div>
        <div className="review-grid">
          <Row label="Spring Boot" value={labels.bootVersion ?? config.bootVersion} />
          <Row label="Java" value={labels.javaVersion ?? config.javaVersion} />
          <Row label="Language" value={labels.language ?? config.language} />
          <Row label="Build tool" value={labels.projectType ?? config.projectType} />
          <Row label="Packaging" value={labels.packaging ?? config.packaging} />
        </div>
      </section>

      <div className="divider" />

      <section>
        <div className="section-head">
          <h3 className="section-title">Dependencies</h3>
          <span className="section-note">
            {dependencyNames.length} selected
          </span>
        </div>
        {dependencyNames.length === 0 ? (
          <p className="subtle" style={{ fontSize: 12.5 }}>
            No dependencies selected.
          </p>
        ) : (
          <div className="review-list">
            {dependencyNames.map((name, index) => (
              <div className="review-dep" key={`${name}-${index}`}>
                <span>{name}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}