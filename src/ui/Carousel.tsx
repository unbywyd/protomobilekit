import React, { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface CarouselItem {
  /** Unique key */
  key: string
  /** Content to render */
  content: React.ReactNode
}

export interface CarouselProps {
  /** Items to display */
  items: CarouselItem[]
  /** Auto-play interval in ms (0 to disable) */
  autoPlay?: number
  /** Show dots indicator */
  showDots?: boolean
  /** Gap between items in px */
  gap?: number
  /** Item width (px, % or 'full') */
  itemWidth?: number | string
  /** Peek amount for next/prev items in px */
  peek?: number
  /** Enable infinite loop */
  loop?: boolean
  /** On slide change callback */
  onSlideChange?: (index: number) => void
  className?: string
}

/**
 * Carousel - Seamless swipeable carousel for cards
 *
 * @example
 * ```tsx
 * <Carousel
 *   items={[
 *     { key: '1', content: <Card>Slide 1</Card> },
 *     { key: '2', content: <Card>Slide 2</Card> },
 *     { key: '3', content: <Card>Slide 3</Card> },
 *   ]}
 *   autoPlay={3000}
 *   showDots
 *   peek={20}
 * />
 * ```
 */
export function Carousel({
  items,
  autoPlay = 0,
  showDots = true,
  gap = 12,
  itemWidth = 'full',
  peek = 0,
  loop = false,
  onSlideChange,
  className,
}: CarouselProps) {
  const { colors, platform } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const itemCount = items.length

  // Calculate item width
  const getItemWidth = useCallback(() => {
    if (!containerRef.current) return 0
    const containerWidth = containerRef.current.offsetWidth

    if (itemWidth === 'full') {
      return containerWidth - peek * 2
    }
    if (typeof itemWidth === 'number') {
      return itemWidth
    }
    // Percentage
    const percent = parseFloat(itemWidth) / 100
    return containerWidth * percent - peek * 2
  }, [itemWidth, peek])

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number, smooth = true) => {
    if (!trackRef.current || !containerRef.current) return

    const width = getItemWidth()
    const scrollPosition = index * (width + gap) - peek

    trackRef.current.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [getItemWidth, gap, peek])

  // Handle scroll end to update current index
  const handleScroll = useCallback(() => {
    if (!trackRef.current || isDragging) return

    const width = getItemWidth()
    const scrollPos = trackRef.current.scrollLeft + peek
    const newIndex = Math.round(scrollPos / (width + gap))
    const clampedIndex = Math.max(0, Math.min(newIndex, itemCount - 1))

    if (clampedIndex !== currentIndex) {
      setCurrentIndex(clampedIndex)
      onSlideChange?.(clampedIndex)
    }
  }, [getItemWidth, gap, peek, currentIndex, itemCount, isDragging, onSlideChange])

  // Mouse/touch drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!trackRef.current) return
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartX(clientX)
    setScrollLeft(trackRef.current.scrollLeft)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !trackRef.current) return
    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const delta = startX - clientX
    trackRef.current.scrollLeft = scrollLeft + delta
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    // Snap to nearest item
    if (!trackRef.current) return
    const width = getItemWidth()
    const scrollPos = trackRef.current.scrollLeft + peek
    const targetIndex = Math.round(scrollPos / (width + gap))
    const clampedIndex = Math.max(0, Math.min(targetIndex, itemCount - 1))

    scrollToIndex(clampedIndex)
  }

  // Auto-play
  useEffect(() => {
    if (autoPlay <= 0 || itemCount <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next >= itemCount) {
          if (loop) {
            scrollToIndex(0)
            return 0
          }
          return prev
        }
        scrollToIndex(next)
        return next
      })
    }, autoPlay)

    return () => clearInterval(interval)
  }, [autoPlay, itemCount, loop, scrollToIndex])

  // Debounced scroll handler
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let scrollTimeout: ReturnType<typeof setTimeout>
    const onScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 50)
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', onScroll)
      clearTimeout(scrollTimeout)
    }
  }, [handleScroll])

  // Go to specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    scrollToIndex(index)
    onSlideChange?.(index)
  }

  const calculatedItemWidth = getItemWidth()

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Track */}
      <div
        ref={trackRef}
        className={cn(
          'flex overflow-x-auto scrollbar-hide',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{
          scrollSnapType: isDragging ? 'none' : 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: peek,
          paddingRight: peek,
          gap,
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            className="shrink-0"
            style={{
              width: itemWidth === 'full' ? `calc(100% - ${peek * 2}px)` : calculatedItemWidth,
              scrollSnapAlign: 'center',
            }}
          >
            {item.content}
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {showDots && itemCount > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'rounded-full transition-all duration-200',
                index === currentIndex ? 'w-6 h-2' : 'w-2 h-2'
              )}
              style={{
                backgroundColor: index === currentIndex ? colors.primary : colors.border,
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

Carousel.displayName = 'Carousel'
