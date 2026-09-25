import type { DirectoryMode } from '../services/messageService';

export interface DirectoryPickerProps {
  mode: DirectoryMode;
  path: string;
  newFolderName: string;
  onModeChange: (mode: DirectoryMode) => void;
  onPathChange: (path: string) => void;
  onFolderNameChange: (name: string) => void;
  onBrowseClick: () => void;
  workspaceFolder?: string;
}

const MODES: { id: DirectoryMode; title: string; sub?: string }[] = [
  { id: 'workspace', title: 'Current workspace' },
  { id: 'newFolder', title: 'In a new subfolder' },
  { id: 'chooseFolder', title: 'Choose a folder' },
];

export function DirectoryPicker({
  mode,
  path,
  newFolderName,
  onModeChange,
  onPathChange,
  onFolderNameChange,
  onBrowseClick,
  workspaceFolder,
}: DirectoryPickerProps) {
  return (
    <div className="mt-2">
      <label className="font-pixel text-xs font-bold text-black block mb-1.5">
        Output location
      </label>
      <div aria-label="Output Location" className="grid grid-cols-1 md:grid-cols-3 gap-3" role="radiogroup">
        {MODES.map(option => {
          const selected = mode === option.id;
          return (
            <div
              key={option.id}
              aria-checked={selected}
              className={`${selected ? 'bg-pixel-mint' : 'bg-[#faf6ee] hover:bg-amber-50'} border-2 border-black p-2.5 flex items-center gap-3 shadow-[2px_2px_0px_#000] cursor-pointer transition-colors`}
              role="radio"
              tabIndex={0}
              onClick={() => onModeChange(option.id)}
            >
              <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 bg-transparent">
                {selected && <div className="w-2 h-2 rounded-full bg-black"></div>}
              </div>
              <div className="leading-tight overflow-hidden">
                <div className={`text-xs font-mono font-bold text-black ${!selected && 'font-medium'}`}>
                  {option.title}
                </div>
                {option.id === 'workspace' && workspaceFolder && (
                  <div className="text-[11px] font-mono text-gray-900 truncate">
                    {workspaceFolder}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {mode === 'newFolder' && (
        <div className="mt-4">
          <div className="flex justify-between items-baseline mb-1">
            <label className="font-pixel text-xs font-bold text-black">Folder name</label>
            <span className="text-[11px] text-gray-600 font-mono">Created inside the workspace</span>
          </div>
          <input
            type="text"
            className="w-full bg-[#faf6ee] border-2 border-black px-3 py-1.5 font-mono text-sm text-black focus:outline-none focus:ring-0 focus:border-black shadow-[2px_2px_0px_#000]"
            value={newFolderName}
            onChange={e => onFolderNameChange(e.target.value)}
            placeholder="my-project"
            spellCheck={false}
          />
        </div>
      )}

      {mode === 'chooseFolder' && (
        <div className="mt-4">
          <div className="flex justify-between items-baseline mb-1">
            <label className="font-pixel text-xs font-bold text-black">Target folder</label>
          </div>
          <div className="flex">
            <input
              type="text"
              className="w-full bg-[#faf6ee] border-2 border-black border-r-0 px-3 py-1.5 font-mono text-sm text-black focus:outline-none focus:ring-0 focus:border-black shadow-[2px_2px_0px_#000]"
              value={path}
              onChange={e => onPathChange(e.target.value)}
              placeholder="/path/to/folder"
              spellCheck={false}
            />
            <button
              type="button"
              className="bg-pixel-mint hover:bg-emerald-400 border-2 border-black px-4 py-1.5 font-mono text-xs font-bold text-black flex items-center justify-center shadow-[2px_2px_0px_#000]"
              onClick={onBrowseClick}
            >
              Browse…
            </button>
          </div>
        </div>
      )}
    </div>
  );
}