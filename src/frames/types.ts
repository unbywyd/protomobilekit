import type { ComponentType, ReactNode } from 'react'

/**
 * Navigation actions passed to frame onNavigate handler
 */
export interface FrameNavigationActions {
  navigate: <P extends Record<string, any>>(name: string, params?: P) => void
  goBack: () => void
  replace: <P extends Record<string, any>>(name: string, params?: P) => void
  reset: (name?: string) => void
}

/**
 * Navigation handler - receives navigator actions for the app
 */
export type FrameNavigateHandler = (nav: FrameNavigationActions) => void

/**
 * Frame - A single screen/page in an app
 * Similar to Figma frames - each has a number, name, and description
 */
export interface Frame {
  /** Unique ID within the app (used for navigation) */
  id: string
  /** Display name with number, e.g. "1.1 Home" */
  name: string
  /** Brief description of what this screen does */
  description?: string
  /** The screen component (optional for screens registered via defineScreen) */
  component?: ComponentType<any>
  /** Tags for filtering/grouping */
  tags?: string[]
  /** Default params for direct rendering (e.g. { id: 'r1' }) */
  params?: Record<string, unknown>
  /** Custom navigation handler - called on click instead of default navigation */
  onNavigate?: FrameNavigateHandler
}

/**
 * App with registered frames
 */
export interface AppFrames {
  /** App ID */
  appId: string
  /** App display name */
  appName: string
  /** All frames in this app */
  frames: Frame[]
  /** Initial frame ID */
  initial: string
}

/**
 * Frame registry state
 */
export interface FrameRegistryState {
  /** All registered apps with their frames */
  apps: Map<string, AppFrames>
}

/**
 * Frame navigation request
 */
export interface FrameNavigationRequest {
  appId: string
  frameId: string
}

/**
 * Input for defineFrames helper
 */
export interface FrameDefinitionInput {
  /** App ID (must match app in Canvas) */
  appId: string
  /** App display name */
  appName: string
  /** Initial frame ID */
  initial: string
  /** Frame definitions */
  frames: Frame[]
}

/**
 * Input for createFrame helper (without component for typing)
 */
export interface FrameInput {
  /** Unique ID within the app (used for navigation) */
  id: string
  /** Display name with number, e.g. "1.1 Home" */
  name: string
  /** Brief description of what this screen does */
  description?: string
  /** The screen component (optional for screens registered via defineScreen) */
  component?: ComponentType<any>
  /** Tags for filtering/grouping */
  tags?: string[]
  /** Default params for direct rendering (e.g. { id: 'r1' }) */
  params?: Record<string, unknown>
  /** Custom navigation handler - called on click instead of default navigation */
  onNavigate?: FrameNavigateHandler
}

/**
 * Flow step - a frame with optional tasks
 */
export interface FlowStep {
  /** Frame object (from createFrame) */
  frame: Frame
  /** Optional subtasks to complete on this frame */
  tasks?: string[]
}

/**
 * Flow definition
 */
export interface Flow {
  /** Unique flow ID */
  id: string
  /** Flow display name */
  name: string
  /** Description of what this flow demonstrates */
  description?: string
  /** App ID this flow belongs to */
  appId: string
  /** Steps in the flow */
  steps: FlowStep[]
}

/**
 * Input for defineFlow helper
 */
export interface FlowDefinitionInput {
  /** Unique flow ID */
  id: string
  /** Flow display name */
  name: string
  /** Description of what this flow demonstrates */
  description?: string
  /** App ID this flow belongs to */
  appId: string
  /** Steps in the flow */
  steps: FlowStep[]
}

/**
 * Flow progress state (stored in localStorage)
 */
export interface FlowProgress {
  /** Flow ID */
  flowId: string
  /** Completed step indices */
  completedSteps: number[]
  /** Completed task indices per step: { stepIndex: taskIndices[] } */
  completedTasks: Record<number, number[]>
}
