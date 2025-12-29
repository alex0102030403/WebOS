# Implementation Plan: JShell Studio

## Overview

This plan implements the JShell Studio feature - a real-time Java code execution environment. The implementation follows the BCE pattern with a JShellService (control) and CompilerResource (boundary) on the backend, and a JShellStudio React component on the frontend.

## Tasks

- [x] 1. Create backend package structure and entities
  - Create `io.webos.portfolio.compiler` package with boundary, control, entity subpackages
  - Create `ExecutionRequest` record with `fromJSON` factory method
  - Create `ExecutionResult` record with `toJSON` method and factory methods
  - _Requirements: 5.2, 5.3_

- [-] 2. Implement JShellService with timeout execution
  - [x] 2.1 Implement core JShellService with execute method
    - Create @ApplicationScoped service in control package
    - Implement timeout execution using ExecutorService
    - Capture System.out output using custom PrintStream
    - Collect snippet evaluation results
    - Handle compilation and runtime errors
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3_

  - [ ]* 2.2 Write property test for timeout enforcement
    - **Property 1: Timeout Enforcement**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 2.3 Write property test for output completeness
    - **Property 2: Output Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.4**

  - [ ]* 2.4 Write property test for error message propagation
    - **Property 3: Error Message Propagation**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 2.5 Write property test for robustness under malformed input
    - **Property 4: Robustness Under Malformed Input**
    - **Validates: Requirements 4.3**

- [x] 3. Implement CompilerResource REST endpoint
  - [x] 3.1 Create CompilerResource with POST /compiler/execute endpoint
    - Create JAX-RS resource in boundary package
    - Inject JShellService
    - Parse JSON request body
    - Return JSON response with output
    - Handle missing/invalid request body with HTTP 400
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Checkpoint - Backend complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 5. Implement JShell Studio frontend component
  - [x] 5.1 Create JShellStudio React component
    - Create component in `webos-ui/src/components/jshell-studio/`
    - Implement code editor textarea
    - Implement Run button
    - Implement output display panel
    - Add loading state during execution
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_

  - [x] 5.2 Add API function for code execution
    - Add `executeCode` function to `webos-ui/src/api/index.ts`
    - POST to `/api/compiler/execute`
    - Handle response and errors
    - _Requirements: 6.4_

- [x] 6. Integrate JShell Studio with Desktop
  - [x] 6.1 Add JShell Studio to Desktop and StartMenu
    - Add JShell Studio to available apps in Desktop.tsx
    - Add icon and window configuration
    - Add to StartMenu if applicable
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 7. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The backend uses Java 21 with Quarkus (existing project setup)
- The frontend uses React with TypeScript and Tailwind CSS (existing stack)
