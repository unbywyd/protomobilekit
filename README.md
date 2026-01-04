# ProtoMobileKit

A React component library for rapid mobile app prototyping. Build iOS and Android-style interfaces with a unified API, complete with navigation, authentication, state management, and 50+ UI components.

## Features

- **Cross-Platform UI** - iOS and Android styles with automatic platform detection
- **50+ Components** - Buttons, forms, lists, modals, pickers, and more
- **Built-in Navigation** - Stack and tab navigation with deep linking support
- **Authentication System** - OTP auth, user management, quick switching for testing
- **State Management** - Zustand-based entity store with CRUD operations
- **DevTools Canvas** - Multi-app preview with device frames and hot reload
- **TypeScript First** - Full type safety with exported types

## Installation

```bash
npm install protomobilekit
```

### Peer Dependencies

```bash
npm install react react-dom zustand
```

## Quick Start

```tsx
import {
  Canvas,
  Navigator,
  Screen,
  Header,
  Button,
  Text,
} from 'protomobilekit'

function App() {
  return (
    <Canvas>
      <Navigator initial="home">
        <Navigator.Screen name="home" component={HomeScreen} />
      </Navigator>
    </Canvas>
  )
}

function HomeScreen() {
  return (
    <Screen header={<Header title="Welcome" />}>
      <div className="p-4">
        <Text size="xl" bold>Hello MobileKit!</Text>
        <Button onClick={() => alert('Clicked!')}>
          Get Started
        </Button>
      </div>
    </Screen>
  )
}
```

## Core Concepts

### Canvas & DevTools

The `Canvas` component provides the development environment with device frames, platform switching, and multi-app support.

```tsx
import { Canvas } from 'protomobilekit'

// Single app
<Canvas appId="myapp" appName="My App">
  <MyApp />
</Canvas>

// Multi-app with registry
import { registerApp } from 'protomobilekit'

registerApp({
  id: 'customer',
  name: 'Customer App',
  component: CustomerApp,
})

registerApp({
  id: 'admin',
  name: 'Admin Panel',
  component: AdminApp,
})

<Canvas />
```

### Navigation

MobileKit provides unified navigation for both stack and tab patterns.

```tsx
import { Navigator, useNavigate, useRoute } from 'protomobilekit'

// Stack navigation
<Navigator initial="home">
  <Navigator.Screen name="home" component={HomeScreen} />
  <Navigator.Screen name="details" component={DetailsScreen} />
</Navigator>

// Tab navigation
<Navigator initial="home" type="tabs">
  <Navigator.Screen
    name="home"
    component={HomeScreen}
    icon={<HomeIcon />}
    label="Home"
  />
  <Navigator.Screen
    name="orders"
    component={OrdersScreen}
    icon={<OrdersIcon />}
    label="Orders"
  />
  <Navigator.Screen
    name="profile"
    component={ProfileScreen}
    icon={<UserIcon />}
    label="Profile"
  />
</Navigator>

// Navigation hooks
function HomeScreen() {
  const { navigate, goBack } = useNavigate()
  const { params } = useRoute<{ id: string }>()

  return (
    <Button onClick={() => navigate('details', { id: '123' })}>
      Go to Details
    </Button>
  )
}
```

### Authentication

Built-in OTP authentication with user registry for testing.

```tsx
import {
  OTPAuth,
  useAuth,
  useIsAuthenticated,
  defineUsers,
  defineRoles,
} from 'protomobilekit'

// Define test users
defineRoles({
  appId: 'customer',
  roles: [
    { value: 'regular', label: 'Regular' },
    { value: 'premium', label: 'Premium', color: '#f59e0b' },
  ],
})

defineUsers({
  appId: 'customer',
  users: [
    { id: 'alice', name: 'Alice', phone: '+1234567890', role: 'premium' },
    { id: 'bob', name: 'Bob', phone: '+0987654321', role: 'regular' },
  ],
})

// Login screen
function LoginScreen() {
  const { navigate } = useNavigate()

  return (
    <OTPAuth
      onSuccess={() => navigate('home')}
      countryCode="US"
      otpLength={4}
    />
  )
}

// Protected screen
function ProfileScreen() {
  const { user, logout } = useAuth()
  const isAuthenticated = useIsAuthenticated()

  if (!isAuthenticated) return <LoginScreen />

  return (
    <Screen>
      <Text>Welcome, {user?.name}</Text>
      <Button onClick={logout}>Log Out</Button>
    </Screen>
  )
}
```

### State Management

