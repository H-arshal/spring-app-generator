import { SelectField, SegmentedControl } from '../components';
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
      <div className="p-4 font-mono font-bold">Waiting for Spring Initializr metadata…</div>
    );
  }

  return (
    <div className="relative flex flex-col flex-grow w-full">
      {/* Top Right Decorative Pixel Cluster */}
      <div aria-hidden="true" className="absolute top-0 right-0 pointer-events-none hidden sm:block z-0">
        <div className="relative w-48 h-36">
          <div className="absolute top-0 right-0 w-44 h-8 bg-gradient-to-r from-[#ff007a] via-[#ff2a85] to-[#ff6347]"></div>
          <div className="absolute top-0 right-36 w-6 h-6 bg-[#ff2a85]"></div>
          <div className="absolute top-6 right-44 w-4 h-4 bg-[#ff2a85]"></div>
          <div className="absolute top-12 right-32 w-4 h-4 bg-[#ff4a68]"></div>
          <div className="absolute top-8 right-0 w-36 h-8 bg-gradient-to-r from-[#ff3366] to-[#ff7836]"></div>
          <div className="absolute top-16 right-0 w-28 h-8 bg-[#ff6347]"></div>
          <div className="absolute top-24 right-0 w-20 h-6 bg-[#ff6347]"></div>
          <div className="absolute top-20 right-28 w-5 h-5 bg-[#ff7c43]"></div>
          <div className="absolute top-12 right-6 w-6 h-9 bg-black"></div>
          <div className="absolute top-20 right-10 w-7 h-11 bg-black"></div>
          <div className="absolute top-28 right-0 w-5 h-5 bg-[#ff7c43]"></div>
        </div>
      </div>
        <div className="relative z-10 mb-6">
          <span className="text-[#ff1a75] font-pixel font-bold text-[11px] md:text-xs tracking-wider uppercase block mb-1">
            STEP 1 OF 4
          </span>
          <h2 className="font-pixel font-bold text-3xl md:text-4xl text-black tracking-normal mb-2 uppercase">
            Platform
          </h2>
          <p className="font-mono text-xs md:text-sm text-neutral-800 font-medium">
            Choose the Spring Boot version, Java runtime, language and build tool.
          </p>
        </div>

        <div className="border-hard-2 bg-transparent p-4 mb-6 relative mt-4">
          <div className="absolute -top-4 left-0 right-0 flex items-center justify-between px-3">
            <div className="bg-[#00d2ff] border-hard-2 px-3 py-1 font-pixel font-bold text-[11px] md:text-xs uppercase shadow-[2px_2px_0px_#000]">
              PLATFORM
            </div>
            <div className="bg-[#fdfaf6] px-2 font-mono text-[11px] font-bold text-neutral-800 flex items-center gap-1.5">
              Versions and runtime targets <span className="inline-block w-2.5 h-2.5 bg-black"></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 pt-3">
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
            <SegmentedControl
              label="Language"
              options={metadata.languages}
              value={cfg.language}
              onChange={v => updateField('language', v)}
            />
            <SelectField
              label="Packaging"
              value={cfg.packaging}
              options={metadata.packagingTypes}
              onChange={v => updateField('packaging', v)}
            />
          </div>
        </div>

        <div className="border-hard-2 bg-transparent p-4 relative mt-7">
          <div className="absolute -top-4 left-0 right-0 flex items-center justify-between px-3">
            <div className="bg-[#00d2ff] border-hard-2 px-3 py-1 font-pixel font-bold text-[11px] md:text-xs uppercase shadow-[2px_2px_0px_#000]">
              BUILD
            </div>
            <div className="bg-[#fdfaf6] px-2 font-mono text-[11px] font-bold text-neutral-800 flex items-center gap-1.5">
              Build tool and project format <span className="inline-block w-2.5 h-2.5 bg-black"></span>
            </div>
          </div>
          <div className="pt-3">
            <SegmentedControl
              label="Build tool"
              options={metadata.projectTypes}
              value={cfg.projectType}
              onChange={v => updateField('projectType', v)}
            />
          </div>
        </div>
    </div>
  );
}