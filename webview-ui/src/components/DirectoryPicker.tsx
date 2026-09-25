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

/**
 * Output-location chooser. Renders the mode options as a radio list, then
 * reveals only the field relevant to the chosen mode.
 */
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
    <div className="stack">
      <fieldset className="field" style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend className="field-label" style={{ padding: 0 }}>
          Output location
        </legend>
        <div className="option-list">
          {MODES.map(option => {
            const selected = mode === option.id;
            return (
              <label
                key={option.id}
                className={`option ${selected ? 'is-selected' : ''}`}
              >
                <input
                  type="radio"
                  className="option-input"
                  name="directoryMode"
                  value={option.id}
                  checked={selected}
                  onChange={() => onModeChange(option.id)}
                />
                <span className="option-text">
                  <span className="option-title">{option.title}</span>
                  {option.id === 'workspace' && workspaceFolder && (
                    <span className="option-sub">{workspaceFolder}</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {mode === 'newFolder' && (
        <label className="field">
          <span className="field-label">
            Folder name
            <span className="field-hint">Created inside the workspace</span>
          </span>
          <input
            type="text"
            className="control"
            value={newFolderName}
            onChange={e => onFolderNameChange(e.target.value)}
            placeholder="my-project"
            spellCheck={false}
          />
        </label>
      )}

      {mode === 'chooseFolder' && (
        <label className="field">
          <span className="field-label">Target folder</span>
          <span className="path-row">
            <input
              type="text"
              className="control"
              value={path}
              onChange={e => onPathChange(e.target.value)}
              placeholder="/path/to/folder"
              spellCheck={false}
            />
            <button type="button" className="btn btn-ghost" onClick={onBrowseClick}>
              Browse…
            </button>
          </span>
        </label>
      )}
    </div>
  );
}