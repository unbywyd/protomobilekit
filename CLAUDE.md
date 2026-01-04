# ProtoMobileKit - Claude Code Instructions

This file provides context for Claude Code when working on the ProtoMobileKit project.

## Project Overview

ProtoMobileKit is a React component library for rapid mobile app prototyping. It provides:

- 50+ UI components styled for iOS and Android
- Stack and tab navigation
- Authentication system with OTP
- Entity-based state management (Zustand)
- DevTools canvas for multi-app preview

## Directory Structure

```
mobilekit/
├── src/
│   ├── index.ts              # Main exports - ADD NEW EXPORTS HERE
│   ├── ui/                   # UI Components
│   │   ├── index.ts          # UI exports
│   │   ├── theme.tsx         # ThemeProvider, useTheme, colors
│   │   ├── utils.ts          # cn() helper
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── List.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Alert.tsx
│   │   ├── Toast.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   ├── Accordion.tsx
│   │   ├── Carousel.tsx
│   │   ├── DatePicker.tsx
│   │   ├── TimePicker.tsx
│   │   ├── Spinner.tsx
│   │   ├── Skeleton.tsx
│   │   └── ...
│   ├── navigation/           # Navigation
│   │   ├── index.ts
│   │   ├── Navigator.tsx     # <Navigator>, <Navigator.Screen>
│   │   └── types.ts
│   ├── auth/                 # Authentication
│   │   ├── index.ts
│   │   ├── OTPAuth.tsx       # OTP login component
│   │   ├── hooks.ts          # useAuth, useIsAuthenticated
│   │   ├── store.ts          # Auth Zustand store
│   │   ├── registry.ts       # defineUsers, defineRoles
│   │   └── quickSwitch.ts    # DevTools quick switch
│   ├── store/                # State Management
│   │   ├── index.ts
│   │   ├── entities.ts       # defineEntity, seedData
│   │   └── hooks.ts          # useRepo, useQuery, useStore
│   ├── canvas/               # DevTools
│   │   ├── Canvas.tsx        # Main canvas component
│   │   ├── DevTools.tsx      # DevTools panel
│   │   └── AppRegistry.tsx   # registerApp
│   ├── frames/               # Screen Frames
│   │   ├── registry.ts       # defineFrames, defineFlow
│   │   └── types.ts
│   └── events/               # Event System
│       └── bus.ts            # eventBus
├── dist/                     # Built output (gitignored)
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Key Patterns

### Creating a New Component

1. Create the component file in `src/ui/`:

```tsx
// src/ui/MyComponent.tsx
import React from 'react'
import { cn } from './utils'
import { useTheme } from './theme'

export interface MyComponentProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
  className?: string
}

export function MyComponent({
  children,
  variant = 'default',
  className,
}: MyComponentProps) {
  const { colors } = useTheme()

  return (
    <div
      className={cn(
        'p-4 rounded-lg',
        variant === 'outlined' && 'border',
        className
      )}
      style={{
        backgroundColor: variant === 'default' ? colors.surface : 'transparent',
        borderColor: colors.border,
      }}
    >
      {children}
    </div>
  )
}
```

2. Export from `src/ui/index.ts`:

```tsx
export { MyComponent, type MyComponentProps } from './MyComponent'
```

3. Export from `src/index.ts`:

```tsx
// In the components section
export {
  // ... existing
  MyComponent,
} from './ui'

// In the types section
export type {
  // ... existing
  MyComponentProps,
} from './ui'
```

4. Build: `npm run build`

### Theme Usage

Always use theme colors, never hardcode:

```tsx
// GOOD
const { colors, platform } = useTheme()
<div style={{ backgroundColor: colors.surface, color: colors.text }}>

// BAD
<div style={{ backgroundColor: '#fff', color: '#000' }}>
```

### Platform-Specific Code

```tsx
const { platform } = useTheme()
const isIOS = platform === 'ios'

// Different styles per platform
<div className={cn(
  'p-4',
  isIOS ? 'rounded-2xl' : 'rounded-lg'
)}>
```

### Navigation

```tsx
// Define screens
<Navigator initial="home" type="tabs">
  <Navigator.Screen name="home" component={Home} icon={<HomeIcon />} label="Home" />
  <Navigator.Screen name="profile" component={Profile} icon={<UserIcon />} label="Profile" />
  {/* Screens without icon/label don't show in tab bar */}
  <Navigator.Screen name="details" component={Details} />
</Navigator>

// Navigate
const { navigate, goBack, replace, reset } = useNavigate()
navigate('details', { id: '123' })

// Get params
const { params } = useRoute<{ id: string }>()
```

### State Management

```tsx
// Define entity schema
defineEntity('Order', {
  status: 'pending',
  customerId: '',
  total: 0,
})

// Use in component
const orders = useRepo<Order>('Order')
const { items } = useQuery<Order>('Order', {
  filter: (o) => o.status === 'pending',
})

orders.create({ status: 'pending', total: 100 })
orders.update(id, { status: 'confirmed' })
orders.remove(id)
```

### Authentication

```tsx
// Define test users
defineUsers({
  appId: 'myapp',
  users: [
    { id: 'user1', name: 'Test User', phone: '+1234567890' }
  ]
})

// Use auth
const { user, isAuthenticated, login, logout } = useAuth()

// Quick check
const isLoggedIn = useIsAuthenticated()
```

## Common Tasks

### Add a new form input type

1. Add to `src/ui/Input.tsx` or create new file
2. Export from `src/ui/index.ts`
3. Export from `src/index.ts`

### Add a new overlay/modal type

1. Create in `src/ui/` (follow Modal.tsx or BottomSheet.tsx pattern)
2. Use portal rendering for proper z-index
3. Export from both index files

### Fix navigation issues

- Check `Navigator.tsx` for routing logic
- Tab bar visibility controlled by `icon`/`label` props on screens
- Use `key` prop on Navigator to force re-render on auth change

### Fix auth issues

- Auth state per app namespace (appId)
- Check `auth/store.ts` for state management
- Check `auth/hooks.ts` for hook implementation

## Build Commands

```bash
npm run build      # Production build
npm run dev        # Watch mode for development
npm run typecheck  # TypeScript validation
```

## Important Files to Know

| File | Purpose |
|------|---------|
| `src/index.ts` | All public exports |
| `src/ui/theme.tsx` | Theme colors and provider |
| `src/navigation/Navigator.tsx` | Navigation component |
| `src/auth/hooks.ts` | Auth hooks |
| `src/store/hooks.ts` | State hooks |
| `src/canvas/Canvas.tsx` | DevTools canvas |

## Code Style Rules

1. **TypeScript**: Always use explicit types, export interfaces
2. **Styling**: Tailwind for layout, `colors` from theme for colors
3. **Components**: Function components, props interface with `Props` suffix
4. **Hooks**: Prefix with `use`, return objects with named properties
5. **Exports**: Export component AND type together

## Testing Changes

After making changes:

1. Run `npm run build` in mobilekit
2. Test in demo app (`../demo`)
3. Check TypeScript: `npm run typecheck`

## Common Mistakes to Avoid

- Forgetting to export from BOTH `ui/index.ts` AND main `index.ts`
- Using hardcoded colors instead of theme
- Not handling both iOS and Android platforms
- Missing TypeScript types on props
- Forgetting to build after changes
