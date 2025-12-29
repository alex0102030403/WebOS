# Design Document: Mobile Phone UI

## Overview

This design transforms the WebOS portfolio into an iPhone-style mobile interface when accessed from mobile devices. The system uses device detection to conditionally render either the existing Desktop component or a new MobilePhone component that mimics iOS aesthetics with a status bar, app grid, dock, and full-screen app presentation.

## Architecture

The mobile UI follows a component-based architecture that mirrors the existing desktop structure but adapts it for touch-first, full-screen mobile interaction.

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              useDeviceType() hook                        ││
│  │         (returns 'mobile' | 'desktop')                   ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│              ┌─────────────┴─────────────┐                  │
│              ▼                           ▼                   │
│     ┌─────────────────┐        ┌─────────────────┐          │
│     │    Desktop      │        │   MobilePhone   │          │
│     │  (existing)     │        │    (new)        │          │
│     └─────────────────┘        └─────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### MobilePhone Component Hierarchy

```
MobilePhone
├── PhoneFrame (iPhone bezel/notch visual)
│   ├── StatusBar (time, battery, signal)
│   ├── HomeScreen
│   │   ├── AppGrid (4-column icon grid)
│   │   │   └── MobileAppIcon[] (rounded square icons)
│   │   ├── PageIndicator (dots for multiple pages)
│   │   └── Dock (4 pinned apps)
│   └── HomeIndicator (bottom swipe bar)
├── MobileAppContainer (full-screen app wrapper)
│   ├── MobileNavBar (back button, title)
│   └── [App Content - adapted for mobile]
└── ControlCenter (swipe-down panel)
```

## Components and Interfaces

### MobilePhone Component

The root component for mobile view, managing app state and navigation.

```typescript
interface MobilePhoneProps {
  onRestart: () => void
  onShutdown: () => void
  recentApps: RecentApp[]
  onAddRecentApp: (app: Omit<RecentApp, 'timestamp'>) => void
}

interface MobilePhoneState {
  currentApp: string | null      // null = home screen
  isControlCenterOpen: boolean
  currentPage: number            // for multiple home screen pages
}
```

### StatusBar Component

Displays iOS-style status indicators.

```typescript
interface StatusBarProps {
  transparent?: boolean  // true when over wallpaper
}

// Renders: time (center), signal bars (left), wifi (left), battery (right)
```

### AppGrid Component

Displays apps in a 4-column iOS-style grid.

```typescript
interface AppGridProps {
  apps: MobileApp[]
  onAppTap: (appId: string) => void
  onAppLongPress: (appId: string) => void
}

interface MobileApp {
  id: string
  name: string
  icon: string           // emoji or image URL
  iconBackground?: string // gradient or solid color
}
```

### MobileAppIcon Component

Individual app icon with iOS styling.

```typescript
interface MobileAppIconProps {
  app: MobileApp
  onTap: () => void
  onLongPress: () => void
  isWiggling?: boolean   // edit mode animation
}
```

### Dock Component

Bottom dock with pinned apps.

```typescript
interface DockProps {
  apps: MobileApp[]      // exactly 4 apps
  onAppTap: (appId: string) => void
}
```

### MobileAppContainer Component

Full-screen wrapper for running apps.

```typescript
interface MobileAppContainerProps {
  appId: string
  appName: string
  onClose: () => void
  children: React.ReactNode
}
```

### HomeIndicator Component

The bottom bar for swipe gestures.

```typescript
interface HomeIndicatorProps {
  onSwipeUp: () => void
  visible: boolean
}
```

## Data Models

### Mobile App Configuration

```typescript
const MOBILE_APP_CONFIG: Record<string, MobileApp> = {
  terminal: { 
    id: 'terminal', 
    name: 'Terminal', 
    icon: '💻',
    iconBackground: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  },
  settings: { 
    id: 'settings', 
    name: 'Settings', 
    icon: '⚙️',
    iconBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  fileexplorer: { 
    id: 'fileexplorer', 
    name: 'Files', 
    icon: '📂',
    iconBackground: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  chrome: { 
    id: 'chrome', 
    name: 'Browser', 
    icon: '🌐',
    iconBackground: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  notepad: { 
    id: 'notepad', 
    name: 'Notes', 
    icon: '📝',
    iconBackground: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  minesweeper: { 
    id: 'minesweeper', 
    name: 'Minesweeper', 
    icon: '💣',
    iconBackground: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  paint: { 
    id: 'paint', 
    name: 'Paint', 
    icon: '🎨',
    iconBackground: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  },
  jshellstudio: { 
    id: 'jshellstudio', 
    name: 'JShell', 
    icon: '☕',
    iconBackground: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  cvviewer: { 
    id: 'cvviewer', 
    name: 'My CV', 
    icon: '📄',
    iconBackground: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  taskmanager: { 
    id: 'taskmanager', 
    name: 'Tasks', 
    icon: '📊',
    iconBackground: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
}

// Default dock apps
const DEFAULT_DOCK_APPS = ['terminal', 'fileexplorer', 'settings', 'chrome']
```

### Device Detection Enhancement

```typescript
// Enhanced useDeviceType hook
interface DeviceInfo {
  type: 'mobile' | 'desktop'
  isTouch: boolean
  screenWidth: number
  screenHeight: number
}
```

## Styling Approach

### iOS Design Tokens

