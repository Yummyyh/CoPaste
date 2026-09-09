import { cn } from '../lib/utils'

const steps = ['解读', '诊断', '行动']

export default function NavBar({ currentStep = 0, onStepClick }) {
  return (
    <div className="fixed top-9 left-0 right-0 z-40 bg-bg/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
        <span className="font-heading text-xl font-semibold text-text tracking-tight">
          读懂JD
        </span>

        <div className="flex items-center gap-2">
          {steps.map((label, i) => {
            const isDone = i < currentStep
            const isCurrent = i === currentStep
            const isFuture = i > currentStep
            const clickable = isDone && onStepClick

            return (
              <button
                type="button"
                key={label}
                disabled={!clickable}
                onClick={() => clickable && onStepClick(i + 1)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border-none',
                  isDone && 'bg-accent/12 text-accent',
                  isCurrent && 'bg-text text-bg',
                  isFuture && 'bg-pill-pending/30 text-text-muted',
                  clickable && 'cursor-pointer hover:bg-accent/20',
                  !clickable && 'cursor-default',
                )}
              >
                <span className="text-xs">{i + 1}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
