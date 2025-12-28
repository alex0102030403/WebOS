# Implementation Plan: Settings App

## Overview

This plan implements the Settings app feature following the existing WebOS app patterns. Tasks are ordered to build incrementally: store utilities first, then context provider, then UI components, and finally integration with the Desktop.

## Tasks

- [x] 1. Create Settings Store utilities
  - [x] 1.1 Create settings store with load, save, and getDefaults functions
    - Create `webos-ui/src/store/settings.ts`
    - Implement `load()` to read from localStorage with fallback to defaults
    - Implement `save(settings)` to persist to localStorage as JSON
    - Implement `getDefaults()` returning DEFAULT_SETTINGS constant
    - Define SETTINGS_STORAGE_KEY constant
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 1.2 Create validation functions
    - Implement `isValidFontSize(size)` checking range 12-24 with step 2
    - Implement `isValidUrl(url)` checking http/https protocol
    - _Requirements: 2.4, 2.5, 3.5_

  - [ ]* 1.3 Write property test for settings persistence round-trip
    - **Property 1: Settings persistence round-trip**
    - Generate random valid SettingsState objects
    - Save then load, assert equality
    - **Validates: Requirements 2.2, 3.3, 4.1, 4.2, 4.4**

  - [ ]* 1.4 Write property test for font size validation
    - **Property 2: Font size validation**
    - Generate random integers, verify validation logic
    - **Validates: Requirements 2.4, 2.5**

  - [ ]* 1.5 Write property test for URL validation
    - **Property 3: URL validation**
    - Generate random strings and valid URLs
    - **Validates: Requirements 3.5**

- [x] 2. Create Settings Context provider
  - [x] 2.1 Create SettingsContext and SettingsProvider
    - Create `webos-ui/src/context/SettingsContext.tsx`
    - Define SettingsState and SettingsContextValue interfaces
    - Implement SettingsProvider with useState for settings
    - Load initial settings from store on mount
    - Implement updateFontSize, updateWallpaper, resetToDefaults functions
    - Auto-save to store when settings change
    - _Requirements: 2.2, 2.3, 3.3, 3.4, 5.2_

  - [x] 2.2 Create useSettings hook
    - Export useSettings hook for consuming context
    - Throw error if used outside provider
    - _Requirements: 1.2_

  - [ ]* 2.3 Write property test for reset restores defaults
    - **Property 5: Reset restores defaults**
    - Generate random settings, call reset, verify defaults
    - **Validates: Requirements 5.2**

- [x] 3. Checkpoint - Verify store and context
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create Settings UI components
  - [x] 4.1 Create FontSizeSlider component
    - Create `webos-ui/src/components/settings/FontSizeSlider.tsx`
    - Render slider input with range 12-24, step 2
    - Display current value and preview text
    - Call onChange with validated values only
    - _Requirements: 2.1, 2.4_

  - [x] 4.2 Create WallpaperPicker component
    - Create `webos-ui/src/components/settings/WallpaperPicker.tsx`
    - Display grid of preset wallpaper thumbnails
    - Add custom URL input field with validation
    - Show preview of selected wallpaper
    - Handle image load errors gracefully
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [x] 4.3 Create main Settings component
    - Create `webos-ui/src/components/settings/Settings.tsx`
    - Add window header with title and close button
    - Integrate FontSizeSlider and WallpaperPicker
    - Add Reset to Defaults button with confirmation dialog
    - Use useSettings hook for state management
    - _Requirements: 1.2, 5.1, 6.1, 6.2_

  - [ ]* 4.4 Write unit tests for Settings components
    - Test FontSizeSlider renders with correct value
    - Test WallpaperPicker displays presets
    - Test Settings component close button
    - _Requirements: 1.2, 2.1, 3.1_

- [x] 5. Integrate with Desktop
  - [x] 5.1 Wrap App with SettingsProvider
    - Update `webos-ui/src/App.tsx` to wrap content with SettingsProvider
    - _Requirements: 4.2_

  - [x] 5.2 Add Settings app to Desktop
    - Add settings to APP_CONFIG in Desktop.tsx
    - Add Settings shortcut to DEMO_ICONS
    - Render Settings in DraggableWindow when open
    - _Requirements: 1.1, 1.3_

  - [x] 5.3 Apply settings to Desktop styling
    - Use useSettings in Desktop to get current settings
    - Apply wallpaperUrl to background style
    - Apply fontSize to root element or CSS variable
    - _Requirements: 2.3, 3.4, 5.3, 6.3_

  - [ ]* 5.4 Write property test for app opening idempotence
    - **Property 4: App opening idempotence**
    - Test that opening already-open app doesn't duplicate
    - **Validates: Requirements 1.3**

- [x] 6. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- fast-check library is used for property-based testing with Vitest
