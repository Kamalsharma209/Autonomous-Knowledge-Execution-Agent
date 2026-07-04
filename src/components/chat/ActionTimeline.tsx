'use client'

import { CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react'

interface Step {
  step: string
  status: string
  result?: string
  timestamp: string
}

interface ActionTimelineProps {
  steps: Step[]
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} className="text-green-500" />,
  running: <Loader2 size={14} className="text-indigo-500 animate-spin" />,
  failed: <XCircle size={14} className="text-red-500" />,
  pending: <Clock size={14} className="text-zinc-400" />,
}

const statusColors: Record<string, string> = {
  completed: 'border-green-500',
  running: 'border-indigo-500',
  failed: 'border-red-500',
  pending: 'border-zinc-300 dark:border-zinc-600',
}

function formatStepName(step: string): string {
  return step
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

export default function ActionTimeline({ steps }: ActionTimelineProps) {
  return (
    <div className="mt-3 space-y-1">
      <p className="text-xs font-medium text-zinc-500 mb-2">Action Timeline</p>
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              {statusIcons[step.status] || <Clock size={14} className="text-zinc-400" />}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-0.5 h-full min-h-[8px] ${statusColors[step.status] || 'border-zinc-300'}`} />
            )}
          </div>
          <div className="flex-1 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {formatStepName(step.step)}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                step.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                step.status === 'running' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                step.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {step.status}
              </span>
            </div>
            {step.result && (
              <p className="text-xs text-zinc-400 mt-0.5">{step.result}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
