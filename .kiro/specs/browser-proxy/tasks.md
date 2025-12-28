# Implementation Plan: Browser Proxy Subsystem

## Overview

This plan implements a secure, whitelist-based browser proxy for the WebOS portfolio. The implementation follows BCE architecture with a Java backend (BrowserService, BrowserResource) and React frontend (ChromeBrowser component).

## Tasks

- [x] 1. Add Jsoup dependency and create browser module structure
  - Add Jsoup 1.17.2 dependency to pom.xml
  - Create package structure: `io.webos.portfolio.browser.[boundary|control|entity]`
  - Create package-info.java for the browser module
  - _Requirements: 3.1_

- [x] 2. Implement BrowserConfig entity
  - [x] 2.1 Create BrowserConfig record with whitelist, user-agent, and custom styles
    - Define record with factory method for defaults
    - Include configurable allowed URL prefixes
    - _Requirements: 1.1, 2.2, 5.1_

- [x] 3. Implement BrowserService control layer
  - [x] 3.1 Implement URL whitelist validation (isAllowed method)
    - Check if URL starts with any allowed prefix
    - Return boolean result
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 3.2 Write property test for whitelist validation
    - **Property 1: URL Whitelist Validation**
    - **Validates: Requirements 1.2, 1.3**

  - [x] 3.3 Implement HTML sanitization (removeDangerousTags method)
    - Use Jsoup to parse HTML
    - Remove script, iframe, object, embed tags
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.4 Write property test for dangerous tag removal
    - **Property 2: Dangerous Tag Removal**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

  - [x] 3.5 Implement URL rewriting (rewriteRelativeUrls method)
    - Use Jsoup setBaseUri for URL resolution
    - Convert relative src/href/action to absolute URLs
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 3.6 Write property test for relative URL rewriting
    - **Property 3: Relative URL Rewriting**
    - **Validates: Requirements 4.1**

  - [x] 3.7 Implement style injection (injectStyles method)
    - Inject custom style block into head
    - Handle cases where head tag is missing
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 3.8 Write property test for style injection
    - **Property 4: Style Injection Presence**
    - **Validates: Requirements 5.1**

  - [x] 3.9 Implement content fetching (fetchContent method)
    - Use java.net.http.HttpClient
    - Set spoofed User-Agent header
    - Handle connection errors with appropriate exceptions
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.10 Implement main fetchAndSanitize method
    - Orchestrate validation, fetching, sanitization, rewriting, and style injection
    - Throw NotFoundException for blocked URLs
    - Throw BadGatewayException for fetch failures
    - _Requirements: 1.3, 2.3_

- [x] 4. Checkpoint - Backend service tests pass
  - Ensure all property tests pass
  - Ensure all unit tests pass
  - Ask the user if questions arise

- [x] 5. Implement BrowserResource boundary layer
  - [x] 5.1 Create BadGatewayException for 502 responses
    - Extend WebApplicationException
    - Return proper JSON error response
    - _Requirements: 2.3, 6.5_

  - [x] 5.2 Implement GET /browser/navigate endpoint
    - Accept url query parameter
    - Return text/html on success
    - Return 404 JSON for blocked URLs
    - Return 502 JSON for fetch failures
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.3 Write integration test for browser endpoint
    - Test successful proxy flow
    - Test blocked URL response
    - Test error response format
    - _Requirements: 6.3, 6.4, 6.5_

- [x] 6. Checkpoint - Backend complete
  - Ensure all backend tests pass
  - Verify endpoint responds correctly
  - Ask the user if questions arise

- [x] 7. Implement ChromeBrowser frontend component
  - [x] 7.1 Create ChromeBrowser component structure
    - Create component file at webos-ui/src/components/chrome/ChromeBrowser.tsx
    - Define component props and state interfaces
    - _Requirements: 7.1, 7.2_

  - [x] 7.2 Implement address bar with proxy URL construction
    - Display virtual URL in input
    - Construct proxy URL for iframe src
    - Handle URL submission
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 7.3 Write unit test for proxy URL construction
    - **Property 5: Proxy URL Construction**
    - **Validates: Requirements 7.2**

  - [x] 7.4 Implement bookmarks panel
    - Display list of whitelisted URLs as bookmarks
    - Handle bookmark click navigation
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 7.5 Implement content iframe and error handling
    - Render iframe with proxy URL
    - Display loading state
    - Handle and display error responses
    - _Requirements: 9.1, 9.2_

- [x] 8. Integrate ChromeBrowser with Desktop
  - Add Chrome app to Desktop component
  - Register in app launcher/start menu
  - Configure window properties
  - _Requirements: 7.1_

- [x] 9. Final checkpoint - All tests pass
  - Ensure all property tests pass
  - Ensure all unit tests pass
  - Ensure all integration tests pass
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Backend uses jqwik for property-based testing (already in pom.xml)
- Frontend tests use the existing test setup in webos-ui
