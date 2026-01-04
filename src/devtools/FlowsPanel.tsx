import React, { useState, useEffect } from 'react'
import { cn, scrollbarStyles } from '../ui/utils'
import { CheckIcon, RefreshIcon, ChevronDownIcon, ChevronRightIcon } from './icons'
import {
  getAllFlows,
  subscribeFlows,
  getFlowProgress,
  toggleStepComplete,
  toggleTaskComplete,
  resetFlowProgress,
  navigateToFrame,
} from '../frames'
import type { Flow, FlowStep } from '../frames'

interface FlowsPanelProps {
  embedded?: boolean
  className?: string
}

/**
 * FlowsPanel - DevTools panel for demo flows
 *
 * Shows vertical stepper with frames as steps and optional subtasks.
 * Allows navigation to frames and manual completion tracking.
 */
export function FlowsPanel({ embedded = false, className }: FlowsPanelProps) {
  const [, forceUpdate] = useState({})
  const [flows, setFlows] = useState<Flow[]>([])
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  const [selectOpen, setSelectOpen] = useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  // Close select on outside click
  useEffect(() => {
    if (!selectOpen) return
    const handleClick = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setSelectOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selectOpen])

  // Subscribe to flow registry
  useEffect(() => {
    const update = () => {
      const allFlows = getAllFlows()
      setFlows(allFlows)
      // Auto-select first flow if none selected
      if (!selectedFlowId && allFlows.length > 0) {
        setSelectedFlowId(allFlows[0].id)
      }
    }
    update()
    return subscribeFlows(update)
  }, [selectedFlowId])

  // Force re-render on progress change
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 500)
    return () => clearInterval(interval)
  }, [])

  const selectedFlow = flows.find(f => f.id === selectedFlowId)
  const progress = selectedFlowId ? getFlowProgress(selectedFlowId) : null

  const handleStepClick = (step: FlowStep, stepIndex: number) => {
    // Navigate to the frame
    navigateToFrame(selectedFlow!.appId, step.frame.id)
  }

  const handleStepCheck = (e: React.MouseEvent, stepIndex: number) => {
    e.stopPropagation()
    if (selectedFlowId) {
      toggleStepComplete(selectedFlowId, stepIndex)
      forceUpdate({})
    }
  }

  const handleTaskCheck = (e: React.MouseEvent, stepIndex: number, taskIndex: number) => {
    e.stopPropagation()
    if (selectedFlowId) {
      toggleTaskComplete(selectedFlowId, stepIndex, taskIndex)
      forceUpdate({})
    }
  }

  const handleReset = () => {
    if (selectedFlowId) {
      resetFlowProgress(selectedFlowId)
      forceUpdate({})
    }
  }

  const toggleStepExpanded = (e: React.MouseEvent, stepIndex: number) => {
    e.stopPropagation()
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepIndex)) {
        next.delete(stepIndex)
      } else {
        next.add(stepIndex)
      }
      return next
    })
  }

  const isStepCompleted = (stepIndex: number) => {
    return progress?.completedSteps.includes(stepIndex) ?? false
  }

  const isTaskCompleted = (stepIndex: number, taskIndex: number) => {
    return progress?.completedTasks[stepIndex]?.includes(taskIndex) ?? false
  }

  // Calculate overall progress
  const totalSteps = selectedFlow?.steps.length ?? 0
  const completedSteps = progress?.completedSteps.length ?? 0
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  if (flows.length === 0) {
    return (
      <div className={cn('h-full flex items-center justify-center p-4', className)}>
        <div className="text-center">
          <p className="text-neutral-500 text-sm">No flows defined</p>
          <p className="text-neutral-600 text-xs mt-1">Use defineFlow() to create flows</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(embedded ? 'flex flex-col min-h-full' : 'h-full flex flex-col', className)}>
      {/* Header with flow selector */}
      <div className="px-3 py-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          {/* Custom Select */}
          <div ref={selectRef} className="relative flex-1">
            <button
              onClick={() => setSelectOpen(!selectOpen)}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm rounded-md',
                'bg-neutral-900 border border-neutral-800',
                'text-neutral-100 hover:bg-neutral-800 hover:border-neutral-700',
                'focus:outline-none focus:border-neutral-600',
                'transition-colors duration-150'
              )}
            >
              <span className="truncate font-medium">
                {selectedFlow?.name || 'Select flow...'}
              </span>
              <ChevronDownIcon
                size={12}
                className={cn('text-neutral-500 transition-transform duration-200 flex-shrink-0', selectOpen && 'rotate-180')}
              />
            </button>

            {/* Dropdown */}
            {selectOpen && (
              <div
                className={cn(
                  'absolute top-full left-0 right-0 mt-1 z-50',
                  'bg-neutral-900 border border-neutral-800 rounded-md',
                  'overflow-hidden'
                )}
              >
                {flows.map((flow) => (
                  <button
                    key={flow.id}
                    onClick={() => {
                      setSelectedFlowId(flow.id)
                      setSelectOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 text-sm text-left',
                      'hover:bg-neutral-800 transition-colors duration-150',
                      flow.id === selectedFlowId
                        ? 'text-neutral-100 bg-neutral-800 border-l-2 border-neutral-600'
                        : 'text-neutral-300'
                    )}
                  >
                    <span className="truncate font-medium">{flow.name}</span>
                    {flow.id === selectedFlowId && (
                      <CheckIcon size={12} className="text-neutral-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className={cn(
              'p-1.5 rounded-md text-neutral-400',
              'hover:bg-neutral-800 hover:text-neutral-200',
              'transition-colors duration-150',
              'border border-neutral-800 hover:border-neutral-700'
            )}
            title="Reset progress"
          >
            <RefreshIcon size={14} />
          </button>
        </div>

        {/* Progress bar */}
        {selectedFlow && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-neutral-400">
                {selectedFlow.description || 'Flow progress'}
              </span>
              <span className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded',
                'bg-neutral-800 text-neutral-300'
              )}>
                {progressPercent}%
              </span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  'bg-emerald-600'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className={cn('flex-1 overflow-y-auto px-3 py-3', scrollbarStyles)}>
        {selectedFlow?.steps.map((step, stepIndex) => {
          const completed = isStepCompleted(stepIndex)
          const hasTasks = step.tasks && step.tasks.length > 0
          const isExpanded = expandedSteps.has(stepIndex)
          const isLast = stepIndex === selectedFlow.steps.length - 1
          const isActive = stepIndex === (progress?.completedSteps.length ?? 0)

          return (
            <div key={stepIndex} className="flex group">
              {/* Left column: circle + connector */}
              <div className="flex flex-col items-center mr-3 relative">
                {/* Circle with check */}
                <button
                  onClick={(e) => handleStepCheck(e, stepIndex)}
                  className={cn(
                    'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center',
                    'border-2 transition-colors duration-150 z-10 relative',
                    completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isActive
                      ? 'bg-neutral-700 border-neutral-600 text-neutral-200'
                      : 'border-neutral-700 hover:border-neutral-600 bg-neutral-900 text-neutral-500 hover:text-neutral-400'
                  )}
                >
                  {completed ? (
                    <CheckIcon size={14} className="text-white" />
                  ) : (
                    <span className={cn(
                      'text-xs font-semibold',
                      isActive ? 'text-neutral-200' : 'text-neutral-500'
                    )}>
                      {stepIndex + 1}
                    </span>
                  )}
                </button>
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[16px] mt-1.5 transition-colors duration-150',
                      completed 
                        ? 'bg-emerald-600' 
                        : 'bg-neutral-800'
                    )}
                  />
                )}
              </div>

              {/* Right column: content */}
              <div
                onClick={() => handleStepClick(step, stepIndex)}
                className={cn(
                  'flex-1 min-w-0 pb-3 cursor-pointer transition-all',
                  'hover:translate-x-0.5'
                )}
              >
                {/* Step card */}
                <div className={cn(
                  'rounded-md border transition-colors duration-150',
                  'hover:border-neutral-700',
                  completed
                    ? 'bg-neutral-900 border-emerald-600/30 hover:bg-neutral-900'
                    : isActive
                    ? 'bg-neutral-900 border-neutral-700 hover:bg-neutral-900'
                    : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
                )}>
                  <div className="p-2">
                    {/* Header with expand button and checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {hasTasks && (
                            <button
                              onClick={(e) => toggleStepExpanded(e, stepIndex)}
                              className={cn(
                                'p-0.5 rounded transition-colors flex-shrink-0',
                                'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                              )}
                            >
                              {isExpanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
                            </button>
                          )}
                          <h3
                            className={cn(
                              'text-sm font-semibold leading-tight',
                              completed
                                ? 'text-emerald-400'
                                : 'text-neutral-100'
                            )}
                          >
                            {step.frame.name}
                          </h3>
                        </div>
                        {step.frame.description && (
                          <p className={cn(
                            'text-xs leading-snug mt-1',
                            completed
                              ? 'text-emerald-500/70'
                              : 'text-neutral-400'
                          )}>
                            {step.frame.description}
                          </p>
                        )}
                      </div>
                      {/* Step completion checkbox */}
                      <button
                        onClick={(e) => handleStepCheck(e, stepIndex)}
                        className={cn(
                          'w-5 h-5 rounded flex-shrink-0 flex items-center justify-center',
                          'border transition-colors duration-150 mt-0.5',
                          completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-neutral-600 bg-neutral-800 hover:border-emerald-500 hover:bg-neutral-700'
                        )}
                        title={completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {completed && <CheckIcon size={12} className="text-white" />}
                      </button>
                    </div>

                    {/* Tasks */}
                    {hasTasks && (
                      <div className={cn(
                        'mt-2 pt-2 border-t transition-all duration-200 overflow-hidden',
                        isExpanded 
                          ? 'max-h-96 opacity-100' 
                          : 'max-h-0 opacity-0',
                        'border-neutral-800'
                      )}>
                        <div className="space-y-1.5">
                          {step.tasks!.map((task, taskIndex) => {
                            const taskCompleted = isTaskCompleted(stepIndex, taskIndex)
                            return (
                              <div
                                key={taskIndex}
                                onClick={(e) => handleTaskCheck(e, stepIndex, taskIndex)}
                                className={cn(
                                  'flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors',
                                  'hover:bg-neutral-800 cursor-pointer',
                                  taskCompleted && 'bg-emerald-600/10'
                                )}
                              >
                                <div
                                  className={cn(
                                    'w-4 h-4 rounded flex-shrink-0 flex items-center justify-center',
                                    'border transition-colors duration-150',
                                    taskCompleted
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600 text-transparent'
                                  )}
                                >
                                  {taskCompleted && <CheckIcon size={10} className="text-white" />}
                                </div>
                                <span
                                  className={cn(
                                    'text-xs flex-1',
                                    taskCompleted 
                                      ? 'text-emerald-400 line-through decoration-emerald-600/50' 
                                      : 'text-neutral-300'
                                  )}
                                >
                                  {task}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

FlowsPanel.displayName = 'FlowsPanel'