Entity-based state management with automatic persistence.

```tsx
import { useRepo, useQuery, defineEntity } from 'protomobilekit'

// Define entity schema
defineEntity('Order', {
  status: 'pending',
  customerId: '',
  items: '[]',
  total: 0,
})

// CRUD operations
function OrdersScreen() {
  const orders = useRepo<Order>('Order')
  const { items } = useQuery<Order>('Order', {
    filter: (o) => o.status !== 'cancelled',
    sort: (a, b) => b.createdAt - a.createdAt,
  })

  const createOrder = () => {
    orders.create({
      status: 'pending',
      customerId: 'user-1',
      items: JSON.stringify([{ name: 'Pizza', qty: 1 }]),
      total: 15.99,
    })
  }

  const updateStatus = (id: string) => {
    orders.update(id, { status: 'confirmed' })
  }

  const deleteOrder = (id: string) => {
    orders.remove(id)
  }

  return (
    <List
      items={items}
      keyExtractor={(o) => o.id}
      renderItem={(order) => (
        <ListItem onPress={() => updateStatus(order.id)}>
          Order #{order.id} - {order.status}
        </ListItem>
      )}
    />
  )
}
```

### Server Sync

Configure server synchronization for loading and saving state to a backend API.

```tsx
import { defineConfig, useSync, useStore } from 'protomobilekit'

// Configure sync handlers at app startup
defineConfig({
  data: {
    // Pull data from server
    onPull: async () => {
      const response = await fetch('/api/data')
      const data = await response.json()
      // Return format: { CollectionName: { id: entity, ... }, ... }
      return {
        Order: data.orders.reduce((acc, o) => ({ ...acc, [o.id]: o }), {}),
        Product: data.products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
      }
    },
    // Push data to server
    onPush: async (data) => {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
  },
})

// Use sync in components
function DataManager() {
  const { pull, push, isSyncing, lastSyncAt } = useSync()

  useEffect(() => {
    // Load data on mount
    pull()
  }, [])

  return (
    <Button onPress={push} disabled={isSyncing}>
      {isSyncing ? 'Syncing...' : 'Save to Server'}
    </Button>
  )
}
```

#### Direct Store Access

For advanced use cases, access the store directly:

```tsx
import { useStore } from 'protomobilekit'

// Get store instance (outside React)
const store = useStore.getState()

// Read all entities
const allOrders = store.getAll('Order')

// Query with predicate
const pendingOrders = store.query('Order', o => o.status === 'pending')

// Create entity
store.create('Order', { status: 'pending', total: 100 })

// Update entity
store.update('Order', 'order-id', { status: 'confirmed' })

// Delete entity
store.delete('Order', 'order-id')

// Merge remote data
store._mergeData({
  Order: { 'o1': { id: 'o1', status: 'new', ... } }
})

// Get all data (for sync)
const allData = store._getData()
```

#### Initial Data Seeding

Seed data at app startup (useful for demos):

```tsx
import { useStore, resetStore } from 'protomobilekit'

function seedData() {
  const store = useStore.getState()

  // Check if already seeded
  if (store.getAll('Product').length > 0) return

  // Create initial data (silent = no events)
  store.create('Product', {
    id: 'p1',
    name: 'Pizza',
    price: 15
  }, { silent: true })

  store.create('Product', {
    id: 'p2',
    name: 'Burger',
    price: 12
  }, { silent: true })
}

// Call at app startup
resetStore() // Clear old data
seedData()
```

## Components

### Layout

| Component | Description |
|-----------|-------------|
| `Screen` | Main screen wrapper with header/footer support |
| `Header` | Navigation header with title and actions |
| `ScrollView` | Scrollable content container |
| `Section` | Content section with title |
| `Card` | Elevated card container |
| `BackButton` | Navigation back button |

### Forms

| Component | Description |
|-----------|-------------|
| `Input` | Text input field |
| `TextArea` | Multi-line text input |
| `Select` | Dropdown select |
| `Autocomplete` | Search with suggestions |
| `Checkbox` | Checkbox input |
| `Radio` | Radio button group |
| `Switch` | Toggle switch |
| `PhoneInput` | Phone number input with country code |
| `OTPInput` | One-time password input |
| `Form` | Form wrapper with validation |
| `FormField` | Form field with label and error |
| `FormSection` | Grouped form fields |

### Data Display

