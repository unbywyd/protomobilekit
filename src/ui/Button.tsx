import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Full width button */
  fullWidth?: boolean
  /** Loading state */
  loading?: boolean
  /** Left icon */
  icon?: React.ReactNode
  /** Right icon */
  iconRight?: React.ReactNode
}

/**
 * Button - Interactive button component (iOS/Android adaptive)
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconRight,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: '#FFFFFF',
        }
      case 'secondary':
        return {
          backgroundColor: colors.surfaceSecondary,
          color: colors.text,
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          borderWidth: 1,
          borderColor: colors.primary,
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
        }
      case 'danger':
        return {
          backgroundColor: colors.danger,
          color: '#FFFFFF',
        }
      case 'link':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
        }
    }
  }

  const getSizeStyles = () => {
    if (variant === 'link') {
      return {
        height: 'auto',
        padding: '0',
        fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      }
    }

    switch (size) {
      case 'sm':
        return {
          height: isIOS ? 32 : 36,
          paddingHorizontal: 12,
          fontSize: 14,
          borderRadius: isIOS ? 8 : 18,
        }
      case 'lg':
        return {
          height: isIOS ? 50 : 48,
          paddingHorizontal: 24,
          fontSize: 17,
          borderRadius: isIOS ? 12 : 24,
        }
      default:
        return {
          height: isIOS ? 44 : 40,
          paddingHorizontal: 16,
          fontSize: 16,
          borderRadius: isIOS ? 10 : 20,
        }
    }
  }

  const styles = getStyles()
  const sizeStyles = getSizeStyles()

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all',
        'active:opacity-70',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth && 'w-full',
        variant === 'link' && 'underline-offset-2 hover:underline',
        className
      )}
      style={{
        ...styles,
        height: sizeStyles.height,
        paddingLeft: sizeStyles.paddingHorizontal,
        paddingRight: sizeStyles.paddingHorizontal,
        fontSize: sizeStyles.fontSize,
        borderRadius: sizeStyles.borderRadius,
        fontWeight: isIOS ? '600' : '500',
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color={styles.color as string} className="mr-2" />
      ) : icon ? (
        <span className="mr-2 shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="ml-2 shrink-0">{iconRight}</span>
      )}
    </button>
  )
}

Button.displayName = 'Button'

// Text button for iOS style
export interface TextButtonProps {
  children: React.ReactNode
  onPress: () => void
  color?: 'primary' | 'danger' | 'secondary'
  disabled?: boolean
  className?: string
}

export function TextButton({
  children,
  onPress,
  color = 'primary',
  disabled = false,
  className,
}: TextButtonProps) {
  const { colors } = useTheme()

  const getColor = () => {
    switch (color) {
      case 'danger': return colors.danger
      case 'secondary': return colors.textSecondary
      default: return colors.primary
    }
  }

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        'text-[17px] font-normal transition-opacity',
        'active:opacity-50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      style={{ color: getColor() }}
    >
      {children}
    </button>
  )
}

TextButton.displayName = 'TextButton'

// Icon-only button (circular)
export interface IconButtonProps {
  icon: React.ReactNode
  onPress: () => void
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  className?: string
}

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  className,
}: IconButtonProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const sizeMap = {
    sm: { button: 32, icon: 16 },
    md: { button: 44, icon: 20 },
    lg: { button: 56, icon: 24 },
  }

  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: '#FFFFFF',
        }
      case 'secondary':
        return {
          backgroundColor: colors.surfaceSecondary,
          color: colors.text,
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.primary,
          borderWidth: 1,
          borderColor: colors.primary,
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.textSecondary,
        }
      case 'danger':
        return {
          backgroundColor: colors.danger,
          color: '#FFFFFF',
        }
    }
  }

  const { button: buttonSize, icon: iconSize } = sizeMap[size]
  const styles = getStyles()

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center transition-all',
        'active:opacity-70',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isIOS ? 'rounded-full' : 'rounded-full',
        className
      )}
      style={{
        ...styles,
        width: buttonSize,
        height: buttonSize,
      }}
    >
      {loading ? (
        <Spinner size="sm" color={styles.color as string} />
      ) : (
        <span style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center">
          {icon}
        </span>
      )}
    </button>
  )
}

IconButton.displayName = 'IconButton'
