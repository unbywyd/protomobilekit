import { useState, useEffect } from 'react'
import {
  getDirectScreen,
  subscribeDirectScreen,
  parseDirectScreenFromURL,
  setDirectScreen,
  type DirectScreen,
} from './screenRegistry'

/**
 * Hook to access direct screen state
 * Returns the current direct screen (if any) for a specific app
 */
export function useDirectScreen(appId?: string) {
  const [directScreen, setLocalDirectScreen] = useState<DirectScreen | null>(() => {
    // Check URL on mount
    const fromURL = parseDirectScreenFromURL()
    if (fromURL) {
      // Set global state from URL
      setDirectScreen(fromURL)
      return fromURL
    }
    return getDirectScreen()
  })

  useEffect(() => {
    // Listen to URL changes
    const handlePopState = () => {
      const fromURL = parseDirectScreenFromURL()
      setDirectScreen(fromURL)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    return subscribeDirectScreen(() => {
      setLocalDirectScreen(getDirectScreen())
    })
  }, [])

  // If appId specified, only return if matches
  if (appId && directScreen && directScreen.appId !== appId) {
    return null
  }

  return directScreen
}
