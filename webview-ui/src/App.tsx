import { useEffect, useMemo, useState } from 'react';
import { useVsCodeApi } from './hooks/useVsCodeApi';
import { useMetadata } from './hooks/useMetadata';
import { useProjectConfig } from './hooks/useProjectConfig';
import { useGeneration } from './hooks/useGeneration';
import { createMessageService } from './services/messageService';
import type { DirectoryMode } from './services/messageService';
import {
  Stepper,
  ProgressView,
  ErrorView,
  Modal,
} from './components';
import type { StepDef } from './components';
import { ProjectPage } from './pages/ProjectPage';
import { DetailsPage } from './pages/DetailsPage';
import { ReviewPage } from './pages/ReviewPage';
import { DependenciesPage } from './pages/DependenciesPage';
import './App.css';

const STEPS: StepDef[] = [
  { id: 'project', label: 'Platform', meta: 'Runtime & build tool' },
  { id: 'details', label: 'Details', meta: 'Coordinates & output' },
  { id: 'dependencies', label: 'Dependencies', meta: 'Starters & libraries' },
  { id: 'review', label: 'Review', meta: 'Confirm & generate' },
];

const STEP_DESCRIPTIONS = [
  'Choose the Spring Boot version, Java runtime, language and build tool.',
  'Set the project coordinates and where the project should be written.',
  'Select the Spring starters and libraries to include in the project.',
  'Confirm the configuration, then generate the project.',
];

