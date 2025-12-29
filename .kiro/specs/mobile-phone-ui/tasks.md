# Implementation Plan: Mobile Phone UI

## Overview

This plan implements an iPhone-style mobile interface for the WebOS portfolio. The implementation follows a bottom-up approach: first creating the atomic components (icons, status bar), then composing them into larger structures (home screen, app container), and finally integrating with the main App.tsx for device-based routing.

## Tasks

- [x] 1. Create mobile component directory and base types
  - Create `webos-ui/src/components/mobile/` directory
  - Add mobile-specific types to `types/index.ts` (MobileApp interface)
  - Create mobile app configuration constant
  - _Requirements: 2.2, 2.3, 3.1_

- [x] 2. Implement StatusBar component
  - [x] 2.1 Create StatusBar.tsx with time, battery, and signal indicators
    - Display current time in HH:MM format (center)
    - Display signal bars icon (left)
    - Display WiFi icon (left)
    - Display battery percentage and icon (right)
    - Semi-transparent background styling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 2.2 Write property test for time format
    - **Property 7: Time Format Validity**
    - **Validates: Requirements 5.1**

- [x] 3. Implement MobileAppIcon component
  - [x] 3.1 Create MobileAppIcon.tsx with iOS-style rounded square design
    - Rounded square container with gradient background
    - Centered emoji/icon display
    - App name label below icon
    - Tap handler for opening apps
    - Long-press handler for wiggle animation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.2 Write property test for app icon labels
    - **Property 3: App Icon Labels Present**
    - **Validates: Requirements 2.5**

- [x] 4. Implement AppGrid component
  - [x] 4.1 Create AppGrid.tsx with 4-column grid layout
    - CSS Grid with 4 columns
    - Responsive spacing between icons
    - Map apps to MobileAppIcon components
    - Handle tap events to parent
    - _Requirements: 2.2, 2.5_

  - [ ]* 4.2 Write property test for grid column layout
    - **Property 2: App Grid Column Layout**
    - **Validates: Requirements 2.2**

- [x] 5. Implement Dock component
  - [x] 5.1 Create Dock.tsx with frosted glass styling
    - Fixed position at bottom
    - Frosted glass background effect (backdrop-blur)
    - Display exactly 4 app icons
    - Tap handlers for opening apps
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.2 Write unit test for dock app count
    - Verify dock always renders exactly 4 apps
    - _Requirements: 6.2_

- [x] 6. Implement HomeIndicator component
  - Create HomeIndicator.tsx with bottom swipe bar
  - Horizontal pill-shaped indicator
  - Touch event handling for swipe-up gesture
  - _Requirements: 2.4, 7.3_

- [x] 7. Implement MobileNavBar component
  - Create MobileNavBar.tsx for full-screen apps
  - Back button (left)
  - App title (center)
  - Tap handler for closing app
  - _Requirements: 4.2, 4.3_

- [x] 8. Implement MobileAppContainer component
  - [x] 8.1 Create MobileAppContainer.tsx as full-screen wrapper
    - Full viewport dimensions (100vw × 100vh)
    - Include MobileNavBar at top
    - Render app content in scrollable container
    - Handle swipe-up gesture to close
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 8.2 Write property test for full-screen dimensions
    - **Property 6: Full-Screen App Dimensions**
    - **Validates: Requirements 4.1**

- [x] 9. Implement HomeScreen component
  - [x] 9.1 Create HomeScreen.tsx composing AppGrid and Dock
    - Wallpaper background (from settings)
    - StatusBar at top
    - AppGrid in scrollable area
    - Dock at bottom (above HomeIndicator)
    - HomeIndicator at very bottom
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]* 9.2 Write property test for dock visibility
    - **Property 8: Dock Visibility State**
    - **Validates: Requirements 6.5**

- [x] 10. Implement MobilePhone root component
  - [x] 10.1 Create MobilePhone.tsx managing app state and navigation
    - State: currentApp, isControlCenterOpen
    - Render HomeScreen when currentApp is null
    - Render MobileAppContainer with app content when currentApp is set
    - Handle app open/close transitions
    - Pass same props as Desktop (onRestart, onShutdown, recentApps)
    - _Requirements: 3.4, 4.1, 4.3, 4.4, 6.5_

  - [ ]* 10.2 Write property test for app opening on tap
    - **Property 4: App Opening on Tap**
    - **Validates: Requirements 3.4, 6.4, 7.4**

  - [ ]* 10.3 Write property test for app closing returns to home
    - **Property 5: App Closing Returns to Home**
    - **Validates: Requirements 4.3, 4.4, 7.3**

- [x] 11. Checkpoint - Ensure all mobile components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Update App.tsx for device-based routing
  - [x] 12.1 Integrate useDeviceType hook in App.tsx
    - Import useDeviceType hook
    - Conditionally render MobilePhone or Desktop based on device type
    - Pass same props to both components
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 12.2 Write property test for device detection
    - **Property 1: Device Detection Correctness**
    - **Validates: Requirements 1.1, 1.2, 1.4**

- [x] 13. Adapt existing apps for mobile display
  - [x] 13.1 Create mobile-optimized Terminal wrapper
    - Touch-friendly input
    - Larger font size
    - Full-width layout
    - _Requirements: 8.1_

  - [x] 13.2 Create mobile-optimized Settings wrapper
    - Scrollable list format
    - Touch-friendly controls
    - _Requirements: 8.2_

  - [x] 13.3 Create mobile-optimized FileExplorer wrapper
    - List view instead of grid
    - Touch-friendly file items
    - _Requirements: 8.3_

  - [x] 13.4 Verify Minesweeper touch support
    - Ensure tap works for revealing cells
    - Ensure long-press works for flagging
    - _Requirements: 8.5_

- [x] 14. Implement touch gestures
  - [x] 14.1 Add swipe-up gesture detection to MobileAppContainer
    - Detect upward swipe from bottom edge
    - Trigger app close on successful swipe
    - _Requirements: 7.3_

  - [x] 14.2 Add swipe gesture for home screen pages (optional)
    - Left/right swipe detection
    - Page transition animation
    - _Requirements: 7.1_

- [x] 15. Final checkpoint - Full integration testing
  - Ensure all tests pass, ask the user if questions arise.
  - Test on actual mobile device or emulator
  - Verify all apps open and close correctly
  - Verify gestures work as expected

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses fast-check for property-based testing in TypeScript

