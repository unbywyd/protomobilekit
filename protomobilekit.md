# ProtoMobileKit

React component library for rapid mobile app prototyping. Build iOS and Android-style interfaces with a unified API, complete with navigation, authentication, state management, and 50+ UI components.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Canvas & Apps](#canvas--apps)
  - [Navigation](#navigation)
  - [State Management](#state-management)
  - [Authentication](#authentication)
  - [Events](#events)
  - [Forms](#forms)
  - [Frames & Flows](#frames--flows)
- [UI Components](#ui-components)
- [Theming](#theming)
- [Utilities](#utilities)
- [DevTools](#devtools)
- [TypeScript](#typescript)

---

## Installation

```bash
npm install protomobilekit
```

### Peer Dependencies

```bash
npm install react react-dom zustand
```

### Tailwind CSS 4 Setup

ProtoMobileKit uses Tailwind CSS 4. Configure your CSS file:

```css
/* src/index.css */
@import "tailwindcss";

/* Include protomobilekit classes */
@source "../node_modules/protomobilekit/dist/**/*.js";
```

---

## Quick Start

```tsx
import { Canvas, defineApp, Navigator, Screen, Header, Button, Text, ThemeProvider, DevTools } from 'protomobilekit'

function App() {
  return (
    <ThemeProvider defaultPlatform="ios">
      <Canvas
        apps={[
          defineApp({
            id: 'myapp',
            name: 'My App',
            device: 'iphone-14',
            component: () => <MyApp />,
          }),
        ]}
        layout="row"
        showLabels
      />
      <DevTools position="right" devOnly={false} />
    </ThemeProvider>
  )
}

function MyApp() {
  return (
    <Navigator initial="home">
      <Navigator.Screen name="home" component={HomeScreen} />
      <Navigator.Screen name="details" component={DetailsScreen} />
    </Navigator>
  )
}

function HomeScreen() {
  const { navigate } = useNavigate()

  return (
    <Screen header={<Header title="Home" />}>
      <div className="p-4">
        <Text size="xl" bold>Welcome!</Text>
        <Button onClick={() => navigate('details', { id: '123' })}>
          View Details
        </Button>
      </div>
    </Screen>
  )
}
```

---

## Core Concepts

### Canvas & Apps

Canvas is the main container that displays multiple app instances in device frames.

#### Basic Setup

```tsx
import { Canvas, defineApp, ThemeProvider, DevTools } from 'protomobilekit'

function App() {
  return (
    <ThemeProvider defaultPlatform="android">
      <Canvas
        apps={[
          defineApp({
            id: 'customer',
            name: 'Customer App',
            device: 'iphone-14',
            component: () => <CustomerApp />,
          }),
          defineApp({
            id: 'admin',
            name: 'Admin Panel',
            device: 'iphone-14-pro-max',
            component: () => <AdminApp />,
          }),
        ]}
        layout="row"      // 'row' | 'grid' | 'freeform'
        gap={24}          // Gap between devices (px)
        scale={1}         // Device scale (0.5 - 1.5)
        showLabels        // Show app names below devices
        background="#f3f4f6"
      />
      <DevTools position="right" devOnly={false} />
    </ThemeProvider>
  )
}
```

#### Available Devices

```tsx
// Device presets
type DeviceType =
  | 'iphone-14'
  | 'iphone-14-pro'
  | 'iphone-14-pro-max'
  | 'iphone-se'
  | 'pixel-7'
  | 'pixel-7-pro'
  | 'galaxy-s23'
  | 'galaxy-s23-ultra'

// Or custom dimensions
defineApp({
  id: 'custom',
  name: 'Custom Device',
  deviceConfig: {
    width: 375,
    height: 812,
    borderRadius: 40,
    notch: true,
  },
  component: () => <MyApp />,
})
```

#### useApp Hook

Access app context and auth from any component:

```tsx
import { useApp } from 'protomobilekit'

function ProfileScreen() {
  const {
    appId,          // Current app ID
    appName,        // Current app name
    user,           // Current authenticated user
    userId,         // User ID (string | null)
    isAuthenticated,
    login,
    logout,
  } = useApp()

  return (
    <Screen>
      <Text>App: {appName}</Text>
      <Text>User: {user?.name}</Text>
      <Button onClick={logout}>Logout</Button>
    </Screen>
  )
}
```

---

### Navigation

Unified navigation system supporting both stack and tab patterns.

#### Stack Navigation

```tsx
import { Navigator, useNavigate, useRoute } from 'protomobilekit'

function App() {
  return (
    <Navigator initial="home">
      <Navigator.Screen name="home" component={HomeScreen} />
      <Navigator.Screen name="details" component={DetailsScreen} />
      <Navigator.Screen name="settings" component={SettingsScreen} />
    </Navigator>
  )
}

function HomeScreen() {
  const { navigate, goBack, replace, reset, canGoBack } = useNavigate()

  return (
    <Screen>
      {/* Navigate to screen with params */}
      <Button onClick={() => navigate('details', { id: '123' })}>
        View Details
      </Button>

      {/* Replace current screen */}
      <Button onClick={() => replace('settings')}>
        Replace with Settings
      </Button>

      {/* Reset navigation stack */}
      <Button onClick={() => reset('home')}>
        Reset to Home
      </Button>

      {/* Go back */}
      {canGoBack() && (
        <Button onClick={goBack}>Back</Button>
      )}
    </Screen>
  )
}

function DetailsScreen() {
  const { params } = useRoute<{ id: string }>()

  return (
    <Screen header={<Header title="Details" showBack />}>
      <Text>Item ID: {params.id}</Text>
    </Screen>
  )
}
```

#### Tab Navigation

```tsx
import { Navigator } from 'protomobilekit'

// Icons (use any icon library)
const HomeIcon = () => <svg>...</svg>
const OrdersIcon = () => <svg>...</svg>
const ProfileIcon = () => <svg>...</svg>

function App() {
  return (
    <Navigator
      initial="home"
      type="tabs"
      tabBarPosition="bottom"  // 'bottom' | 'top'
    >
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
        badge={3}  // Badge count
      />
      <Navigator.Screen
        name="profile"
        component={ProfileScreen}
        icon={<ProfileIcon />}
        label="Profile"
      />
      {/* Non-tab screens (no icon) - accessible via navigate() */}
      <Navigator.Screen name="order-details" component={OrderDetailsScreen} />
    </Navigator>
  )
}
```

#### Navigation Options

```tsx
<Navigator
  initial="home"
  type="stack"           // 'stack' | 'tabs'
  tabBarPosition="bottom" // 'bottom' | 'top' (for tabs)
  tabBarHidden={false}    // Hide tab bar
  tabBarStyle={{          // Custom tab bar styles
    backgroundColor: '#fff',
  }}
  screenOptions={{        // Default options for all screens
    headerShown: true,
  }}
>
```

---

### State Management

Entity-based state management with Zustand, automatic persistence to localStorage.

#### Entity Definition

```tsx
import { entity, seed, fake } from 'protomobilekit'
import type { InferEntity } from 'protomobilekit'

// Define entity with type inference
const Order = entity({
  name: 'Order',
  fields: {
    status: { type: 'enum', values: ['pending', 'confirmed', 'delivered'] as const },
    customerId: 'string',
    courierId: { type: 'string', default: null },
    total: 'number',
    items: 'string',  // JSON string
    address: 'string',
    createdAt: 'date',
  },
  // Optional: custom mock generator
  mock: () => ({
    total: Math.random() * 100,
    items: JSON.stringify([{ name: 'Pizza', qty: 1 }]),
  }),
})

// Infer TypeScript type from entity
type Order = InferEntity<typeof Order>
// { id: string, status: 'pending' | 'confirmed' | 'delivered', customerId: string, ... }
```

#### Field Types

```tsx
type FieldType =
  | 'string'    // Random lorem words
  | 'number'    // Random integer 1-1000
  | 'boolean'   // Random true/false
  | 'date'      // Timestamp (Date.now())
  | 'email'     // faker.internet.email()
  | 'phone'     // faker.phone.number()
  | 'url'       // faker.internet.url()
  | 'image'     // faker.image.url()
  | 'uuid'      // UUID string
  | 'enum'      // Random from values array
  | 'relation'  // Foreign key (null by default)

// Extended field definition
const User = entity({
  name: 'User',
  fields: {
    // Simple type
    name: 'string',

    // With custom faker path
    firstName: { type: 'string', faker: 'person.firstName' },
    lastName: { type: 'string', faker: 'person.lastName' },
    avatar: { type: 'image', faker: 'image.avatar' },

    // With default value
    role: { type: 'enum', values: ['user', 'admin'] as const, default: 'user' },

    // Enum type
    status: { type: 'enum', values: ['active', 'inactive'] as const },

    // Relation (foreign key)
    companyId: { type: 'relation', entity: 'Company' },
  },
})
```

#### CRUD Operations with useRepo

```tsx
import { useRepo, useQuery, useEntity, useRelation } from 'protomobilekit'

function OrdersScreen() {
  // Get repository for CRUD operations
  const orders = useRepo<Order>('Order')

  // Create
  const createOrder = () => {
    const newOrder = orders.create({
      status: 'pending',
      customerId: 'user-1',
      total: 29.99,
      items: JSON.stringify([{ name: 'Burger', qty: 2 }]),
      address: '123 Main St',
    })
    console.log('Created:', newOrder.id)
  }

  // Read all
  const allOrders = orders.getAll()

  // Read by ID
  const order = orders.getById('order-123')

  // Update
  const confirmOrder = (id: string) => {
    orders.update(id, { status: 'confirmed' })
  }

  // Delete
  const cancelOrder = (id: string) => {
    orders.remove(id)
  }

  return (...)
}
```

#### useQuery for Filtered Data

```tsx
import { useQuery } from 'protomobilekit'

function PendingOrders() {
  const { items, total, isEmpty, hasMore } = useQuery<Order>('Order', {
    // Filter
    filter: (order) => order.status === 'pending',

    // Sort (newest first)
    sort: (a, b) => b.createdAt - a.createdAt,

    // Pagination
    limit: 10,
    offset: 0,
  })

  if (isEmpty) {
    return <Text>No pending orders</Text>
  }

  return (
    <List
      items={items}
      keyExtractor={(o) => o.id}
      renderItem={(order) => (
        <ListItem>Order #{order.id}</ListItem>
      )}
    />
  )
}
```

#### useEntity for Single Item

```tsx
import { useEntity } from 'protomobilekit'

function OrderDetails({ orderId }: { orderId: string }) {
  const order = useEntity<Order>('Order', orderId)

  if (!order) {
    return <Text>Order not found</Text>
  }

  return (
    <Card>
      <Text>Order #{order.id}</Text>
      <Text>Status: {order.status}</Text>
      <Text>Total: ${order.total}</Text>
    </Card>
  )
}
```

#### useRelation for Related Data

```tsx
import { useRelation, useRelations } from 'protomobilekit'

function OrderWithCustomer({ orderId }: { orderId: string }) {
  // Get single related entity
  const customer = useRelation<Order, User>('Order', orderId, 'customerId', 'User')

  return (
    <Card>
      <Text>Customer: {customer?.name}</Text>
    </Card>
  )
}

function CustomerOrders({ customerId }: { customerId: string }) {
  // Get all related entities (one-to-many)
  const orders = useRelations<Order>('Order', 'customerId', customerId)

  return (
    <List
      items={orders}
      renderItem={(order) => <ListItem>{order.id}</ListItem>}
    />
  )
}
```

#### Data Seeding

```tsx
import { seed, fake, useStore, resetStore } from 'protomobilekit'

// Seed multiple records
function initializeData() {
  resetStore()  // Clear existing data

  // Generate 10 fake orders
  const orders = seed(Order, 10)
  console.log('Created orders:', orders)

  // Generate single fake data (without saving)
  const fakeOrder = fake(Order)
  console.log('Fake order:', fakeOrder)
}

// Manual seeding with specific data
function seedProducts() {
  const store = useStore.getState()

  const products = [
    { id: 'p1', name: 'Pizza', price: 15, category: 'food' },
    { id: 'p2', name: 'Burger', price: 12, category: 'food' },
    { id: 'p3', name: 'Soda', price: 3, category: 'drink' },
  ]

  for (const product of products) {
    store.create('Product', product, { silent: true })  // No events
  }
}
```

#### Server Sync

```tsx
import { defineConfig, useSync } from 'protomobilekit'

// Configure at app startup
defineConfig({
  data: {
    // Load data from server
    onPull: async () => {
      const res = await fetch('/api/data')
      const data = await res.json()

      // Return format: { CollectionName: { id: entity } }
      return {
        Order: data.orders.reduce((acc, o) => ({ ...acc, [o.id]: o }), {}),
        User: data.users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {}),
      }
    },

    // Save data to server
    onPush: async (data) => {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
  },
})

// Use in components
function SyncButton() {
  const { pull, push, isSyncing, lastSyncAt } = useSync()

  useEffect(() => {
    pull()  // Load on mount
  }, [])

  return (
    <Button onPress={push} loading={isSyncing}>
      Save to Server
    </Button>
  )
}
```

#### Direct Store Access

```tsx
import { useStore } from 'protomobilekit'

// Outside React components
const store = useStore.getState()

// All store methods
store.create('Order', { status: 'pending', ... })
store.update('Order', 'id', { status: 'confirmed' })
store.delete('Order', 'id')
store.getAll<Order>('Order')
store.getById<Order>('Order', 'id')
store.query<Order>('Order', o => o.status === 'pending')

// Sync helpers
store._mergeData({ Order: { 'id': {...} } })
store._getData()  // Get all collections
```

---

### Authentication

Built-in OTP authentication with user registry for testing.

#### Define Users and Roles

```tsx
import { defineUsers, defineRoles } from 'protomobilekit'

// Define roles for an app
defineRoles({
  appId: 'customer',
  roles: [
    { value: 'regular', label: 'Regular Customer' },
    { value: 'premium', label: 'Premium', color: '#f59e0b' },
    { value: 'vip', label: 'VIP', color: '#8b5cf6' },
  ],
})

// Define test users
defineUsers({
  appId: 'customer',
  users: [
    {
      id: 'alice',
      name: 'Alice Johnson',
      phone: '+1234567890',
      role: 'premium',
      avatar: 'https://example.com/alice.jpg',
      // Custom fields
      email: 'alice@example.com',
      address: '123 Main St',
    },
    {
      id: 'bob',
      name: 'Bob Smith',
      phone: '+0987654321',
      role: 'regular',
    },
  ],
})
```

#### OTP Auth Component

```tsx
import { OTPAuth, useAuth, useIsAuthenticated } from 'protomobilekit'

function LoginScreen() {
  const { navigate } = useNavigate()

  return (
    <OTPAuth
      onSuccess={() => navigate('home')}
      countryCode="US"        // Default country
      otpLength={4}           // OTP code length
      allowTestUsers          // Show "Quick Login" for test users
      logo={<Logo />}         // Optional logo
      title="Welcome"         // Optional title
      subtitle="Sign in to continue"
    />
  )
}

function ProfileScreen() {
  const { user, logout, isAuthenticated, updateUser } = useAuth()

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <Screen>
      <Avatar src={user?.avatar} name={user?.name} size="xl" />
      <Text>{user?.name}</Text>
      <Text>{user?.phone}</Text>

      <Button onClick={() => updateUser({ name: 'New Name' })}>
        Update Name
      </Button>

      <Button variant="danger" onClick={logout}>
        Log Out
      </Button>
    </Screen>
  )
}
```

#### Auth Guards

```tsx
import { RequireAuth, RequireRole, AuthGuard, RoleGuard } from 'protomobilekit'

// Require authentication
function ProtectedScreen() {
  return (
    <RequireAuth fallback={<LoginScreen />}>
      <Dashboard />
    </RequireAuth>
  )
}

// Require specific role
function AdminPanel() {
  return (
    <RequireRole
      roles={['admin', 'superadmin']}
      fallback={<AccessDenied message="Admin access required" />}
    >
      <AdminDashboard />
    </RequireRole>
  )
}

// AuthGuard component (same as RequireAuth)
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// RoleGuard component (same as RequireRole)
<RoleGuard roles={['premium']}>
  <PremiumFeatures />
</RoleGuard>
```

#### Auth Hooks

```tsx
import { useAuth, useUser, useIsAuthenticated, useCurrentUserId, useRequireAuth } from 'protomobilekit'

function MyComponent() {
  // Full auth state
  const { user, isAuthenticated, isLoading, login, logout, updateUser } = useAuth()

  // Just the user
  const user = useUser()

  // Boolean check
  const isLoggedIn = useIsAuthenticated()

  // User ID only
  const userId = useCurrentUserId()

  // Redirect to login if not authenticated
  useRequireAuth('/login')
}
```

#### Quick Switch (DevTools)

```tsx
import { quickSwitch, quickLogout, getAppUsers } from 'protomobilekit'

// Switch user instantly (for testing)
function DevUserSwitcher() {
  const users = getAppUsers('customer')

  return (
    <List
      items={users}
      renderItem={(user) => (
        <ListItem onPress={() => quickSwitch('customer', user.id)}>
          {user.name}
        </ListItem>
      )}
    />
  )
}

// Logout from all apps
<Button onClick={() => quickLogout('customer')}>
  Logout
</Button>
```

---

### Events

Global event bus for cross-component communication.

#### Basic Events

```tsx
import { dispatch, subscribe, useEvent, useDispatch } from 'protomobilekit'

// Dispatch event (anywhere)
dispatch('order:created', { orderId: '123', total: 29.99 }, 'checkout')

// Subscribe to event (outside React)
const unsubscribe = subscribe('order:created', (payload, event) => {
  console.log('Order created:', payload)
  console.log('Event ID:', event.id)
  console.log('Timestamp:', event.timestamp)
  console.log('Source:', event.source)
})

// useEvent hook (in React)
function NotificationHandler() {
  useEvent('order:created', (payload) => {
    showToast(`Order ${payload.orderId} created!`)
  })

  return null
}

// useDispatch hook
function CheckoutButton() {
  const dispatchEvent = useDispatch()

  const handleCheckout = () => {
    dispatchEvent('order:created', { orderId: '123' })
  }

  return <Button onClick={handleCheckout}>Checkout</Button>
}
```

#### Typed Events

```tsx
import { defineEvents, createEvent } from 'protomobilekit'

// Define typed events
const OrderEvents = defineEvents({
  'order:created': (orderId: string, total: number) => ({ orderId, total }),
  'order:updated': (orderId: string, changes: Partial<Order>) => ({ orderId, changes }),
  'order:cancelled': (orderId: string, reason: string) => ({ orderId, reason }),
})

// Create type-safe dispatcher
const orderCreated = createEvent(OrderEvents, 'order:created')

// Use with full type safety
orderCreated.dispatch('order-123', 29.99)

// Subscribe with typed payload
orderCreated.subscribe((payload) => {
  console.log(payload.orderId)  // TypeScript knows this is string
  console.log(payload.total)    // TypeScript knows this is number
})
```

#### Event History

```tsx
import { getEventHistory, clearEventHistory, useEventHistory, useLatestEvent } from 'protomobilekit'

// Get all events
const history = getEventHistory()

// Clear history
clearEventHistory()

// React hooks
function EventDebugger() {
  // All events
  const allEvents = useEventHistory()

  // Filtered events
  const orderEvents = useEventHistory(['order:created', 'order:updated'])

  // Latest event of type
  const lastOrder = useLatestEvent<{ orderId: string }>('order:created')

  return (
    <List
      items={allEvents}
      renderItem={(event) => (
        <ListItem>
          {event.name}: {JSON.stringify(event.payload)}
        </ListItem>
      )}
    />
  )
}
```

#### Wildcard Subscription

```tsx
// Subscribe to ALL events
subscribe('*', (payload, event) => {
  console.log(`[${event.name}]`, payload)
})
```

---

### Forms

Complete form state management with validation.

#### useForm Hook

```tsx
import { useForm, required, email, minLength, compose } from 'protomobilekit'

function RegistrationForm() {
  const form = useForm({
    values: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: compose(required(), minLength(2)),
      email: compose(required(), email()),
      password: compose(required(), minLength(8)),
      confirmPassword: compose(
        required(),
        match('password', 'Passwords must match')
      ),
    },
    validateOnBlur: true,     // Validate when field loses focus
    validateOnChange: false,  // Don't validate on every keystroke
    onSubmit: async (values) => {
      await api.register(values)
    },
    onChange: (values) => {
      console.log('Form changed:', values)
    },
  })

  return (
    <Form form={form}>
      <FormField name="name" label="Full Name">
        <Input placeholder="John Doe" />
      </FormField>

      <FormField name="email" label="Email">
        <Input type="email" placeholder="john@example.com" />
      </FormField>

      <FormField name="password" label="Password">
        <Input type="password" />
      </FormField>

      <FormField name="confirmPassword" label="Confirm Password">
        <Input type="password" />
      </FormField>

      <FormActions>
        <Button type="submit" loading={form.submitting}>
          Register
        </Button>
        <Button variant="ghost" onClick={() => form.reset()}>
          Reset
        </Button>
      </FormActions>
    </Form>
  )
}
```

#### Built-in Validators

```tsx
import {
  required,
  minLength,
  maxLength,
  email,
  phone,
  url,
  pattern,
  range,
  min,
  max,
  match,
  custom,
  compose,
  optional,
} from 'protomobilekit'

const validators = {
  // Required field
  name: required('Name is required'),

  // String length
  username: compose(
    required(),
    minLength(3, 'Min 3 characters'),
    maxLength(20, 'Max 20 characters')
  ),

  // Email validation
  email: compose(required(), email('Invalid email')),

  // Phone by country
  phone: phone('us'),  // 'us' | 'ru' | 'ua' | 'kz' | 'by' | 'default'

  // URL validation
  website: optional(url('Invalid URL')),

  // Regex pattern
  zipCode: pattern(/^\d{5}$/, 'Invalid zip code'),

  // Number range
  age: compose(required(), range(18, 120)),
  quantity: compose(required(), min(1), max(100)),

  // Match another field
  confirmPassword: match('password', 'Passwords must match'),

  // Custom validator
  noSpaces: custom(
    (value) => !value.includes(' '),
    'No spaces allowed'
  ),

  // Async validator
  uniqueEmail: async(
    async (email) => {
      const exists = await api.checkEmail(email)
      return !exists
    },
    'Email already exists'
  ),
}
```

#### Form Components

```tsx
import { Form, FormField, FormRow, FormSection, FormActions } from 'protomobilekit'

function ComplexForm() {
  const form = useForm({ values: {...} })

  return (
    <Form form={form}>
      {/* Section grouping */}
      <FormSection title="Personal Info" description="Your basic information">
        {/* Horizontal row */}
        <FormRow>
          <FormField name="firstName" label="First Name">
            <Input />
          </FormField>
          <FormField name="lastName" label="Last Name">
            <Input />
          </FormField>
        </FormRow>

        <FormField name="email" label="Email" helper="We'll never share it">
          <Input type="email" />
        </FormField>

        <FormField name="bio" label="Bio" optional>
          <TextArea rows={3} />
        </FormField>
      </FormSection>

      <FormSection title="Preferences">
        <FormField name="notifications" label="Notifications">
          <Switch />
        </FormField>

        <FormField name="theme" label="Theme">
          <Select
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </FormField>
      </FormSection>

      <FormActions align="right">
        <Button variant="ghost" onClick={() => form.reset()}>Cancel</Button>
        <Button type="submit">Save</Button>
      </FormActions>
    </Form>
  )
}
```

#### Form State Access

```tsx
const form = useForm({ values: {...} })

// Read values
form.values              // All values
form.getValue('email')   // Single value

// Set values
form.setValue('email', 'new@email.com')
form.setValues({ email: 'new@email.com', name: 'New Name' })

// Errors
form.errors              // All errors
form.getError('email')   // Single error
form.setError('email', 'Custom error')
form.setErrors({ email: 'Error 1', name: 'Error 2' })

// Touched state
form.touched             // All touched
form.isTouched('email')  // Single field
form.setTouched('email') // Mark as touched

// Form state
form.dirty               // Any field changed from initial
form.valid               // No errors
form.submitting          // Submit in progress
form.submitted           // Submit completed

// Validation
await form.validateField('email')
const isValid = await form.validateAll()

// Operations
await form.submit()      // Validate + call onSubmit
form.reset()             // Reset to initial values
form.reset({ email: '' }) // Reset with new values
form.clear()             // Empty all fields

// Field props (for custom binding)
const props = form.getFieldProps('email')
// { value, onChange, onBlur, error, touched, disabled }
const props = form.field('email')  // Alias
```

#### Specialized Form Inputs

```tsx
import { PhoneInput, OTPInput, PinInput } from 'protomobilekit'

// Phone input with country code
<FormField name="phone" label="Phone">
  <PhoneInput
    defaultCountry="US"
    placeholder="(555) 123-4567"
  />
</FormField>

// OTP input (verification code)
<OTPInput
  length={6}
  onComplete={(code) => verifyCode(code)}
  autoFocus
/>

// PIN input (secure)
<PinInput
  length={4}
  secure  // Hide digits
  onComplete={(pin) => verifyPin(pin)}
/>
```

#### Form Wizard

```tsx
import { FormWizard, useWizard } from 'protomobilekit'

function MultiStepForm() {
  return (
    <FormWizard
      steps={[
        {
          id: 'personal',
          title: 'Personal Info',
          component: PersonalInfoStep,
        },
        {
          id: 'address',
          title: 'Address',
          component: AddressStep,
        },
        {
          id: 'payment',
          title: 'Payment',
          component: PaymentStep,
        },
      ]}
      onComplete={(data) => submitForm(data)}
    />
  )
}

function PersonalInfoStep() {
  const { next, data, setData } = useWizard()

  return (
    <div>
      <Input
        value={data.name || ''}
        onChange={(e) => setData({ name: e.target.value })}
      />
      <Button onClick={next}>Continue</Button>
    </div>
  )
}
```

---

### Frames & Flows

Define screen frames and user flows for documentation and testing.

#### Define Frames

```tsx
import { defineFrames, createFrame } from 'protomobilekit'

// Create reusable frame definitions
const homeFrame = createFrame({
  id: 'home',
  name: '1.1 Home',
  description: 'Restaurant list with search and filters',
  component: HomeScreen,
  tags: ['main', 'entry'],
})

const menuFrame = createFrame({
  id: 'menu',
  name: '1.2 Menu',
  description: 'Restaurant menu with categories',
  component: MenuScreen,
  tags: ['menu'],
  // Custom navigation handler
  onNavigate: (nav) => {
    nav.navigate('menu', { restaurantId: 'demo' })
  },
})

const cartFrame = createFrame({
  id: 'cart',
  name: '1.3 Cart',
  description: 'Shopping cart with order summary',
  component: CartScreen,
  tags: ['checkout'],
})

// Register frames for an app
defineFrames({
  appId: 'customer',
  appName: 'Customer App',
  initial: 'home',
  frames: [homeFrame, menuFrame, cartFrame],
})
```

#### Define Flows

```tsx
import { defineFlow, getFlowProgress, toggleStepComplete, toggleTaskComplete } from 'protomobilekit'

// Define user flow (journey)
defineFlow({
  id: 'order-flow',
  name: 'Order Journey',
  description: 'Complete flow from browsing to order delivery',
  appId: 'customer',
  steps: [
    {
      frame: homeFrame,
      tasks: ['Browse restaurants', 'Use search', 'Apply filters'],
    },
    {
      frame: menuFrame,
      tasks: ['View menu', 'Add items to cart', 'Customize order'],
    },
    {
      frame: cartFrame,
      tasks: ['Review order', 'Apply promo code', 'Proceed to checkout'],
    },
    {
      frame: checkoutFrame,
      tasks: ['Enter address', 'Select payment', 'Place order'],
    },
  ],
})

// Track flow progress
const progress = getFlowProgress('order-flow')
// { stepIndex: 1, completedSteps: [0], completedTasks: { 0: [0, 1] } }

// Toggle step completion
toggleStepComplete('order-flow', 0)  // Toggle step 0

// Toggle task completion
toggleTaskComplete('order-flow', 1, 2)  // Toggle task 2 in step 1
```

#### Frame Registry Access

```tsx
import {
  getAllApps,
  getAppFrames,
  getFrame,
  searchFrames,
  navigateToFrame,
} from 'protomobilekit'

// Get all registered apps
const apps = getAllApps()
// [{ appId, appName, frames, initial }, ...]

// Get frames for specific app
const customerFrames = getAppFrames('customer')

// Get specific frame
const frame = getFrame('customer', 'home')

// Search frames
const results = searchFrames('menu')
// [{ app: AppFrames, frame: Frame }, ...]

// Navigate to frame programmatically
navigateToFrame('customer', 'cart')
```

#### Frame Hooks

```tsx
import { useFrameRegistry, useAppFrames, useFrame } from 'protomobilekit'

function FrameList() {
  // All apps with frames
  const { apps, frameCount } = useFrameRegistry()

  // Frames for specific app
  const frames = useAppFrames('customer')

  // Specific frame
  const frame = useFrame('customer', 'home')

  return (...)
}
```

---

## UI Components

### Layout Components

#### Screen

Main screen wrapper with header/footer support.

```tsx
import { Screen, Header, BackButton } from 'protomobilekit'

<Screen
  header={<Header title="Home" />}
  footer={<TabBar />}
  scrollable={true}  // Enable scrolling (default: true)
  padding={true}     // Add padding (default: false)
>
  <Content />
</Screen>

// With back button
<Screen
  header={
    <Header
      title="Details"
      left={<BackButton />}
      right={<IconButton icon={<SettingsIcon />} onPress={openSettings} />}
    />
  }
>
```

#### Header

```tsx
<Header
  title="Page Title"
  subtitle="Optional subtitle"
  left={<BackButton />}
  right={<IconButton icon={<MenuIcon />} onPress={...} />}
  transparent={false}
  large={false}  // iOS large title style
/>
```

#### ScrollView

```tsx
<ScrollView
  horizontal={false}
  showsScrollIndicator={true}
  refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
>
  <Content />
</ScrollView>
```

#### Section

```tsx
<Section
  title="Section Title"
  subtitle="Optional description"
  action={<TextButton onPress={...}>See All</TextButton>}
>
  <Content />
</Section>
```

#### Card

```tsx
<Card
  variant="elevated"  // 'elevated' | 'outlined' | 'filled'
  padding="md"        // 'none' | 'sm' | 'md' | 'lg'
  onPress={() => ...} // Makes card clickable
>
  <Content />
</Card>
```

#### Divider & Spacer

```tsx
<Divider />
<Divider label="Or continue with" />

<Spacer size={16} />        // Fixed size in px
<Spacer size="md" />        // Preset: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
<Spacer size="flex" />      // Flexible spacer (flex: 1)
```

---

### Interactive Components

#### Button

```tsx
<Button
  variant="primary"   // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
  size="md"           // 'sm' | 'md' | 'lg'
  fullWidth={false}
  loading={false}
  disabled={false}
  icon={<PlusIcon />}
  iconRight={<ArrowIcon />}
  onClick={() => ...}
>
  Button Text
</Button>

// Text button (iOS style)
<TextButton
  color="primary"  // 'primary' | 'danger' | 'secondary'
  onPress={() => ...}
>
  Cancel
</TextButton>

// Icon button
<IconButton
  icon={<DeleteIcon />}
  variant="danger"
  size="md"
  onPress={() => ...}
/>
```

#### Input

```tsx
<Input
  label="Email"
  placeholder="your@email.com"
  type="email"        // HTML input types
  size="md"           // 'sm' | 'md' | 'lg'
  variant="outline"   // 'outline' | 'filled' | 'underline'
  error="Invalid email"
  helper="We'll never share your email"
  leftAddon={<EmailIcon />}
  rightAddon={<ClearButton />}
  disabled={false}
/>

// TextArea
<TextArea
  label="Description"
  rows={4}
  maxLength={500}
  showCount
/>
```

#### Select

```tsx
<Select
  label="Country"
  placeholder="Select country"
  value={country}
  onChange={setCountry}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
  ]}
  error="Please select a country"
/>

// Searchable select
<SearchableSelect
  label="City"
  options={cities}
  value={city}
  onChange={setCity}
  searchPlaceholder="Search cities..."
  emptyMessage="No cities found"
/>

// Autocomplete (with custom input)
<Autocomplete
  label="Product"
  options={suggestions}
  value={product}
  onChange={setProduct}
  onSearch={(query) => fetchSuggestions(query)}
  renderOption={(option) => (
    <div>{option.label} - ${option.price}</div>
  )}
/>
```

#### Switch & Checkbox

```tsx
<Switch
  label="Notifications"
  value={enabled}
  onChange={setEnabled}
/>

<Checkbox
  label="I agree to terms"
  checked={agreed}
  onChange={setAgreed}
/>

// Radio group
<RadioGroup
  label="Payment Method"
  value={payment}
  onChange={setPayment}
  options={[
    { value: 'card', label: 'Credit Card' },
    { value: 'cash', label: 'Cash on Delivery' },
    { value: 'wallet', label: 'Digital Wallet' },
  ]}
/>
```

#### Slider

```tsx
<Slider
  label="Volume"
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  step={1}
  showValue
/>
```

#### SearchBar

```tsx
<SearchBar
  value={query}
  onChange={setQuery}
  placeholder="Search..."
  onSubmit={(query) => search(query)}
  showCancel
  onCancel={() => setQuery('')}
/>
```

---

### Data Display

#### List & ListItem

```tsx
<List
  items={orders}
  keyExtractor={(o) => o.id}
  renderItem={(order, index) => (
    <ListItem
      left={<Avatar src={order.avatar} />}
      right={<Badge>{order.status}</Badge>}
      subtitle={`$${order.total}`}
      description={order.address}
      onPress={() => openOrder(order.id)}
      showChevron
    >
      Order #{order.id}
    </ListItem>
  )}
  dividers={true}
  dividerInset="left"  // 'none' | 'left' | 'both'
  header="Recent Orders"
  footer="Load more..."
  emptyContent={<Text>No orders yet</Text>}
/>

// MenuItem (for settings-like lists)
<MenuItem
  label="Account Settings"
  value="John Doe"
  icon={<UserIcon />}
  onPress={() => navigate('settings')}
/>
```

#### Avatar

```tsx
<Avatar
  src="https://example.com/photo.jpg"
  name="John Doe"  // Fallback initials
  size="md"        // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
/>

// Avatar group
<AvatarGroup
  avatars={[
    { src: '...', name: 'Alice' },
    { src: '...', name: 'Bob' },
    { src: '...', name: 'Charlie' },
  ]}
  max={3}
  size="sm"
/>
```

#### Badge & Chip

```tsx
<Badge variant="primary">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="info">Info</Badge>

<Chip
  label="React"
  onPress={() => selectTag('react')}
  selected={selectedTags.includes('react')}
  dismissible
  onDismiss={() => removeTag('react')}
/>
```

#### Status Badges

```tsx
// Generic status badge
<StatusBadge
  status="active"
  config={{
    active: { label: 'Active', color: '#22c55e' },
    inactive: { label: 'Inactive', color: '#ef4444' },
    pending: { label: 'Pending', color: '#f59e0b' },
  }}
/>

// Pre-built status badges
<OrderStatusBadge status="delivered" />
<UserStatusBadge status="online" />
```

#### InfoRow & InfoGroup

```tsx
<InfoRow label="Email" value="john@example.com" />
<InfoRow label="Phone" value="+1 234 567 890" copyable />
<InfoRow label="Website" value="example.com" onPress={() => openUrl('...')} />

<InfoGroup
  items={[
    { label: 'Name', value: 'John Doe' },
    { label: 'Email', value: 'john@example.com' },
    { label: 'Role', value: 'Admin' },
  ]}
/>
```

#### StatCard & DashboardStats

```tsx
<StatCard
  title="Total Orders"
  value={1234}
  change={+12.5}  // Percentage change
  icon={<OrdersIcon />}
/>

<StatGrid
  stats={[
    { title: 'Orders', value: 1234, change: +5 },
    { title: 'Revenue', value: '$12,345', change: +12 },
    { title: 'Customers', value: 567, change: -2 },
  ]}
  columns={3}
/>

<DashboardStats
  stats={[...]}
  layout="grid"  // 'grid' | 'row'
/>
```

#### Tabs

```tsx
<Tabs
  tabs={[
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active', badge: 5 },
    { id: 'completed', label: 'Completed' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>

// Tab bar (bottom navigation style)
<TabBar
  items={[
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'orders', label: 'Orders', icon: <OrdersIcon />, badge: 3 },
    { id: 'profile', label: 'Profile', icon: <UserIcon /> },
  ]}
  activeItem={activeTab}
  onChange={setActiveTab}
/>
```

#### Accordion

```tsx
<AccordionGroup>
  <AccordionItem title="Section 1" defaultOpen>
    <Text>Content 1</Text>
  </AccordionItem>
  <AccordionItem title="Section 2">
    <Text>Content 2</Text>
  </AccordionItem>
</AccordionGroup>

// Single accordion
<Accordion
  title="Show Details"
  open={isOpen}
  onChange={setIsOpen}
>
  <Content />
</Accordion>
```

#### Carousel

```tsx
<Carousel
  items={[
    { id: '1', image: '...', title: 'Slide 1' },
    { id: '2', image: '...', title: 'Slide 2' },
  ]}
  renderItem={(item) => (
    <div>
      <img src={item.image} />
      <Text>{item.title}</Text>
    </div>
  )}
  autoPlay
  interval={5000}
  showDots
  showArrows
/>
```

---

### Menus

```tsx
// Dropdown menu
<DropdownMenu
  trigger={<IconButton icon={<MoreIcon />} onPress={() => {}} />}
  items={[
    { label: 'Edit', icon: <EditIcon />, onPress: () => ... },
    { label: 'Share', icon: <ShareIcon />, onPress: () => ... },
    { type: 'divider' },
    { label: 'Delete', icon: <DeleteIcon />, onPress: () => ..., destructive: true },
  ]}
/>

// Horizontal scrolling menu
<HorizontalMenu
  items={categories}
  activeItem={activeCategory}
  onChange={setActiveCategory}
/>

// Context menu (long press)
<ContextMenu
  items={[...]}
  onItemPress={(item) => ...}
>
  <Card>Long press me</Card>
</ContextMenu>
```

---

### Overlays

#### Modal

```tsx
<Modal
  visible={isVisible}
  onClose={() => setVisible(false)}
  title="Edit Profile"
  size="md"  // 'sm' | 'md' | 'lg' | 'full'
>
  <Form>...</Form>
</Modal>
```

#### BottomSheet

```tsx
<BottomSheet
  visible={isVisible}
  onClose={() => setVisible(false)}
  title="Select Option"
  snapPoints={['25%', '50%', '90%']}
>
  <Content />
</BottomSheet>
```

#### ActionSheet

```tsx
<ActionSheet
  visible={isVisible}
  onClose={() => setVisible(false)}
  title="Choose Action"
  options={[
    { label: 'Take Photo', icon: <CameraIcon />, onPress: takePhoto },
    { label: 'Choose from Library', icon: <GalleryIcon />, onPress: pickImage },
    { label: 'Delete', onPress: deleteImage, destructive: true },
  ]}
  cancelLabel="Cancel"
/>
```

#### Alert & Confirm

```tsx
<Alert
  visible={showAlert}
  title="Error"
  message="Something went wrong"
  buttons={[
    { text: 'OK', onPress: () => setShowAlert(false) },
  ]}
/>

<Confirm
  visible={showConfirm}
  title="Delete Item?"
  message="This action cannot be undone"
  confirmText="Delete"
  cancelText="Cancel"
  destructive
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>

<Prompt
  visible={showPrompt}
  title="Enter Name"
  placeholder="Your name"
  onSubmit={(value) => setName(value)}
  onCancel={() => setShowPrompt(false)}
/>
```

#### Toast

```tsx
import { ToastProvider, useToast } from 'protomobilekit'

// Wrap app with provider
<ToastProvider position="top">
  <App />
</ToastProvider>

// Use in components
function MyComponent() {
  const toast = useToast()

  const showToasts = () => {
    toast.success('Operation successful!')
    toast.error('Something went wrong')
    toast.warning('Please check your input')
    toast.info('New update available')

    // Custom toast
    toast.show({
      type: 'success',
      title: 'Order Placed',
      message: 'Your order #123 is confirmed',
      duration: 5000,
      action: { label: 'View', onPress: () => ... },
    })
  }
}
```

#### ImageViewer

```tsx
<ImageViewer
  visible={isVisible}
  images={[
    { uri: '...', title: 'Photo 1' },
    { uri: '...', title: 'Photo 2' },
  ]}
  initialIndex={0}
  onClose={() => setVisible(false)}
/>

// Gallery component
<Gallery
  images={photos}
  columns={3}
  gap={4}
  onImagePress={(index) => openViewer(index)}
/>
```

---

### Pickers

```tsx
// Date picker
<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date()}
  maxDate={addMonths(new Date(), 3)}
  format="MMMM D, YYYY"
/>

// Time picker
<TimePicker
  value={time}
  onChange={setTime}
  minuteInterval={15}
  is24Hour={false}
/>

// Date + Time picker
<DateTimePicker
  value={datetime}
  onChange={setDatetime}
/>

// Calendar
<Calendar
  selected={selectedDate}
  onSelect={setSelectedDate}
  markedDates={{
    '2024-01-15': { marked: true, dotColor: 'red' },
    '2024-01-20': { marked: true, dotColor: 'blue' },
  }}
/>
```

---

### Feedback

```tsx
// Spinner
<Spinner size="md" color="#000" />

// Loading overlay
<LoadingOverlay visible={loading} message="Processing..." />

// Progress bar
<ProgressBar value={75} showLabel />
<ProgressBar indeterminate />  // Animated loading

// Circular progress
<CircularProgress value={60} size={80} strokeWidth={8} />
<CircularProgress indeterminate />
```

---

### FAB & SpeedDial

```tsx
// Floating Action Button
<FAB
  icon={<PlusIcon />}
  onPress={handleAdd}
  position="bottom-right"
/>

// Speed dial (expandable FAB)
<SpeedDial
  icon={<PlusIcon />}
  actions={[
    { icon: <CameraIcon />, label: 'Photo', onPress: takePhoto },
    { icon: <FileIcon />, label: 'Document', onPress: pickDocument },
    { icon: <LocationIcon />, label: 'Location', onPress: shareLocation },
  ]}
/>
```

---

### Currency Components

```tsx
import { CurrencyInput, AmountInput, PriceRange, formatCurrency } from 'protomobilekit'

// Currency input
<CurrencyInput
  value={amount}
  onChange={setAmount}
  currency="USD"
/>

// Amount input with +/- buttons
<AmountInput
  value={quantity}
  onChange={setQuantity}
  min={1}
  max={99}
/>

// Price range slider
<PriceRange
  min={0}
  max={1000}
  value={[minPrice, maxPrice]}
  onChange={([min, max]) => setPriceRange(min, max)}
  currency="USD"
/>

// Format currency
formatCurrency(1234.56, 'USD')  // "$1,234.56"
formatCurrency(1000, 'EUR')    // "€1,000.00"
formatCurrency(5000, 'RUB')    // "5 000 ₽"
```

---

### Onboarding

```tsx
<Onboarding
  slides={[
    {
      image: '/onboarding-1.png',
      title: 'Welcome',
      description: 'Start your journey with us',
    },
    {
      image: '/onboarding-2.png',
      title: 'Easy Ordering',
      description: 'Order your favorite food in seconds',
    },
    {
      image: '/onboarding-3.png',
      title: 'Fast Delivery',
      description: 'Get your order delivered quickly',
    },
  ]}
  onComplete={() => navigate('login')}
  onSkip={() => navigate('login')}
  showSkip
/>
```

---

### Error Handling

```tsx
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <Text>Something went wrong: {error.message}</Text>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

---

## Theming

### ThemeProvider

```tsx
import { ThemeProvider, useTheme, usePlatform, platformSelect } from 'protomobilekit'

<ThemeProvider
  defaultPlatform="ios"  // 'ios' | 'android'
  colors={{
    primary: '#007AFF',
    danger: '#FF3B30',
    // ... override any color
  }}
>
  <App />
</ThemeProvider>
```

### useTheme Hook

```tsx
function MyComponent() {
  const { platform, colors } = useTheme()

  return (
    <div style={{ backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text }}>
        Platform: {platform}
      </Text>
    </div>
  )
}
```

### Available Colors

```tsx
interface ThemeColors {
  primary: string        // #000000
  primaryText: string    // #FFFFFF
  background: string     // #F5F5F5
  surface: string        // #FFFFFF
  surfaceSecondary: string // #F5F5F5
  text: string           // #000000
  textSecondary: string  // #666666
  border: string         // #E5E5E5
  danger: string         // #FF3B30 (iOS) / #F44336 (Android)
  success: string        // #34C759 (iOS) / #4CAF50 (Android)
  warning: string        // #FF9500 (iOS) / #FF9800 (Android)
  info: string           // #007AFF (iOS) / #2196F3 (Android)
}
```

### Platform Selection

```tsx
const { platform } = useTheme()
const isIOS = usePlatform() === 'ios'

// Conditional value based on platform
const borderRadius = platformSelect({
  ios: 10,
  android: 8,
})
```

---

## Utilities

### Date & Time

```tsx
import {
  dayjs,
  formatDate,
  timeAgo,
  smartDate,
  isDateToday,
  addTime,
  formatDuration,
} from 'protomobilekit'

// Format date
formatDate(new Date(), 'short')      // "Jan 15"
formatDate(new Date(), 'long')       // "January 15, 2025"
formatDate(new Date(), 'YYYY-MM-DD') // "2025-01-15"

// Relative time
timeAgo(Date.now() - 60000)          // "1 minute ago"
timeFromNow(Date.now() + 3600000)    // "in 1 hour"

// Smart date (today/yesterday/date)
smartDate(new Date())                // "Today, 3:45 PM"
smartDateShort(new Date())           // "Today"

// Date checks
isDateToday(new Date())              // true
isDateYesterday(yesterday)           // true
isPast(pastDate)                     // true
isFuture(futureDate)                 // true

// Date math
addTime(new Date(), 1, 'day')
subtractTime(new Date(), 1, 'week')
dateDiff(date1, date2, 'days')

// Duration formatting
formatDuration(3600000)              // "1:00:00"
formatDurationHuman(3600000)         // "1 hour"

// Full dayjs access
dayjs().add(1, 'month').format('MMMM')
```

### Class Names

```tsx
import { cn } from 'protomobilekit'

// Merge class names with tailwind-merge
cn('px-4 py-2', isActive && 'bg-black', className)
```

### Locale

```tsx
import { setLocale, getLocale, useLocale, isRTL, LOCALES } from 'protomobilekit'

// Set locale at app startup
setLocale('he')  // Hebrew

// Available locales
// 'en' | 'ru' | 'he' | 'ar'

// Check RTL
if (isRTL()) {
  // Apply RTL styles
}

// Use in components
function MyComponent() {
  const locale = useLocale()

  return (
    <Button>{locale.submit}</Button>  // Localized text
  )
}
```

---

## DevTools

### DevTools Component

```tsx
import { DevTools } from 'protomobilekit'

<DevTools
  position="right"      // 'left' | 'right'
  devOnly={false}       // Show in production (for prototyping)
  draggable={true}      // Allow dragging
  defaultTab="frames"   // 'state' | 'events' | 'frames' | 'auth' | 'flows'
  showState={true}      // Show State tab
  showEvents={true}     // Show Events tab
  showFrames={true}     // Show Frames tab
  showAuth={true}       // Show Auth tab
  showFlows={true}      // Show Flows tab
/>
```

### DevTools Features

1. **State Inspector** - View and edit entity store
2. **Event Log** - Real-time event stream
3. **Frame Browser** - Navigate to any registered frame
4. **Auth Panel** - Quick user switching
5. **Flows Panel** - Track user journey progress

### Individual Panels

```tsx
import { StateInspector, EventLog, FrameBrowser } from 'protomobilekit'

// Use panels separately
<StateInspector embedded />
<EventLog embedded />
<FrameBrowser embedded />
```

---

## TypeScript

All components are fully typed. Import types as needed:

```tsx
import type {
  // Core
  Entity,
  EntitySchema,
  Store,
  StoreState,
  MobileKitConfig,
  QueryOptions,

  // Entity
  FieldType,
  FieldDefinition,
  EntityDefinition,
  InferEntity,

  // Auth
  AuthUser,
  AuthState,
  TestUser,
  RoleDefinition,

  // Events
  EventRecord,
  EventHandler,

  // Navigation
  NavigatorProps,
  RouteParams,
  NavigationActions,

  // Forms
  FormState,
  UseFormReturn,
  Validator,

  // Canvas
  CanvasProps,
  AppDefinition,
  DeviceType,

  // Frames
  Frame,
  Flow,
  FlowStep,

  // UI Components
  ButtonProps,
  InputProps,
  ListProps,
  ModalProps,
  // ... and many more
} from 'protomobilekit'
```

---

## License

MIT
