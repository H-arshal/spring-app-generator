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
    <div className="relative flex flex-col flex-grow w-full">
      {/* Top Right Decorative Pixel Cluster (optional, hidden on mobile) */}
      <div aria-hidden="true" className="absolute top-0 right-0 pointer-events-none hidden sm:block">
        <div className="flex flex-col items-end">
          <div className="flex">
            <span className="w-7 h-5 bg-pixel-pink"></span>
            <span className="w-7 h-5 bg-pixel-pink"></span>
            <span className="w-8 h-5 bg-pixel-orange"></span>
            <span className="w-6 h-5 bg-pixel-orange"></span>
          </div>
          <div className="flex">
            <span className="w-4 h-4 bg-pixel-pink mr-6"></span>
            <span className="w-6 h-4 bg-pixel-pink"></span>
            <span className="w-8 h-4 bg-pixel-pink"></span>
            <span className="w-7 h-4 bg-pixel-orange"></span>
            <span className="w-5 h-4 bg-black"></span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-4">
        <span className="text-xs font-pixel font-bold text-pixel-pink tracking-wider uppercase block mb-1">
          STEP 2 OF 4
        </span>
        <h2 className="text-4xl md:text-5xl font-pixel font-bold tracking-tight text-black">
          Details
        </h2>
        <p className="text-xs md:text-sm text-gray-800 font-mono mt-1 font-medium">
          Set the project coordinates and where the project should be written.
        </p>
      </div>

      {/* SECTION: COORDINATES */}
      <div className="mt-6 border-2 border-black bg-panel-bg p-4 pt-5 relative shadow-[3px_3px_0px_#000]">
        <div className="absolute -top-3.5 left-0 flex items-center bg-pixel-cyan border-2 border-black px-3 py-0.5 shadow-[2px_2px_0px_#000]">
          <span className="font-pixel text-[11px] font-bold tracking-wider text-black">COORDINATES</span>
        </div>
        <div className="flex items-center justify-end gap-1.5 mb-3 text-xs text-black font-mono">
          <span>How the project identifies itself</span>
          <span className="w-2.5 h-2.5 bg-black inline-block"></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
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
            placeholder="demo"
            hint="Project handle"
          />
          <TextField
            label="Name"
            value={cfg.name}
            onChange={v => config.updateField('name', v)}
            placeholder="demo"
          />
          <TextField
            label="Package"
            value={cfg.packageName}
            onChange={setPackageName}
            placeholder="com.example.demo"
            affix={
              !cfg.packageNameEditing ? (
                <div className="bg-pixel-mint border-2 border-black px-4 py-1.5 font-mono text-xs font-bold text-black flex items-center justify-center shadow-[2px_2px_0px_#000] cursor-default">
                  auto
                </div>
              ) : (
                <button
                  type="button"
                  className="bg-pixel-cyan hover:bg-cyan-400 border-2 border-black px-4 py-1.5 font-mono text-xs font-bold text-black flex items-center justify-center shadow-[2px_2px_0px_#000]"
                  onClick={resetPackageName}
                  title="Reset to the package derived from Group and Artifact"
                >
                  reset
                </button>
              )
            }
          />
          <div className="md:col-span-2 mt-1">
            <TextField
              label="Description"
              value={cfg.description}
              onChange={v => config.updateField('description', v)}
              placeholder="A short description of the project"
            />
          </div>
        </div>
      </div>

      {/* SECTION: OUTPUT */}
      <div className="mt-7 border-2 border-black bg-panel-bg p-4 pt-5 relative shadow-[3px_3px_0px_#000] mb-8">
        <div className="absolute -top-3.5 left-0 flex items-center bg-pixel-cyan border-2 border-black px-3 py-0.5 shadow-[2px_2px_0px_#000]">
          <span className="font-pixel text-[11px] font-bold tracking-wider text-black">OUTPUT</span>
        </div>
        <div className="flex items-center justify-end gap-1.5 mb-2 text-xs text-black font-mono">
          <span>Where the project will be written</span>
          <span className="w-2.5 h-2.5 bg-black inline-block"></span>
        </div>

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
    </div>
  );
}