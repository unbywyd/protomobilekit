import React, { useState, useMemo } from 'react'
import { useQuery } from '../core'
import { Screen, ScrollView } from './Screen'
import { Header, BackButton } from './Header'
import { SearchBar } from './SearchBar'
import { Text } from './Text'
import { useNavigate } from '../navigation/Navigator'
import type { Entity } from '../core'

export interface QueryListProps<T extends Entity> {
  /** Screen title */
  title: string
  /** Entity collection name */
  collection: string
  /** Fields to search in (will match if any field contains search term) */
  searchFields?: (keyof T)[]
  /** Custom filter function */
  filter?: (item: T) => boolean
  /** Sort function */
  sort?: (a: T, b: T) => number
  /** Text to show when list is empty */
  emptyText?: string
  /** Text to show when search has no results */
  noResultsText?: string
  /** Search placeholder */
  searchPlaceholder?: string
  /** Render each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Key extractor (defaults to item.id) */
  keyExtractor?: (item: T) => string
  /** Show back button */
  showBack?: boolean
  /** Header right content */
  headerRight?: React.ReactNode
  /** Content before list */
  header?: React.ReactNode
  /** Content after list */
  footer?: React.ReactNode
  /** Show search bar (default true if searchFields provided) */
  showSearch?: boolean
  /** Padding for scroll view */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Gap between items */
  gap?: number
}

/**
 * QueryList - A complete list screen with search, empty state, and data fetching
 *
 * @example
 * ```tsx
 * <QueryList<Order>
 *   title="Orders"
 *   collection="Order"
 *   searchFields={['address', 'status']}
 *   emptyText="No orders yet"
 *   renderItem={(order) => (
 *     <Card key={order.id}>
 *       <Text>{order.address}</Text>
 *     </Card>
 *   )}
 * />
 * ```
 */
export function QueryList<T extends Entity>({
  title,
  collection,
  searchFields = [],
  filter,
  sort,
  emptyText = 'No items',
  noResultsText = 'No results found',
  searchPlaceholder = 'Search...',
  renderItem,
  keyExtractor = (item) => item.id,
  showBack = false,
  headerRight,
  header,
  footer,
  showSearch,
  padding = 'md',
  gap = 12,
}: QueryListProps<T>) {
  const { goBack } = useNavigate()
  const [search, setSearch] = useState('')

  const { items } = useQuery<T>(collection, { filter, sort })

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim() || searchFields.length === 0) return items

    const searchLower = search.toLowerCase()
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower)
        }
        if (typeof value === 'number') {
          return String(value).includes(searchLower)
        }
        return false
      })
    )
  }, [items, search, searchFields])

  const shouldShowSearch = showSearch ?? searchFields.length > 0
  const isEmpty = items.length === 0
  const hasNoResults = !isEmpty && filtered.length === 0

  return (
    <Screen
      header={
        <Header
          title={title}
          left={showBack ? <BackButton onPress={goBack} /> : undefined}
          right={headerRight}
        />
      }
    >
      <ScrollView padding={padding}>
        {shouldShowSearch && (
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={searchPlaceholder}
          />
        )}

        {header}

        {isEmpty ? (
          <div className="text-center py-12">
            <Text secondary>{emptyText}</Text>
          </div>
        ) : hasNoResults ? (
          <div className="text-center py-12">
            <Text secondary>{noResultsText}</Text>
          </div>
        ) : (
          <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap }}>
            {filtered.map((item, index) => (
              <React.Fragment key={keyExtractor(item)}>
                {renderItem(item, index)}
              </React.Fragment>
            ))}
          </div>
        )}

        {footer}
      </ScrollView>
    </Screen>
  )
}
