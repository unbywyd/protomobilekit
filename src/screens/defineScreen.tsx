import React from 'react'
import type { ComponentType } from 'react'
import { useResolverContext } from './useResolverContext'
import { ScreenError } from './ScreenError'
import { useNavigate } from '../navigation/Navigator'
import { registerScreenV2 } from '../canvas/screenRegistry'
import type { ScreenConfig, ViewModel } from './types'

/**
 * Define and register a screen
 * Returns a React component that can be used in Navigator.Screen
 *
 * @example
 * const RestaurantScreen = defineScreen({
 *   appId: 'customer',
 *   name: 'restaurant',
 *   View: RestaurantView,
 *   useCase: useRestaurantCase,
 *   resolveParams: resolveRestaurantParams,
 *   paramsCodec: restaurantParamsCodec,
 * })
 *
 * // Usage in Navigator:
 * <Navigator.Screen name="restaurant" component={RestaurantScreen} />
 */
export function defineScreen<P, VM extends ViewModel>(
  config: ScreenConfig<P, VM>
): ComponentType<{ params?: Record<string, unknown> }> & { _screenConfig: ScreenConfig<P, VM> } {
  // Register in registry (for DevTools, frames, etc.)
  registerScreenV2(config)

  // Create wrapper component that renders the screen
  function ScreenWrapper({
    params = {},
  }: {
    params?: Record<string, unknown>
  }) {
    const ctx = useResolverContext()
    const { goBack } = useNavigate()

    // 1. Coerce params (from URL strings to typed values)
    const typedParams = config.paramsCodec
      ? config.paramsCodec.coerce(params)
      : params

    // 2. Resolve params (fill defaults, validate)
    const resolved = config.resolveParams
      ? config.resolveParams(typedParams as Partial<P>, ctx)
      : { ok: true as const, params: typedParams as P }

    // 3. Error state
    if (!resolved.ok) {
      return (
        <ScreenError
          reason={resolved.reason}
          debug={resolved.debug}
          onGoBack={goBack}
        />
      )
    }

    // 4. useCase + View
    const vm = config.useCase(resolved.params)
    const View = config.View
    return <View vm={vm} />
  }

  // Set display name for debugging
  ScreenWrapper.displayName = `Screen(${config.name})`

  // Attach config for potential access
  const result = ScreenWrapper as ComponentType<{ params?: Record<string, unknown> }> & { _screenConfig: ScreenConfig<P, VM> }
  ;(result as any)._screenConfig = config

  return result
}
