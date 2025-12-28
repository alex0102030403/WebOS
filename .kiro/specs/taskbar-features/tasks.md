# Implementation Plan: Taskbar Features

## Overview

This plan implements the Windows icon power menu and search panel features for the WebOS Portfolio taskbar. Tasks are ordered to build the PowerMenu first (simpler), then the SearchPanel, and finally wire everything together with state management in App.tsx.

## Tasks

- [ ] 1. Implement PowerMenu Component
  - [ ] 1.1 Create PowerMenu component with restart and shutdown options
    - Create `webos-ui/src/components/desktop/PowerMenu.tsx`
    - Implement PowerMenuProps interface with isOpen, onClose, onRestart, onShutdown
    - Render backdrop overlay for click-outside detection
    - Display "Restart" option with restart icon (🔄 or SVG)
    - Display "Shutdown" option with power icon (⏻ or SVG)
    - Style with dark theme, rounded corners, backdrop blur
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.2 Write property test for PowerMenu toggle and click-outside
    - **Property 1: Menu Toggle Consistency**
    - **Property 2: Click-Outside Closes Menus**
    - Test that clicking Windows icon toggles menu visibility
    - Test that clicking backdrop closes the menu
    - **Validates: Requirements 1.1, 1.2**

- [ ] 2. Implement SearchPanel Component
  - [ ] 2.1 Create SearchPanel component structure
    - Create `webos-ui/src/components/desktop/SearchPanel.tsx`
    - Implement SearchPanelProps interface
    - Create RecentApp type in types/index.ts
    - Render backdrop overlay for click-outside detection
    - Create two-column layout (Recent left, Quick searches + Top apps right)
    - Style with dark theme matching Windows 11 aesthetics
    - _Requirements: 2.1, 2.2, 6.1, 6.2, 6.3, 6.4_

  - [ ] 2.2 Implement search input with filtering
    - Add search input field at top of panel
    - Implement search state and onChange handler
    - Filter displayed apps based on search query (case-insensitive)
    - _Requirements: 2.3, 2.4_

  - [ ]* 2.3 Write property test for search filtering
    - **Property 4: Search Filtering Accuracy**
    - Generate random search queries and app lists
    - Verify filtered results contain only matching apps
    - **Validates: Requirements 2.4**

  - [ ] 2.4 Implement Recent Apps section
    - Display "Recent" section header
    - Render list of recent apps (max 5) with icon and name
    - Show placeholder "No recent apps" when list is empty
    - Handle app click to trigger onAppClick callback
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.5 Write property test for recent apps constraints
    - **Property 5: Recent Apps List Size Constraint**
    - Generate random lists of recent apps
    - Verify displayed count is at most 5
    - **Validates: Requirements 3.2**

  - [ ] 2.6 Implement Top Apps grid section
    - Display "Top apps" section header
    - Render 6 apps in 3x2 grid layout
    - Each app shows icon and name
    - Handle app click to trigger onAppClick callback
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 2.7 Implement Quick Search section
    - Display "Quick searches" section header
    - Render 6 quick search chips: Focus settings, Sound settings, Bluetooth & devices, Display settings, Color settings, Search settings
    - Handle chip click (placeholder action for now)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.8 Write property test for grid items display
    - **Property 8: Grid Items Display Required Elements**
    - Verify all Top Apps and Quick Search items render icon and name
    - **Validates: Requirements 4.3, 5.3**

- [ ] 3. Checkpoint - Components Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Integrate with Taskbar and App State
  - [ ] 4.1 Update Taskbar to manage PowerMenu and SearchPanel state
    - Add isPowerMenuOpen and isSearchPanelOpen state to Taskbar
    - Update Windows icon click to toggle PowerMenu
    - Update search bar click to toggle SearchPanel
    - Pass onRestart and recentApps props through
    - Render PowerMenu and SearchPanel components
    - _Requirements: 1.1, 2.1_

  - [ ] 4.2 Update App.tsx with restart and recent apps state
    - Add recentApps state with useState<RecentApp[]>([])
    - Implement handleRestart function that clears recentApps and sets isBooted to false
    - Implement handleShutdown function that calls window.close()
    - Pass onRestart, onShutdown, and recentApps to Desktop
    - _Requirements: 1.5, 1.6, 3.5_

  - [ ]* 4.3 Write property test for restart behavior
    - **Property 3: Restart Resets Boot State**
    - **Property 6: Recent Apps Reset on Restart**
    - Verify restart sets isBooted to false
    - Verify restart clears recentApps array
    - **Validates: Requirements 1.5, 3.5**

  - [ ] 4.4 Update Desktop to pass props to Taskbar
    - Accept onRestart, onShutdown, recentApps props
    - Pass through to Taskbar component
    - _Requirements: 1.5, 3.4_

  - [ ]* 4.5 Write property test for app click callback
    - **Property 7: App Click Triggers Callback**
    - Verify clicking app invokes onAppClick with correct ID
    - **Validates: Requirements 3.4, 4.4**

- [ ] 5. Implement Recent Apps Tracking
  - [ ] 5.1 Add recent apps tracking when opening apps
    - Update Desktop to track app opens in recentApps state
    - Implement addRecentApp function that adds to front of list
    - Limit list to 5 most recent (remove oldest if over limit)
    - Avoid duplicates (move to front if already in list)
    - _Requirements: 3.2, 3.4, 3.5_

- [ ] 6. Final Checkpoint - Full Integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify Windows icon → PowerMenu → Restart/Shutdown flow
  - Verify Search bar → SearchPanel → Recent/Top apps flow
  - Verify restart replays BIOS sequence

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- PowerMenu is simpler and should be completed first
- SearchPanel has more complexity with multiple sections
- State flows: App.tsx → Desktop → Taskbar → PowerMenu/SearchPanel
- Property tests use fast-check with minimum 100 iterations

