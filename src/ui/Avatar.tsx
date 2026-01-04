import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface AvatarProps {
  src?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show online/offline status */
  status?: 'online' | 'offline' | 'away' | 'busy'
  className?: string
}

export function Avatar({
  src,
  name,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const { platform, colors } = useTheme()
  const isIOS = platform === 'ios'

  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  }

  const fontSizeMap = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 20,
    xl: 28,
  }

  const statusSizeMap = {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 14,
    xl: 18,
  }

  const actualSize = sizeMap[size]
  const fontSize = fontSizeMap[size]
  const statusSize = statusSizeMap[size]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#34C759'
      case 'offline': return '#8E8E93'
      case 'away': return '#FF9500'
      case 'busy': return '#FF3B30'
      default: return undefined
    }
  }

  // Generate consistent color from name
  const getBackgroundColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div
      className={cn('relative inline-flex items-center justify-center shrink-0', className)}
      style={{
        width: actualSize,
        height: actualSize,
        borderRadius: isIOS ? actualSize / 2 : actualSize * 0.4,
        backgroundColor: src ? colors.surfaceSecondary : name ? getBackgroundColor(name) : colors.textSecondary,
        overflow: 'hidden',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : name ? (
        <span
          className="font-medium text-white"
          style={{ fontSize }}
        >
          {getInitials(name)}
        </span>
      ) : (
        // Default user icon
        <svg
          width={actualSize * 0.6}
          height={actualSize * 0.6}
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}

      {/* Status indicator */}
      {status && (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2"
          style={{
            width: statusSize,
            height: statusSize,
            backgroundColor: getStatusColor(),
            borderColor: colors.surface,
          }}
        />
      )}
    </div>
  )
}

Avatar.displayName = 'Avatar'

// Avatar group
export interface AvatarGroupProps {
  avatars: Array<{ src?: string; name?: string }>
  max?: number
  size?: AvatarProps['size']
  className?: string
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const { colors } = useTheme()

  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  }

  const actualSize = sizeMap[size]
  const overlap = actualSize * 0.3

  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((avatar, index) => (
        <div
          key={index}
          style={{
            marginLeft: index > 0 ? -overlap : 0,
            zIndex: visible.length - index,
          }}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            size={size}
            className="ring-2 ring-white"
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="flex items-center justify-center rounded-full ring-2 ring-white"
          style={{
            width: actualSize,
            height: actualSize,
            marginLeft: -overlap,
            backgroundColor: colors.surfaceSecondary,
            zIndex: 0,
          }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: colors.textSecondary }}
          >
            +{remaining}
          </span>
        </div>
      )}
    </div>
  )
}

AvatarGroup.displayName = 'AvatarGroup'
