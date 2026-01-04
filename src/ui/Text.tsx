import React from 'react'
import { useTheme } from './theme'
import { cn } from './utils'

export interface TextProps {
  children: React.ReactNode
  className?: string

  // Color variants (mutually exclusive)
  secondary?: boolean
  primary?: boolean
  success?: boolean
  warning?: boolean
  danger?: boolean
  muted?: boolean

  // Size variants
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  // Weight
  bold?: boolean
  semibold?: boolean
  medium?: boolean
  light?: boolean

  // Alignment
  center?: boolean
  right?: boolean

  // Display
  block?: boolean

  // Semantic element
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'div'

  // Custom style override
  style?: React.CSSProperties
}

/**
 * Text - Typography component with automatic theme colors
 *
 * @example
 * ```tsx
 * <Text>Default text (uses colors.text)</Text>
 * <Text secondary>Secondary text</Text>
 * <Text primary bold>Primary bold text</Text>
 * <Text size="lg" semibold>Large semibold</Text>
 * <Text danger>Error message</Text>
 * ```
 */
export function Text({
  children,
  className,
  secondary,
  primary,
  success,
  warning,
  danger,
  muted,
  size = 'md',
  bold,
  semibold,
  medium,
  light,
  center,
  right,
  block,
  as: Component = 'span',
  style,
}: TextProps) {
  const { colors } = useTheme()

  // Determine color (can be overridden by style.color)
  let color = colors.text
  if (secondary || muted) color = colors.textSecondary
  if (primary) color = colors.primary
  if (success) color = colors.success
  if (warning) color = '#FF9500' // iOS warning orange
  if (danger) color = colors.danger

  // Size classes
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }

  // Weight classes
  let weightClass = ''
  if (bold) weightClass = 'font-bold'
  else if (semibold) weightClass = 'font-semibold'
  else if (medium) weightClass = 'font-medium'
  else if (light) weightClass = 'font-light'

  // Alignment
  let alignClass = ''
  if (center) alignClass = 'text-center'
  else if (right) alignClass = 'text-right'

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClass,
        alignClass,
        block && 'block',
        className
      )}
      style={{ color, ...style }}
    >
      {children}
    </Component>
  )
}

// Shorthand components for common use cases
export function Title({ children, className, ...props }: Omit<TextProps, 'size' | 'bold' | 'as'>) {
  return (
    <Text as="h2" size="xl" bold className={className} {...props}>
      {children}
    </Text>
  )
}

export function Subtitle({ children, className, ...props }: Omit<TextProps, 'size' | 'as'>) {
  return (
    <Text as="h3" size="lg" semibold className={className} {...props}>
      {children}
    </Text>
  )
}

export function Caption({ children, className, ...props }: Omit<TextProps, 'size'>) {
  return (
    <Text size="xs" secondary className={className} {...props}>
      {children}
    </Text>
  )
}

export function Label({ children, className, ...props }: Omit<TextProps, 'as' | 'size'>) {
  return (
    <Text as="label" size="sm" medium className={className} {...props}>
      {children}
    </Text>
  )
}
