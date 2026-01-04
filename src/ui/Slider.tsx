import React, { useRef, useState, useCallback } from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** Show value label */
  showValue?: boolean
  /** Left label */
  leftLabel?: React.ReactNode
  /** Right label */
  rightLabel?: React.ReactNode
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  leftLabel,
  rightLabel,
  className,
}: SliderProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value

      const rect = trackRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percent * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, steppedValue))
    },
    [min, max, step, value]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDragging(true)
    onChange(calculateValue(e.clientX))

    const handleMouseMove = (e: MouseEvent) => {
      onChange(calculateValue(e.clientX))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    setIsDragging(true)
    onChange(calculateValue(e.touches[0].clientX))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging) return
    onChange(calculateValue(e.touches[0].clientX))
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {leftLabel && (
        <span className="shrink-0 text-sm" style={{ color: colors.textSecondary }}>
          {leftLabel}
        </span>
      )}

      <div
        ref={trackRef}
        className={cn(
          'relative flex-1 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ height: isIOS ? 28 : 40 }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track background */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
          style={{
            height: isIOS ? 4 : 4,
            backgroundColor: colors.border,
          }}
        />

        {/* Track fill */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
          style={{
            height: isIOS ? 4 : 4,
            width: `${percentage}%`,
            backgroundColor: disabled ? colors.textSecondary : colors.primary,
          }}
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md transition-transform',
            isDragging && 'scale-110'
          )}
          style={{
            left: `${percentage}%`,
            width: isIOS ? 28 : 20,
            height: isIOS ? 28 : 20,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />

        {/* Value tooltip */}
        {showValue && isDragging && (
          <div
            className="absolute -top-8 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium"
            style={{
              left: `${percentage}%`,
              backgroundColor: colors.primary,
              color: '#FFFFFF',
            }}
          >
            {value}
          </div>
        )}
      </div>

      {rightLabel && (
        <span className="shrink-0 text-sm" style={{ color: colors.textSecondary }}>
          {rightLabel}
        </span>
      )}
    </div>
  )
}

Slider.displayName = 'Slider'