| Component | Description |
|-----------|-------------|
| `Text` | Typography component |
| `List` | Virtualized list |
| `ListItem` | List row item |
| `Avatar` | User avatar |
| `AvatarGroup` | Stacked avatars |
| `Badge` | Status badge |
| `Chip` | Tag/chip component |
| `StatusBadge` | Order/user status |
| `StatCard` | Statistics card |
| `DashboardStats` | Stats grid |
| `InfoRow` | Key-value row |
| `Carousel` | Swipeable carousel |

### Navigation

| Component | Description |
|-----------|-------------|
| `Tabs` | Tab switcher |
| `TabBar` | Bottom tab bar |
| `Accordion` | Collapsible sections |

### Overlays

| Component | Description |
|-----------|-------------|
| `Modal` | Modal dialog |
| `BottomSheet` | Bottom sheet |
| `ActionSheet` | Action sheet menu |
| `Alert` | Alert dialog |
| `Confirm` | Confirmation dialog |
| `Prompt` | Input prompt |
| `ImageViewer` | Full-screen image viewer |

### Pickers

| Component | Description |
|-----------|-------------|
| `DatePicker` | Date selection |
| `TimePicker` | Time selection |
| `DateTimePicker` | Combined date/time |
| `Calendar` | Calendar view |

### Feedback

| Component | Description |
|-----------|-------------|
| `Button` | Action button |
| `Spinner` | Loading spinner |
| `Progress` | Progress bar |
| `Skeleton` | Loading skeleton |
| `ToastProvider` / `useToast` | Toast notifications |

### Menus

| Component | Description |
|-----------|-------------|
| `DropdownMenu` | Dropdown menu |
| `HorizontalMenu` | Horizontal scrolling menu |
| `ContextMenu` | Context menu |

## Theming

MobileKit uses a monochrome theme optimized for prototyping.

```tsx
import { useTheme, ThemeProvider } from 'protomobilekit'

function MyComponent() {
  const { colors, platform } = useTheme()

  return (
    <div style={{
      backgroundColor: colors.surface,
      color: colors.text,
    }}>
      Platform: {platform}
    </div>
  )
}

// Available colors
interface ThemeColors {
  primary: string       // #000000
  primaryText: string   // #FFFFFF
  background: string    // #F5F5F5
  surface: string       // #FFFFFF
  text: string          // #000000
  textSecondary: string // #666666
  border: string        // #E5E5E5
  danger: string        // #FF3B30 (iOS) / #F44336 (Android)
  success: string       // #34C759 (iOS) / #4CAF50 (Android)
}
```

## Frames & Flows

Define screen frames and user flows for documentation and testing.

```tsx
import { defineFrames, defineFlow, createFrame } from 'protomobilekit'

// Define frames
defineFrames({
  appId: 'customer',
  appName: 'Customer App',
  initial: 'home',
  frames: [
    { id: 'home', name: 'Home', component: HomeScreen, tags: ['main'] },
    { id: 'orders', name: 'Orders', component: OrdersScreen, tags: ['list'] },
    { id: 'profile', name: 'Profile', component: ProfileScreen, tags: ['settings'] },
  ],
})

// Define user flow
defineFlow({
  id: 'order-journey',
  name: 'Order Flow',
  appId: 'customer',
  steps: [
    { frame: homeFrame, tasks: ['Browse restaurants'] },
    { frame: menuFrame, tasks: ['Select items', 'Add to cart'] },
    { frame: checkoutFrame, tasks: ['Enter address', 'Pay'] },
    { frame: trackingFrame },
  ],
})
```

## Utilities

```tsx
import {
  formatCurrency,
  formatDate,
  formatPhone,
  cn,
} from 'protomobilekit'

// Currency formatting
formatCurrency(1234.56, 'USD') // "$1,234.56"
formatCurrency(1000, 'EUR')    // "€1,000.00"
formatCurrency(5000, 'RUB')    // "5 000 ₽"

// Date formatting
formatDate(new Date(), 'short') // "Jan 15"
formatDate(new Date(), 'long')  // "January 15, 2025"

// Class name merging (tailwind-merge + clsx)
cn('px-4 py-2', isActive && 'bg-black', className)
```

## TypeScript

All components are fully typed. Import types as needed:

```tsx
import type {
  ButtonProps,
  InputProps,
  ListProps,
  NavigatorProps,
  ScreenProps,
  // ... etc
} from 'protomobilekit'
```

## Examples

See the `/demo` directory for complete examples:

- **Customer App** - Food delivery customer interface
- **Courier App** - Delivery driver interface
- **Admin Panel** - Order management dashboard
- **Showcase** - Component gallery

## License

MIT
