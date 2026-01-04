import { useState, useEffect, useCallback } from 'react'
import {
  getAllApps,
  getAppFrames,
  getFrame,
  getFrameCount,
  searchFrames,
  navigateToFrame,
  subscribe,
} from './registry'
import type { AppFrames, Frame } from './types'

/**
 * useFrameRegistry - Access all registered frames
 */
export function useFrameRegistry() {
  const [apps, setApps] = useState<AppFrames[]>(getAllApps)
  const [frameCount, setFrameCount] = useState<number>(getFrameCount)

  useEffect(() => {
    const update = () => {
      setApps(getAllApps())
      setFrameCount(getFrameCount())
    }
    return subscribe(update)
  }, [])

  const search = useCallback((query: string) => {
    return searchFrames(query)
  }, [])

  const goToFrame = useCallback((appId: string, frameId: string) => {
    navigateToFrame(appId, frameId)
  }, [])

  return {
    apps,
    frameCount,
    search,
    goToFrame,
  }
}

/**
 * useAppFrames - Get frames for a specific app
 */
export function useAppFrames(appId: string) {
  const [appFrames, setAppFrames] = useState<AppFrames | undefined>(() => getAppFrames(appId))

  useEffect(() => {
    const update = () => {
      setAppFrames(getAppFrames(appId))
    }
    return subscribe(update)
  }, [appId])

  return appFrames
}

/**
 * useFrame - Get a specific frame
 */
export function useFrame(appId: string, frameId: string) {
  const [frame, setFrame] = useState<Frame | undefined>(() => getFrame(appId, frameId))

  useEffect(() => {
    const update = () => {
      setFrame(getFrame(appId, frameId))
    }
    return subscribe(update)
  }, [appId, frameId])

  return frame
}
