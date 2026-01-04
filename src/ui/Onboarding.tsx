import React, { useState, useCallback } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { Button } from './Button'
import { Text } from './Text'

export interface OnboardingSlide {
  /** Image or illustration */
  image?: React.ReactNode
  /** Image URL */
  imageUrl?: string
  /** Slide title */
  title: string
  /** Slide description */
  description?: string
  /** Custom content below description */
  content?: React.ReactNode
}

export interface OnboardingProps {
  /** Slides to display */
  slides: OnboardingSlide[]
  /** Called when onboarding is completed */
  onComplete: () => void
  /** Called when user skips */
  onSkip?: () => void
  /** Show skip button */
  showSkip?: boolean
  /** Custom "Next" button text */
  nextText?: string
  /** Custom "Get Started" button text (last slide) */
  completeText?: string
  /** Custom "Skip" button text */
  skipText?: string
  /** Auto-advance interval in ms (0 = disabled) */
  autoAdvance?: number
  className?: string
}

/**
 * Onboarding - Multi-slide onboarding component
 *
 * @example
 * ```tsx
 * <Onboarding
 *   slides={[
 *     {
 *       imageUrl: '/onboarding-1.png',
 *       title: 'Welcome to App',
 *       description: 'Discover amazing features',
 *     },
 *     {
 *       image: <WelcomeIllustration />,
 *       title: 'Fast Delivery',
 *       description: 'Get your order in 30 minutes',
 *     },
 *     {
 *       title: 'Track in Real-time',
 *       description: 'See your courier on the map',
 *     },
 *   ]}
 *   onComplete={() => navigate('home')}
 *   onSkip={() => navigate('home')}
 * />
 * ```
 */
export function Onboarding({
  slides,
  onComplete,
  onSkip,
  showSkip = true,
  nextText = 'Next',
  completeText = 'Get Started',
  skipText = 'Skip',
  autoAdvance = 0,
  className,
}: OnboardingProps) {
  const { colors, platform } = useTheme()
  const isIOS = platform === 'ios'
  const [currentIndex, setCurrentIndex] = useState(0)

  const isLastSlide = currentIndex === slides.length - 1
  const currentSlide = slides[currentIndex]

  const goNext = useCallback(() => {
    if (isLastSlide) {
      onComplete()
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [isLastSlide, onComplete])

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip()
    } else {
      onComplete()
    }
  }, [onSkip, onComplete])

  // Auto-advance
  React.useEffect(() => {
    if (autoAdvance > 0 && !isLastSlide) {
      const timer = setTimeout(goNext, autoAdvance)
      return () => clearTimeout(timer)
    }
  }, [autoAdvance, isLastSlide, goNext, currentIndex])

  return (
    <div
      className={cn('flex flex-col h-full', className)}
      style={{ backgroundColor: colors.surface }}
    >
      {/* Skip button */}
      {showSkip && !isLastSlide && (
        <div className="absolute top-safe-top right-4 pt-4 z-10">
          <button
            onClick={handleSkip}
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ color: colors.textSecondary }}
          >
            {skipText}
          </button>
        </div>
      )}

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Image */}
        {(currentSlide.image || currentSlide.imageUrl) && (
          <div className="mb-8 w-full max-w-xs aspect-square flex items-center justify-center">
            {currentSlide.image ? (
              currentSlide.image
            ) : currentSlide.imageUrl ? (
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
        )}

        {/* Title */}
        <Text
          size="2xl"
          bold
          center
          className="mb-3"
        >
          {currentSlide.title}
        </Text>

        {/* Description */}
        {currentSlide.description && (
          <Text
            secondary
            center
            className="max-w-sm"
          >
            {currentSlide.description}
          </Text>
        )}

        {/* Custom content */}
        {currentSlide.content && (
          <div className="mt-6 w-full">
            {currentSlide.content}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-safe-bottom pb-8">
        {/* Dots indicator */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'transition-all duration-300',
                  isIOS ? 'rounded-full' : 'rounded'
                )}
                style={{
                  width: index === currentIndex ? 24 : 8,
                  height: 8,
                  backgroundColor: index === currentIndex
                    ? colors.primary
                    : colors.surfaceSecondary,
                }}
              />
            ))}
          </div>
        )}

        {/* Action button */}
        <Button
          fullWidth
          size="lg"
          onClick={goNext}
        >
          {isLastSlide ? completeText : nextText}
        </Button>
      </div>
    </div>
  )
}

Onboarding.displayName = 'Onboarding'
