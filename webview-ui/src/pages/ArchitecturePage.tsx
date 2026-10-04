import type { ProjectConfigHookResult } from '../hooks/useProjectConfig';
import type { ArchitectureType } from '../services/messageService';

export interface ArchitecturePageProps {
  config: ProjectConfigHookResult;
}

const ARCHITECTURES: { id: ArchitectureType; title: string; desc: string; structure: string }[] = [
  {
    id: 'minimal',
    title: 'Minimal',
    desc: 'Generate a clean Spring Boot project without additional architecture. Preserves exact Initializr behavior.',
    structure: 'src/main/java/com/example/app/\n└── Application.java'
  },
  {
    id: 'layered',
    title: 'Layered Architecture',
    desc: 'Classic MVC structure separating concerns into distinct layers.',
    structure: '├── controller/\n├── service/\n├── repository/\n├── model/\n├── config/\n└── Application.java'
  },
  {
    id: 'rest-api',
    title: 'REST API',
    desc: 'A production-friendly starting structure for REST APIs. Highly recommended.',
    structure: '├── config/\n├── controller/\n├── dto/\n├── entity/\n├── exception/\n├── repository/\n├── service/\n└── Application.java'
  }
];

export function ArchitecturePage({ config }: ArchitecturePageProps) {
  const { config: cfg, updateField } = config;
  const arch = cfg.architecture;

  const setArchType = (type: ArchitectureType) => {
    updateField('architecture', { ...arch, type });
  };

  const toggleBoilerplate = (key: keyof typeof arch) => {
    updateField('architecture', { ...arch, [key]: !arch[key] });
  };

  return (
    <div className="relative flex flex-col flex-grow w-full">
      <div className="relative z-10 mb-6">
        <span className="text-[#ff1a75] font-pixel font-bold text-[11px] md:text-xs tracking-wider uppercase block mb-1">
          STEP 3 OF 5
        </span>
        <h2 className="font-pixel font-bold text-3xl md:text-4xl text-black tracking-normal mb-2 uppercase">
          Architecture
        </h2>
        <p className="font-mono text-xs md:text-sm text-neutral-800 font-medium">
          Choose a project structure and inject optional boilerplate code.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Architecture Types */}
        <div className="flex-1 flex flex-col gap-3">
          {ARCHITECTURES.map((option) => {
            const selected = arch.type === option.id;
            return (
              <div
                key={option.id}
                onClick={() => setArchType(option.id)}
                className={`border-2 border-black p-4 cursor-pointer transition-colors shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000] ${
                  selected ? 'bg-[#5be8b5]' : 'bg-[#faf6ee]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-pixel font-bold text-lg uppercase flex items-center gap-2">
                    {option.title}
                    {option.id === 'rest-api' && <span className="text-[#ff1a75] text-xl">★</span>}
                  </h3>
                  <div className="w-5 h-5 rounded-full border-2 border-black bg-white flex items-center justify-center">
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                  </div>
                </div>
                <p className="font-mono text-xs text-neutral-800 mb-3">{option.desc}</p>
                
                {selected && (
                  <div className="bg-white border-2 border-black p-2 mt-2">
                    <pre className="font-mono text-[10px] text-black leading-tight overflow-x-auto whitespace-pre">
                      {option.structure}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Boilerplate Components */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          <div className="border-hard-2 bg-[#ffeb3b] p-4 shadow-[4px_4px_0px_#000]">
            <h3 className="font-pixel font-bold text-sm uppercase mb-3 border-b-2 border-black pb-2">
              Additional Components
            </h3>
            
            <div className={`flex flex-col gap-3 ${arch.type === 'minimal' ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 border-2 border-black bg-white checked:bg-[#ff1a75] transition-colors shadow-[2px_2px_0px_#000] cursor-pointer"
                    checked={arch.globalExceptionHandler}
                    onChange={() => toggleBoilerplate('globalExceptionHandler')}
                  />
                  {arch.globalExceptionHandler && (
                    <svg className="absolute w-3.5 h-3.5 top-0.5 left-0.5 text-white pointer-events-none" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M2.5 7L5.5 10L11.5 3" strokeLinecap="square" strokeLinejoin="miter"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold text-black group-hover:text-[#ff1a75] transition-colors">Global Exception Handler</span>
                  <span className="font-mono text-[10px] text-neutral-700">@RestControllerAdvice</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 border-2 border-black bg-white checked:bg-[#ff1a75] transition-colors shadow-[2px_2px_0px_#000] cursor-pointer"
                    checked={arch.dto}
                    onChange={() => toggleBoilerplate('dto')}
                  />
                  {arch.dto && (
                    <svg className="absolute w-3.5 h-3.5 top-0.5 left-0.5 text-white pointer-events-none" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M2.5 7L5.5 10L11.5 3" strokeLinecap="square" strokeLinejoin="miter"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold text-black group-hover:text-[#ff1a75] transition-colors">DTO Structure</span>
                  <span className="font-mono text-[10px] text-neutral-700">Request & Response packages</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 border-2 border-black bg-white checked:bg-[#ff1a75] transition-colors shadow-[2px_2px_0px_#000] cursor-pointer"
                    checked={arch.validation}
                    onChange={() => toggleBoilerplate('validation')}
                  />
                  {arch.validation && (
                    <svg className="absolute w-3.5 h-3.5 top-0.5 left-0.5 text-white pointer-events-none" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M2.5 7L5.5 10L11.5 3" strokeLinecap="square" strokeLinejoin="miter"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold text-black group-hover:text-[#ff1a75] transition-colors">Validation Setup</span>
                  <span className="font-mono text-[10px] text-neutral-700">@NotNull, @Valid, etc.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 border-2 border-black bg-white checked:bg-[#ff1a75] transition-colors shadow-[2px_2px_0px_#000] cursor-pointer"
                    checked={arch.apiResponse}
                    onChange={() => toggleBoilerplate('apiResponse')}
                  />
                  {arch.apiResponse && (
                    <svg className="absolute w-3.5 h-3.5 top-0.5 left-0.5 text-white pointer-events-none" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M2.5 7L5.5 10L11.5 3" strokeLinecap="square" strokeLinejoin="miter"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold text-black group-hover:text-[#ff1a75] transition-colors">API Response Wrapper</span>
                  <span className="font-mono text-[10px] text-neutral-700">Standardized JSON responses</span>
                </div>
              </label>
            </div>
            
            {arch.type === 'minimal' && (
              <p className="font-mono text-[10px] text-[#ff1a75] font-bold mt-4">
                * Boilerplate disabled for Minimal architecture.
              </p>
            )}
          </div>

          {/* Scaffolding Engine Block */}
          {arch.type === 'rest-api' && (
            <div className="border-hard-2 bg-[#5be8b5] p-4 shadow-[4px_4px_0px_#000] mt-2">
              <h3 className="font-pixel font-bold text-sm uppercase mb-2 border-b-2 border-black pb-2 flex items-center justify-between">
                <span>Scaffolding Engine</span>
                <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-sm">v1.1</span>
              </h3>
              <p className="font-mono text-[10px] text-neutral-800 font-medium mb-3 leading-tight">
                Generate a fully working CRUD module (Controller, Service, Repository, Entity) as a reference pattern.
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-pixel text-[10px] font-bold text-black uppercase">Sample Entity Name</label>
                <input
                  type="text"
                  placeholder="e.g., Task, Product, User"
                  value={cfg.scaffoldEntity || ''}
                  onChange={(e) => updateField('scaffoldEntity', e.target.value)}
                  className="w-full border-2 border-black bg-white p-2 font-mono text-xs focus:outline-none focus:ring-0 placeholder:text-gray-400 shadow-[2px_2px_0px_#000]"
                />
              </div>

              {cfg.scaffoldEntity && cfg.scaffoldEntity.trim().length > 0 && (
                <div className="mt-3 bg-black text-white p-2 font-mono text-[10px] border-2 border-black shadow-[2px_2px_0px_#000]">
                  <div className="font-bold mb-1 text-[#ffeb3b]">Will generate:</div>
                  <ul className="list-disc list-inside opacity-90 leading-tight">
                    <li>{cfg.scaffoldEntity}Controller</li>
                    <li>{cfg.scaffoldEntity}Service (Interface & Impl)</li>
                    <li>{cfg.scaffoldEntity}Repository</li>
                    <li>{cfg.scaffoldEntity} Entity & DTOs</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