export default function App() {
  const vscodeApi = useVsCodeApi();
  const messageService = useMemo(() => createMessageService(vscodeApi), [vscodeApi]);

  const metadata = useMetadata(messageService);
  const projectConfig = useProjectConfig(metadata.metadata);
  const generation = useGeneration(messageService);

  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(1);

  // Output-directory state
  const [dirMode, setDirMode] = useState<DirectoryMode>('workspace');
  const [dirPath, setDirPath] = useState('');
  const [folderName, setFolderName] = useState('');
  const [workspaceFolder, setWorkspaceFolder] = useState<string | undefined>();

  useEffect(() => {
    // Seed the folder name from the artifact once it is known.
    if (!folderName && projectConfig.config.artifactId) {
      setFolderName(projectConfig.config.artifactId);
    }
  }, [projectConfig.config.artifactId, folderName]);

  useEffect(() => {
    return messageService.onMessage(msg => {
      if (msg.type === 'WORKSPACE_INFO') {
        setWorkspaceFolder(msg.payload.workspaceFolder);
        if (msg.payload.projectName) {
          setFolderName(prev => prev || msg.payload.projectName!);
        }
      } else if (msg.type === 'FOLDER_SELECTED') {
        setDirPath(msg.payload.path);
        setDirMode('chooseFolder');
      }
    });
  }, [messageService]);

  const goTo = (index: number) => {
    setStepIndex(index);
    setFurthestIndex(prev => Math.max(prev, index));
  };

  const handleNext = () => goTo(Math.min(stepIndex + 1, STEPS.length - 1));
  const handleBack = () => goTo(Math.max(stepIndex - 1, 0));

  const resolveTargetPath = (): string => {
    if (dirMode === 'chooseFolder') return dirPath;
    if (dirMode === 'newFolder') return workspaceFolder ?? '';
    return workspaceFolder ?? '';
  };

  const handleGenerate = () => {
    const cfg = projectConfig.config;
    const basePath = resolveTargetPath();
    generation.generate({
      bootVersion: cfg.bootVersion,
      language: cfg.language,
      projectType: cfg.projectType,
      packaging: cfg.packaging,
      javaVersion: cfg.javaVersion,
      groupId: cfg.groupId,
      artifactId: cfg.artifactId,
      name: cfg.name,
      description: cfg.description,
      packageName: cfg.packageName,
      dependencies: cfg.dependencies,
      targetPath: basePath,
      createSubfolder: dirMode !== 'chooseFolder',
    });
  };

  const handleBrowse = () => messageService.post('SELECT_FOLDER');

  if (metadata.loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
        <p className="stage-desc">Loading Spring Initializr metadata…</p>
      </div>
    );
  }

  if (metadata.error) {
    return (
      <div className="center-screen">
        <h2 className="stage-title">Couldn’t load metadata</h2>
        <p className="stage-desc">{metadata.error}</p>
        <button className="btn btn-primary" onClick={metadata.refresh}>
          Retry
        </button>
      </div>
    );
  }

  const depCount = projectConfig.config.dependencies.length;
  const isGenerating = generation.status === 'running';
  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ⬢
          </span>
          <span className="brand-text">
            <span className="brand-name">Spring Boot Initializer</span>
            <span className="brand-sub mono">
              {projectConfig.config.groupId || 'com.example'}.{projectConfig.config.artifactId || 'demo'}
            </span>
          </span>
        </div>
        <div className="topbar-actions">
          <span className="badge">{depCount} dependencies</span>
        </div>
      </header>

      <div className="shell-body">
        <Stepper
          steps={STEPS}
          currentIndex={stepIndex}
          furthestIndex={furthestIndex}
          onSelect={goTo}
          variant="rail"
        />

        <div className="stage">
          <Stepper
            steps={STEPS}
            currentIndex={stepIndex}
            furthestIndex={furthestIndex}
            onSelect={goTo}
            variant="compact"
          />
          <div className="stage-inner">
            <div className="stage-head">
              <div className="stage-eyebrow">Step {stepIndex + 1} of {STEPS.length}</div>
              <h2 className="stage-title">{STEPS[stepIndex].label}</h2>
              <p className="stage-desc">{STEP_DESCRIPTIONS[stepIndex]}</p>
            </div>

            {stepIndex === 0 && (
              <ProjectPage metadata={metadata.metadata} config={projectConfig} />
            )}
            {stepIndex === 1 && (
              <DetailsPage
                config={projectConfig}
                directory={{
                  mode: dirMode,
                  path: dirPath,
                  newFolderName: folderName,
                  workspaceFolder,
                }}
                onDirectoryModeChange={setDirMode}
                onDirectoryPathChange={setDirPath}
                onFolderNameChange={setFolderName}
                onBrowse={handleBrowse}
              />
            )}
            {stepIndex === 2 && (
              <DependenciesPage metadata={metadata.metadata} config={projectConfig} />
            )}
            {stepIndex === 3 && (
              <ReviewPage metadata={metadata.metadata} config={projectConfig} />
            )}
          </div>
        </div>
      </div>

      <footer className="shell-bar">
        <div className="bar-hint">
          {isLastStep ? (
            <>
              Ready to generate
              <span className="sep">·</span>
              <span className="mono">{projectConfig.config.artifactId || 'project'}</span>
            </>
          ) : (
            <>
              {STEPS[stepIndex].label} configuration
              <span className="sep">·</span>
              <span>Changes apply immediately</span>
            </>
          )}
        </div>
        <div className="bar-actions">
          {stepIndex > 0 && (
            <button className="btn btn-ghost" onClick={handleBack} disabled={isGenerating}>
              Back
            </button>
          )}
          {!isLastStep ? (
            <button className="btn btn-primary" onClick={handleNext} disabled={isGenerating}>
              Continue
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating…' : 'Generate project'}
            </button>
          )}
        </div>
      </footer>

      {isGenerating && (
        <Modal
          title="Generating project"
          icon={<span className="status-mark ok" aria-hidden="true">⬡</span>}
          dismissible={false}
        >
          {generation.progress ? (
            <ProgressView progress={generation.progress} />
          ) : (
            <div className="kv-row">
              <span className="progress-title">Starting…</span>
              <div className="spinner" />
            </div>
          )}
        </Modal>
      )}

      {generation.status === 'success' && generation.result && (
        <Modal
          title="Project generated"
          icon={<span className="status-mark ok" aria-hidden="true">✓</span>}
          onClose={generation.dismiss}
          footer={
            <button className="btn btn-primary" onClick={generation.dismiss}>
              Done
            </button>
          }
        >
          <p className="stage-desc" style={{ marginTop: 0 }}>
            Your Spring Boot project was created successfully.
          </p>
          <div className="kv">
            <div className="kv-row">
              <span className="kv-key">Location</span>
              <span className="kv-val mono">{generation.result.projectPath}</span>
            </div>
          </div>
          {generation.result.nextSteps.length > 0 && (
            <div className="detail-block">
              {generation.result.nextSteps.join('\n')}
            </div>
          )}
        </Modal>
      )}

      {generation.status === 'error' && generation.error && (
        <Modal
          title="Generation failed"
          icon={<span className="status-mark err" aria-hidden="true">!</span>}
          onClose={generation.dismiss}
        >
          <ErrorView
            message={generation.error.message}
            code={generation.error.code}
            step={generation.error.step}
            details={generation.error.details}
            recoverable={generation.error.code !== 'CANCELLED'}
            onRetry={handleGenerate}
            onChooseLocation={handleBrowse}
          />
        </Modal>
      )}
    </div>
  );
}