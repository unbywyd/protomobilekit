import type { Flow, FlowDefinitionInput, FlowProgress } from './types'

/**
 * Flow Registry - Central store for all app flows
 *
 * Flows are used for demo presentations to show business processes
 * step by step through the app screens.
 */

// Internal state
const flowRegistry = new Map<string, Flow>()
const flowListeners = new Set<() => void>()

// Progress storage key prefix
const PROGRESS_KEY_PREFIX = 'mobilekit-flow-progress-'

/**
 * Register a flow
 */
export function registerFlow(flow: Flow): void {
  flowRegistry.set(flow.id, flow)
  notifyFlowListeners()
}

/**
 * Unregister a flow
 */
export function unregisterFlow(flowId: string): void {
  flowRegistry.delete(flowId)
  notifyFlowListeners()
}

/**
 * Get all registered flows
 */
export function getAllFlows(): Flow[] {
  return Array.from(flowRegistry.values())
}

/**
 * Get flows for a specific app
 */
export function getAppFlows(appId: string): Flow[] {
  return getAllFlows().filter(f => f.appId === appId)
}

/**
 * Get a specific flow
 */
export function getFlow(flowId: string): Flow | undefined {
  return flowRegistry.get(flowId)
}

/**
 * Subscribe to flow registry changes
 */
export function subscribeFlows(listener: () => void): () => void {
  flowListeners.add(listener)
  return () => flowListeners.delete(listener)
}

/**
 * Clear all registered flows (for testing)
 */
export function clearFlowRegistry(): void {
  flowRegistry.clear()
  notifyFlowListeners()
}

// Progress management

/**
 * Get flow progress from localStorage
 */
export function getFlowProgress(flowId: string): FlowProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY_PREFIX + flowId)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return {
    flowId,
    completedSteps: [],
    completedTasks: {},
  }
}

/**
 * Save flow progress to localStorage
 */
export function saveFlowProgress(progress: FlowProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY_PREFIX + progress.flowId, JSON.stringify(progress))
    notifyFlowListeners()
  } catch {
    // Ignore storage errors
  }
}

/**
 * Toggle step completion
 */
export function toggleStepComplete(flowId: string, stepIndex: number): void {
  const progress = getFlowProgress(flowId)
  const idx = progress.completedSteps.indexOf(stepIndex)
  if (idx === -1) {
    progress.completedSteps.push(stepIndex)
  } else {
    progress.completedSteps.splice(idx, 1)
  }
  saveFlowProgress(progress)
}

/**
 * Toggle task completion
 */
export function toggleTaskComplete(flowId: string, stepIndex: number, taskIndex: number): void {
  const progress = getFlowProgress(flowId)
  if (!progress.completedTasks[stepIndex]) {
    progress.completedTasks[stepIndex] = []
  }
  const tasks = progress.completedTasks[stepIndex]
  const idx = tasks.indexOf(taskIndex)
  if (idx === -1) {
    tasks.push(taskIndex)
  } else {
    tasks.splice(idx, 1)
  }
  saveFlowProgress(progress)
}

/**
 * Reset flow progress
 */
export function resetFlowProgress(flowId: string): void {
  try {
    localStorage.removeItem(PROGRESS_KEY_PREFIX + flowId)
    notifyFlowListeners()
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if step is completed
 */
export function isStepComplete(flowId: string, stepIndex: number): boolean {
  const progress = getFlowProgress(flowId)
  return progress.completedSteps.includes(stepIndex)
}

/**
 * Check if task is completed
 */
export function isTaskComplete(flowId: string, stepIndex: number, taskIndex: number): boolean {
  const progress = getFlowProgress(flowId)
  return progress.completedTasks[stepIndex]?.includes(taskIndex) ?? false
}

/**
 * Define a flow - helper that registers and returns the flow
 *
 * @example
 * ```tsx
 * defineFlow({
 *   id: 'order-flow',
 *   name: 'Order Placement',
 *   description: 'Complete customer order journey',
 *   appId: 'customer',
 *   steps: [
 *     { frame: onboardingFrame },
 *     { frame: loginFrame, tasks: ['Enter phone', 'Enter OTP code'] },
 *     { frame: homeFrame, tasks: ['Search restaurant', 'Select restaurant'] },
 *     { frame: menuFrame, tasks: ['Choose dish', 'Add to cart'] },
 *     { frame: orderSuccessFrame },
 *   ]
 * })
 * ```
 */
export function defineFlow(input: FlowDefinitionInput): Flow {
  const flow: Flow = {
    id: input.id,
    name: input.name,
    description: input.description,
    appId: input.appId,
    steps: input.steps,
  }
  registerFlow(flow)
  return flow
}

// Internal: notify all listeners
function notifyFlowListeners(): void {
  for (const listener of flowListeners) {
    listener()
  }
}
