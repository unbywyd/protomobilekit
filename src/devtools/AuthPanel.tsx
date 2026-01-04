import React, { useState, useEffect, useMemo } from 'react'
import { cn, scrollbarStyles } from '../ui/utils'
import { getAllAppUsers, getAppRoles, subscribeRegistry, type TestUser } from '../auth/registry'
import { getAllSessions, subscribeToSessions } from '../auth/store'
import { quickSwitch, quickLogout } from '../auth/quickSwitch'
import { ChevronRightIcon, ChevronDownIcon, UsersIcon, LogoutIcon, CopyIcon } from './icons'

export interface AuthPanelProps {
  /** Embedded mode (no positioning, used inside DevTools) */
  embedded?: boolean
  /** Initial collapsed state */
  defaultCollapsed?: boolean
  /** Position */
  position?: 'left' | 'right'
  className?: string
}

/**
 * AuthPanel - DevTools panel for managing test users and sessions
 * Combined view: shows test users with quick switch and logout
 */
export function AuthPanel({
  embedded = false,
  defaultCollapsed = false,
  position = 'right',
  className,
}: AuthPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set())
  const [, forceUpdate] = useState({})

  // Subscribe to registry and session changes
  useEffect(() => {
    const unsubRegistry = subscribeRegistry(() => forceUpdate({}))
    const unsubSessions = subscribeToSessions(() => forceUpdate({}))

    return () => {
      unsubRegistry()
      unsubSessions()
    }
  }, [])

  // Get all registered users
  const appUsers = useMemo(() => getAllAppUsers(), [])

  const toggleApp = (appId: string) => {
    const next = new Set(expandedApps)
    if (next.has(appId)) {
      next.delete(appId)
    } else {
      next.add(appId)
    }
    setExpandedApps(next)
  }

  const handleQuickSwitch = (appId: string, userId: string, isActive: boolean) => {
    if (isActive) {
      // Click on active user = logout
      quickLogout(appId)
    } else {
      quickSwitch(appId, userId)
    }
    forceUpdate({})
  }

  // Standalone collapsed button
  if (!embedded && collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={cn(
          'fixed top-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-neutral-900 border border-neutral-800 text-neutral-300',
          'hover:bg-neutral-800 hover:text-white transition-all',
          'text-xs font-medium shadow-xl',
          position === 'right' ? 'right-4' : 'left-4',
          className
        )}
      >
        <UsersIcon size={14} />
        Auth
      </button>
    )
  }

  const content = (
    <div className={cn('flex-1 overflow-y-auto', scrollbarStyles)}>
      <TestUsersSection
        appUsers={appUsers}
        expandedApps={expandedApps}
        onToggleApp={toggleApp}
        onQuickSwitch={handleQuickSwitch}
      />
    </div>
  )

  if (embedded) {
    return <div className={cn('flex flex-col min-h-full', className)}>{content}</div>
  }

  // Standalone mode
  return (
    <div
      className={cn(
        'fixed top-4 bottom-4 w-72 z-50',
        'bg-neutral-950 border border-neutral-800 rounded-xl',
        'flex flex-col shadow-2xl',
        position === 'right' ? 'right-4' : 'left-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-200">
          <UsersIcon size={14} />
          Auth Panel
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
      {content}
    </div>
  )
}

AuthPanel.displayName = 'AuthPanel'

// Test Users Section
interface TestUsersSectionProps {
  appUsers: Map<string, { appId: string; users: TestUser[] }>
  expandedApps: Set<string>
  onToggleApp: (appId: string) => void
  onQuickSwitch: (appId: string, userId: string, isActive: boolean) => void
}

function TestUsersSection({
  appUsers,
  expandedApps,
  onToggleApp,
  onQuickSwitch,
}: TestUsersSectionProps) {
  const sessions = getAllSessions()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyPhone = async (e: React.MouseEvent, user: TestUser) => {
    e.stopPropagation()
    const phone = user.phone || user.email
    if (!phone) return

    try {
      await navigator.clipboard.writeText(phone)
      setCopiedId(user.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (appUsers.size === 0) {
    return (
      <div className="p-4 text-xs text-neutral-500 text-center">
        No test users defined.
        <br />
        <span className="text-neutral-600">Use defineUsers() to add test users.</span>
      </div>
    )
  }

  return (
    <div className="p-2">
      {Array.from(appUsers.entries()).map(([appId, { users }]) => {
        const isExpanded = expandedApps.has(appId)
        const session = sessions.find((s) => s.namespace === appId)
        const currentUserId = session?.user?.id
        const roles = getAppRoles(appId)

        return (
          <div key={appId} className="mb-2">
            {/* App Header */}
            <button
              onClick={() => onToggleApp(appId)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded',
                'text-xs font-medium text-neutral-300',
                'hover:bg-neutral-800/50 transition-colors'
              )}
            >
              {isExpanded ? (
                <ChevronDownIcon size={12} />
              ) : (
                <ChevronRightIcon size={12} />
              )}
              <span className="capitalize">{appId}</span>
              <span className="text-neutral-500 ml-auto">{users.length}</span>
            </button>

            {/* Users List */}
            {isExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {users.map((user) => {
                  const isActive = currentUserId === user.id
                  const role = roles.find((r) => r.value === user.role)
                  const contactInfo = user.phone || user.email
                  const isCopied = copiedId === user.id

                  return (
                    <div
                      key={user.id}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded',
                        'text-xs transition-colors',
                        isActive
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'hover:bg-neutral-800/50 text-neutral-300'
                      )}
                    >
                      {/* Clickable user area */}
                      <button
                        onClick={() => onQuickSwitch(appId, user.id, isActive)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        title={isActive ? 'Click to logout' : 'Click to login'}
                      >
                        {/* Avatar */}
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] font-medium shrink-0">
                            {(user.name || user.id).charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="truncate font-medium text-left">
                            {user.name || user.id}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {role && (
                              <span
                                className="text-[10px] truncate"
                                style={{ color: role.color || '#a1a1aa' }}
                              >
                                {role.label}
                              </span>
                            )}
                            {role && contactInfo && (
                              <span className="text-neutral-600">•</span>
                            )}
                            {contactInfo && (
                              <span className="text-[10px] text-neutral-500 truncate">
                                {contactInfo}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Active indicator / logout hint */}
                        {isActive && (
                          <LogoutIcon size={12} className="text-blue-400 shrink-0" />
                        )}
                      </button>

                      {/* Copy button */}
                      {contactInfo && (
                        <button
                          onClick={(e) => handleCopyPhone(e, user)}
                          className={cn(
                            'p-1 rounded transition-colors shrink-0',
                            isCopied
                              ? 'text-green-400'
                              : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/50'
                          )}
                          title={isCopied ? 'Copied!' : `Copy ${user.phone ? 'phone' : 'email'}`}
                        >
                          {isCopied ? (
                            <svg width={12} height={12} viewBox="0 0 16 16" fill="none">
                              <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <CopyIcon size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

