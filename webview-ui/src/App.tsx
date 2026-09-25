import { useEffect, useMemo, useState } from 'react';
import { useVsCodeApi } from './hooks/useVsCodeApi';
import { useMetadata } from './hooks/useMetadata';
import { useProjectConfig } from './hooks/useProjectConfig';
import { useGeneration } from './hooks/useGeneration';
import { createMessageService } from './services/messageService';
import type { DirectoryMode } from './services/messageService';
import { Stepper, ProgressView, ErrorView, Modal } from './components';
import type { StepDef } from './components';
import { ProjectPage } from './pages/ProjectPage';
import { DetailsPage } from './pages/DetailsPage';
import { ReviewPage } from './pages/ReviewPage';
import { DependenciesPage } from './pages/DependenciesPage';


const STEPS: StepDef[] = [
  { id: 'project', label: 'Platform', meta: 'Runtime & build tool' },
  { id: 'details', label: 'Details', meta: 'Coordinates & output' },
  { id: 'dependencies', label: 'Dependencies', meta: 'Starters & libraries' },
  { id: 'review', label: 'Review', meta: 'Confirm & generate' },
];

export default function App() {
  const vscodeApi = useVsCodeApi();
  const messageService = useMemo(() => createMessageService(vscodeApi), [vscodeApi]);

  const metadata = useMetadata(messageService);
  const projectConfig = useProjectConfig(metadata.metadata);
  const generation = useGeneration(messageService);

  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(1);
  const [dirMode, setDirMode] = useState<DirectoryMode>('workspace');
  const [dirPath, setDirPath] = useState('');
  const [folderName, setFolderName] = useState('');
  const [workspaceFolder, setWorkspaceFolder] = useState<string | undefined>();

  useEffect(() => {
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
    generation.generate({
      ...cfg,
      targetPath: resolveTargetPath(),
      createSubfolder: dirMode !== 'chooseFolder',
    });
  };

  const handleBrowse = () => messageService.post('SELECT_FOLDER');

  const depCount = projectConfig.config.dependencies.length;
  const isGenerating = generation.status === 'running';
  const isLastStep = stepIndex === STEPS.length - 1;

  if (metadata.loading) {
    return (
      <main className="w-full max-w-[1240px] flex flex-col gap-4 items-center justify-center min-h-[500px] flex-1">
        <div className="font-pixel font-bold text-2xl uppercase animate-pulse">Loading Spring Initializr...</div>
      </main>
    );
  }

  if (metadata.error) {
    return (
      <main className="w-full max-w-[1240px] flex flex-col gap-4 items-center justify-center min-h-[500px] flex-1">
        <h2 className="font-pixel text-red-500 font-bold text-2xl uppercase">Error Loading Metadata</h2>
        <p className="font-mono text-sm">{metadata.error}</p>
        <button className="bg-black text-white px-4 py-2 font-bold uppercase mt-4" onClick={metadata.refresh}>Retry</button>
      </main>
    );
  }

  return (
    <main className="w-full min-w-0 min-h-0 max-w-[1240px] flex flex-col gap-4 flex-1" data-purpose="app-shell">
      <header className="bg-[#fdfaf6] border-hard-3 shadow-hard-sm flex items-center justify-between px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[#ff2a8d] border-hard-2 flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <svg className="w-8 h-8 fill-black" viewBox="0 0 16 16" shapeRendering="crispEdges">
              <rect x="5" y="2" width="3" height="1"></rect><rect x="4" y="3" width="5" height="1"></rect>
              <rect x="3" y="4" width="6" height="1"></rect><rect x="2" y="5" width="7" height="1"></rect>
              <rect x="2" y="6" width="7" height="1"></rect><rect x="2" y="7" width="6" height="1"></rect>
              <rect x="3" y="8" width="5" height="1"></rect><rect x="4" y="9" width="4" height="1"></rect>
              <rect x="5" y="10" width="3" height="1"></rect><rect x="6" y="11" width="2" height="1"></rect>
              <rect x="7" y="12" width="1" height="1"></rect>
              <rect x="7" y="4" width="1" height="1" fill="#ff2a8d"></rect><rect x="6" y="6" width="1" height="1" fill="#ff2a8d"></rect>
            </svg>
          </div>
          <div>
            <h1 className="font-pixel text-lg md:text-xl font-bold tracking-tight text-black leading-none">Spring Boot Initializer</h1>
            <p className="font-mono-retro text-xs md:text-sm text-black mt-1 font-bold tracking-tight">
              {projectConfig.config.groupId || 'com.example'}.{projectConfig.config.artifactId || 'demo'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-black text-white text-xs md:text-sm font-bold px-3.5 py-1.5 border-2 border-black tracking-wide">
            {depCount} dependencies
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-stretch flex-1 min-h-0">
        <Stepper steps={STEPS} currentIndex={stepIndex} furthestIndex={furthestIndex} onSelect={goTo} variant="rail" />
        
        <section className="flex-grow min-w-0 min-h-0 bg-[#fdfaf6] border-hard-3 p-5 md:p-7 relative flex flex-col overflow-y-auto overflow-x-hidden">
          {stepIndex === 0 && <ProjectPage metadata={metadata.metadata} config={projectConfig} />}
          {stepIndex === 1 && <DetailsPage config={projectConfig} directory={{ mode: dirMode, path: dirPath, newFolderName: folderName, workspaceFolder }} onDirectoryModeChange={setDirMode} onDirectoryPathChange={setDirPath} onFolderNameChange={setFolderName} onBrowse={handleBrowse} />}
          {stepIndex === 2 && <DependenciesPage metadata={metadata.metadata} config={projectConfig} />}
          {stepIndex === 3 && <ReviewPage metadata={metadata.metadata} config={projectConfig} />}
        </section>
      </div>

      <footer className="bg-[#fdfaf6] border-hard-3 shadow-hard-sm flex flex-col sm:flex-row items-center justify-between px-3.5 py-2.5 gap-3 shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="border-hard-2 px-1.5 py-0.5 bg-white font-mono font-bold text-xs">&gt;_</div>
          <div className="font-mono text-xs md:text-sm font-medium text-neutral-900 flex items-center gap-2">
            <span>{STEPS[stepIndex].label} configuration</span>
            <span className="text-neutral-400">•</span>
            <span>Changes apply immediately</span>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {stepIndex > 0 && (
            <button onClick={handleBack} disabled={isGenerating} className="flex-1 sm:flex-none bg-white hover:bg-neutral-100 border-hard-2 px-6 py-2 font-display font-extrabold text-sm md:text-base text-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
              Back
            </button>
          )}
          {!isLastStep ? (
            <button onClick={handleNext} disabled={isGenerating} className="flex-1 sm:flex-none bg-[#5be8b5] hover:bg-[#4edaa7] border-hard-2 px-8 py-2 font-display font-extrabold text-sm md:text-base text-black flex items-center justify-center gap-2 shadow-[2.5px_2.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
              <span>Continue</span><span className="text-lg leading-none">→</span>
            </button>
          ) : (
            <button onClick={handleGenerate} disabled={isGenerating} className="flex-1 sm:flex-none bg-[#5be8b5] hover:bg-[#4edaa7] border-hard-2 px-8 py-2 font-display font-extrabold text-sm md:text-base text-black flex items-center justify-center gap-2 shadow-[2.5px_2.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
              {isGenerating ? 'Generating...' : 'Generate Project'}
            </button>
          )}
        </div>
      </footer>

      {isGenerating && (
        <Modal title="Generating project" icon={<span className="font-pixel">⬡</span>} dismissible={false}>
          {generation.progress ? <ProgressView progress={generation.progress} /> : <div className="animate-pulse">Starting...</div>}
        </Modal>
      )}

      {generation.status === 'success' && generation.result && (
        <Modal title="Project generated" icon={<span className="font-pixel">✓</span>} onClose={generation.dismiss} footer={<button className="bg-black text-white px-4 py-2 font-bold uppercase mt-4" onClick={generation.dismiss}>Done</button>}>
          <p className="font-mono mt-4">Your Spring Boot project was created successfully.</p>
          <p className="font-mono font-bold mt-2">{generation.result.projectPath}</p>
        </Modal>
      )}

      {generation.status === 'error' && generation.error && (
        <Modal title="Generation failed" icon={<span className="font-pixel">!</span>} onClose={generation.dismiss}>
          <ErrorView message={generation.error.message} code={generation.error.code} step={generation.error.step} details={generation.error.details} recoverable={generation.error.code !== 'CANCELLED'} onRetry={handleGenerate} onChooseLocation={handleBrowse} />
        </Modal>
      )}
    </main>
  );
}