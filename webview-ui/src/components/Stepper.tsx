export interface StepDef {
  id: string;
  label: string;
  meta?: string;
}

export interface StepperProps {
  steps: StepDef[];
  currentIndex: number;
  furthestIndex: number;
  onSelect: (index: number) => void;
  variant?: 'rail' | 'compact';
}

const STEP_COLORS = ['#ff2a85', '#00d2ff', '#ff6347', '#a855f7'];

export function Stepper({
  steps,
  currentIndex,
  furthestIndex,
  onSelect,
  variant = 'rail',
}: StepperProps) {
  if (variant === 'compact') {
    return null; // The neo-brutalist design doesn't use the horizontal compact stepper inside the stage, we handle it in sidebar
  }

  return (
    <aside className="w-full md:w-64 shrink-0 bg-[#fdfaf6] border-hard-3 flex flex-col justify-between relative overflow-hidden min-h-[530px]" data-purpose="step-navigation">
      <div className="p-3.5">
        <div className="font-pixel font-bold text-xs uppercase tracking-wider text-black mb-3">
          SETUP
        </div>
        <nav aria-label="Setup Steps" className="space-y-3 relative z-10">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isDone = index < currentIndex;
            const isReachable = index <= furthestIndex;
            const stepColor = STEP_COLORS[index % STEP_COLORS.length];

            if (isActive) {
              return (
                <div key={step.id} className="relative">
                  <div className="step-active-gradient border-hard-2 p-2.5 flex items-center gap-3 shadow-[2px_2px_0px_#000]">
                    <div className="w-8 h-8 bg-transparent border-hard-2 flex items-center justify-center font-bold text-base text-black flex-shrink-0">
                      {isDone ? '✓' : index + 1}
                    </div>
                    <div>
                      <div className="font-display font-bold text-sm text-black leading-tight">{step.label}</div>
                      <div className="font-mono text-[11px] font-medium text-black">{step.meta}</div>
                    </div>
                  </div>
                  <div className="absolute -right-[10px] top-1/2 -translate-y-1/2 flex-col items-start hidden sm:flex">
                    <div className="w-2.5 h-2.5 bg-black"></div>
                    <div className="w-1.5 h-2.5 bg-black ml-1"></div>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={step.id}
                onClick={() => isReachable && onSelect(index)}
                className={`p-2.5 flex items-center gap-3 border-2 border-transparent transition-colors group ${
                  isReachable ? 'cursor-pointer hover:border-black' : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div 
                  className="w-8 h-8 border-hard-2 flex items-center justify-center font-bold text-base text-black flex-shrink-0"
                  style={{ backgroundColor: isDone ? '#5be8b5' : stepColor }}
                >
                  {isDone ? '✓' : index + 1}
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-black leading-tight">{step.label}</div>
                  <div className="font-mono text-[11px] font-medium text-neutral-700">{step.meta}</div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
      
      <div aria-hidden="true" className="relative w-full h-32 pointer-events-none self-end mt-auto" data-purpose="pixel-staircase">
        <div className="absolute bottom-0 left-0 w-5 h-28 bg-black"></div>
        <div className="absolute bottom-0 left-5 w-5 h-20 bg-black"></div>
        <div className="absolute bottom-10 left-0 w-5 h-5 bg-[#ff6347]"></div>
        <div className="absolute bottom-3 left-5 w-5 h-5 bg-[#ff2a85]"></div>
        <div className="absolute bottom-0 left-10 w-6 h-14 bg-black"></div>
        <div className="absolute bottom-0 left-16 w-6 h-9 bg-black"></div>
        <div className="absolute bottom-4 left-16 w-5 h-4 bg-[#ff7c43]"></div>
        <div className="absolute bottom-0 left-20 w-8 h-5 bg-black"></div>
        <div className="absolute bottom-0 left-28 w-5 h-5 bg-[#ff2a85]"></div>
      </div>
    </aside>
  );
}