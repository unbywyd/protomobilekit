import type { MobileKitConfig, Entity } from './types'

let globalConfig: MobileKitConfig = {}

// Define config
export function defineConfig(config: MobileKitConfig): MobileKitConfig {
  globalConfig = config
  return config
}

// Get current config
export function getConfig(): MobileKitConfig {
  return globalConfig
}

// Default localStorage sync methods
export const defaultOnPull = async (): Promise<Record<string, Record<string, Entity>>> => {
  // Default: read from localStorage (already handled by zustand persist)
  // Return empty object since zustand handles this automatically
  return {}
}

export const defaultOnPush = async (_data: Record<string, Record<string, Entity>>): Promise<void> => {
  // Default: zustand persist already saves to localStorage
  // This is a no-op by default
}
