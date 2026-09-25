import { TextField, DirectoryPicker } from '../components';
import type { ProjectConfigHookResult } from '../hooks/useProjectConfig';
import type { DirectoryMode } from '../services/messageService';

export interface DetailsPageProps {
  config: ProjectConfigHookResult;
  directory: {
    mode: DirectoryMode;
    path: string;
    newFolderName: string;
    workspaceFolder?: string;
  };
  onDirectoryModeChange: (mode: DirectoryMode) => void;
  onDirectoryPathChange: (path: string) => void;
  onFolderNameChange: (name: string) => void;
  onBrowse: () => void;
}

export function DetailsPage({
  config,
  directory,
  onDirectoryModeChange,
  onDirectoryPathChange,
  onFolderNameChange,
  onBrowse,
}: DetailsPageProps) {
  const { config: cfg, setGroupId, setArtifactId, setPackageName, resetPackageName } = config;

  return (
    <div className="stack">
      <section className="section">
        <div className="section-head">
          <h3 className="section-title">Coordinates</h3>
          <span className="section-note">How the project identifies itself</span>
        </div>
        <div className="card card-pad">
          <div className="field-grid">
            <TextField
              label="Group"
              value={cfg.groupId}
              onChange={setGroupId}
              placeholder="com.example"
              hint="Reverse-DNS namespace"
            />
            <TextField
              label="Artifact"
              value={cfg.artifactId}
              onChange={setArtifactId}
              placeholder="my-app"
              hint="Project handle"
            />
            <TextField
              label="Name"
              value={cfg.name}
              onChange={v => config.updateField('name', v)}
              placeholder="My App"
            />
            <TextField
              label="Package"
              value={cfg.packageName}
              onChange={setPackageName}
              placeholder="com.example.myapp"
              affix={
                !cfg.packageNameEditing ? (
                  <span className="badge badge-accent">auto</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-quiet"
                    style={{ height: 24, padding: '0 8px', fontSize: 11 }}
                    onClick={resetPackageName}
                    title="Reset to the package derived from Group and Artifact"
                  >
                    Reset
                  </button>
                )
              }
            />
            <div className="span-2">
              <TextField
                label="Description"
                value={cfg.description}
                onChange={v => config.updateField('description', v)}
                placeholder="A short description of the project"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3 className="section-title">Output</h3>
          <span className="section-note">Where the project will be written</span>
        </div>
        <div className="card card-pad">
          <DirectoryPicker
            mode={directory.mode}
            path={directory.path}
            newFolderName={directory.newFolderName}
            workspaceFolder={directory.workspaceFolder}
            onModeChange={onDirectoryModeChange}
            onPathChange={onDirectoryPathChange}
            onFolderNameChange={onFolderNameChange}
            onBrowseClick={onBrowse}
          />
        </div>
      </section>
    </div>
  );
}