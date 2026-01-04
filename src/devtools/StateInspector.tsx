import React, { useState, useMemo } from 'react'
import { useStore } from '../core/store'
import { cn, scrollbarStyles } from '../ui/utils'
import { SearchIcon, ChevronRightIcon, ChevronDownIcon, DatabaseIcon } from './icons'

export interface StateInspectorProps {
  /** Embedded mode (no positioning, used inside DevTools) */
  embedded?: boolean
  /** Initial collapsed state */
  defaultCollapsed?: boolean
  /** Position */
  position?: 'left' | 'right'
  className?: string
}

/**
 * StateInspector - Dev tool for inspecting store state
 */
export function StateInspector({
  embedded = false,
  defaultCollapsed = false,
  position = 'right',
  className,
}: StateInspectorProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const store = useStore()
  const { entities } = store

  const collections = useMemo(() => Object.keys(entities), [entities])

  const filteredEntities = useMemo(() => {
    if (!searchQuery) return entities

    const result: typeof entities = {}
    for (const [collection, items] of Object.entries(entities)) {
      const filtered: typeof items = {}
      for (const [id, item] of Object.entries(items)) {
        const str = JSON.stringify(item).toLowerCase()
        if (str.includes(searchQuery.toLowerCase())) {
          filtered[id] = item
        }
      }
      if (Object.keys(filtered).length > 0) {
        result[collection] = filtered
      }
    }
    return result
  }, [entities, searchQuery])

  const toggleCollection = (name: string) => {
    const next = new Set(expandedCollections)
    if (next.has(name)) {
      next.delete(name)
    } else {
      next.add(name)
    }
    setExpandedCollections(next)
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
        <DatabaseIcon size={14} />
        State
      </button>
    )
  }

  const content = (
    <>
      {/* Search */}
      <div className="p-2 border-b border-neutral-800/50">
        <div className="relative">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full bg-neutral-900 text-neutral-200 text-xs pl-9 pr-3 py-2 rounded-lg',
              'border border-neutral-800 placeholder-neutral-600',
              'focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700'
            )}
          />
        </div>
      </div>

      {/* Collections */}
      <div className={cn('flex-1 overflow-y-auto p-2 space-y-1', scrollbarStyles)}>
        {Object.entries(filteredEntities).map(([collection, items]) => {
          const count = Object.keys(items).length
          const isExpanded = expandedCollections.has(collection)

          return (
            <div key={collection}>
              <button
                onClick={() => toggleCollection(collection)}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left',
                  'hover:bg-neutral-800/50 transition-colors group'
                )}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDownIcon size={14} className="text-neutral-500" />
                  ) : (
                    <ChevronRightIcon size={14} className="text-neutral-500" />
                  )}
                  <span className="text-xs font-medium text-neutral-200">{collection}</span>
                </div>
                <span className="text-[10px] text-neutral-500 tabular-nums">{count}</span>
              </button>

              {isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {Object.entries(items).map(([id, item]) => (
                    <div
                      key={id}
                      className="p-2 bg-neutral-900/50 border border-neutral-800/50 rounded-lg"
                    >
                      <div className="text-[10px] text-neutral-500 font-mono mb-1 truncate">
                        {id}
                      </div>
                      <pre className="text-[10px] text-neutral-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {collections.length === 0 && (
          <div className="text-center text-neutral-600 py-8 text-xs">No data</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-neutral-800/50 text-[10px] text-neutral-600">
        {collections.length} collection{collections.length !== 1 ? 's' : ''}
      </div>
    </>
  )

  // Embedded mode - just return content
  if (embedded) {
    return <div className="flex flex-col min-h-full">{content}</div>
  }

  // Standalone mode
  return (
    <div
      className={cn(
        'fixed top-4 bottom-4 w-72 z-50 rounded-xl overflow-hidden',
        'bg-neutral-950 border border-neutral-800 shadow-2xl',
        'flex flex-col',
        position === 'right' ? 'right-4' : 'left-4',
        className
      )}
    >
      {content}
    </div>
  )
}

StateInspector.displayName = 'StateInspector'