```css
:root {
  /* iOS-style colors */
  --ios-status-bar-height: 44px;
  --ios-dock-height: 90px;
  --ios-home-indicator-height: 34px;
  --ios-icon-size: 60px;
  --ios-icon-radius: 13px;
  --ios-grid-gap: 20px;
  
  /* Frosted glass effect */
  --ios-blur: blur(20px);
  --ios-glass-bg: rgba(255, 255, 255, 0.2);
  
  /* Typography */
  --ios-icon-label-size: 11px;
}
```

### Icon Styling

```css
.mobile-app-icon {
  width: var(--ios-icon-size);
  height: var(--ios-icon-size);
  border-radius: var(--ios-icon-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mobile-app-icon-label {
  font-size: var(--ios-icon-label-size);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  margin-top: 4px;
  text-align: center;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Device Detection Correctness

*For any* screen width and touch capability combination, the Device_Detector SHALL return 'mobile' if and only if (screenWidth < 768 AND hasTouch) OR (screenWidth < 768), and 'desktop' otherwise.

**Validates: Requirements 1.1, 1.2, 1.4**

### Property 2: App Grid Column Layout

*For any* list of apps displayed in the AppGrid, the icons SHALL be arranged such that each row contains at most 4 icons, and icons fill rows left-to-right before starting a new row.

**Validates: Requirements 2.2**

### Property 3: App Icon Labels Present

*For any* app displayed in the AppGrid or Dock, the rendered output SHALL include the app's name as a visible text label.

**Validates: Requirements 2.5**

### Property 4: App Opening on Tap

*For any* app icon (in grid or dock), when a tap event is triggered on that icon, the MobilePhone state SHALL transition to show that app's id as the currentApp.

**Validates: Requirements 3.4, 6.4, 7.4**

### Property 5: App Closing Returns to Home

*For any* open app (currentApp !== null), when a close action is triggered (back button tap or swipe-up gesture), the MobilePhone state SHALL transition to currentApp === null (home screen).

**Validates: Requirements 4.3, 4.4, 7.3**

### Property 6: Full-Screen App Dimensions

*For any* open app on mobile, the MobileAppContainer dimensions SHALL equal the viewport dimensions (100vw × 100vh).

**Validates: Requirements 4.1**

### Property 7: Time Format Validity

*For any* time displayed in the StatusBar, the format SHALL match the pattern /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ (HH:MM or H:MM).

**Validates: Requirements 5.1**

### Property 8: Dock Visibility State

*For any* MobilePhone state, the Dock SHALL be visible if and only if currentApp === null (on home screen).

**Validates: Requirements 6.5**

## Error Handling

### Network Errors
- IF backend API calls fail, THEN the Mobile_Interface SHALL display demo/fallback data (same as desktop behavior)
- IF wallpaper URL fails to load, THEN the Mobile_Interface SHALL display a default gradient background

### Touch Event Errors
- IF touch events are not supported, THEN the Mobile_Interface SHALL fall back to click events
- IF gesture detection fails, THEN the Mobile_Interface SHALL provide button alternatives (visible back button)

### App Loading Errors
- IF an app component fails to load, THEN the MobileAppContainer SHALL display an error message with a close button
- IF app content exceeds viewport, THEN the MobileAppContainer SHALL enable scrolling

### State Recovery
- IF the app state becomes inconsistent (e.g., currentApp references non-existent app), THEN the MobilePhone SHALL reset to home screen state

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

1. **StatusBar time formatting** - Test that various Date objects produce correct HH:MM strings
2. **Device detection edge cases** - Test boundary conditions (exactly 768px width)
3. **Dock app count** - Verify dock always renders exactly 4 apps
4. **App state transitions** - Test opening and closing specific apps

### Property-Based Tests

Property-based tests verify universal properties across many generated inputs using **fast-check** library:

1. **Device detection property** - Generate random screen widths (0-2000) and touch booleans, verify correct interface selection
2. **App grid layout property** - Generate random app lists (1-20 apps), verify 4-column constraint
3. **App icon labels property** - Generate random app configurations, verify all have labels
4. **App open/close property** - Generate random app sequences, verify state transitions
5. **Time format property** - Generate random Date objects, verify HH:MM format output
6. **Dock visibility property** - Generate random state sequences, verify dock visibility matches currentApp state

### Testing Configuration

- Property tests: minimum 100 iterations per property
- Test framework: Vitest with fast-check for property-based testing
- Each property test tagged with: **Feature: mobile-phone-ui, Property {N}: {description}**

### Integration Tests

1. **Full flow test** - Simulate mobile viewport, verify MobilePhone renders instead of Desktop
2. **App navigation test** - Open app, verify full-screen, close app, verify home screen
3. **Gesture test** - Simulate swipe gestures, verify correct navigation

## File Structure

```
webos-ui/src/
├── components/
│   └── mobile/
│       ├── MobilePhone.tsx        # Root mobile component
│       ├── StatusBar.tsx          # iOS-style status bar
│       ├── HomeScreen.tsx         # Home screen with grid and dock
│       ├── AppGrid.tsx            # 4-column app icon grid
│       ├── MobileAppIcon.tsx      # Individual app icon
│       ├── Dock.tsx               # Bottom dock
│       ├── HomeIndicator.tsx      # Bottom swipe bar
│       ├── MobileAppContainer.tsx # Full-screen app wrapper
│       ├── MobileNavBar.tsx       # App navigation bar
│       └── ControlCenter.tsx      # Swipe-down panel
├── hooks/
│   └── useDeviceType.ts           # Enhanced device detection (existing)
└── App.tsx                        # Updated to conditionally render mobile/desktop
```

