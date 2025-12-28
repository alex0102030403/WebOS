# Implementation Plan: WebOS Portfolio

## Overview

This plan implements the WebOS Portfolio backend kernel in Java 25 using JAX-RS (Quarkus), following BCE architecture. Tasks are ordered to build foundational components first, then layer on complexity. Frontend implementation follows backend completion.

## Tasks

- [x] 1. Project Setup and Core Infrastructure
  - [x] 1.1 Initialize Quarkus project with Java 25, JAX-RS, JSON-P, and SSE dependencies
    - Create Maven pom.xml with quarkus-resteasy-reactive, quarkus-resteasy-reactive-jsonp
    - Configure Java 25 compiler settings
    - Add jqwik dependency for property-based testing
    - _Requirements: 7.1, 7.2, 7.3, 8.1_

  - [x] 1.2 Create base package structure following BCE pattern
    - Create io.webos.portfolio root package
    - Create boot, filesystem, processes, terminal component packages
    - Add boundary, control, entity sub-packages to each component
    - _Requirements: 7.4_

- [-] 2. FileNode Entity and Serialization
  - [x] 2.1 Implement FileNode record with JSON-P serialization
    - Create FileType enum (DIRECTORY, FILE, SHORTCUT)
    - Create FileNode record with id, parentId, name, type, content fields
    - Implement toJSON() method returning JsonObject
    - Implement static fromJSON(JsonObject) factory method
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 8.3, 8.4, 8.5_

  - [ ]* 2.2 Write property test for FileNode serialization round-trip
    - **Property 4: Entity Serialization Round-Trip**
    - Generate random FileNode instances, verify toJSON/fromJSON produces equivalent object
    - **Validates: Requirements 2.6, 2.7, 8.4, 8.5**

  - [ ]* 2.3 Write property test for FileNode type validity
    - **Property 2: FileNode Type Validity**
    - Verify all FileNode instances have valid FileType enum value
    - **Validates: Requirements 2.2**

- [x] 3. Virtual File System Implementation
  - [x] 3.1 Implement FileSystemService with in-memory MFT
    - Create FileSystemService as @ApplicationScoped
    - Initialize Master File Table with List.of() containing portfolio data
    - Implement findByParentId(String parentId) using Stream API
    - Implement findById(String id) for single file lookup
    - Default parentId to "desktop" when null
    - _Requirements: 2.3, 2.4, 2.5_

  - [ ]* 3.2 Write property test for file query parent consistency
    - **Property 3: File Query Parent Consistency**
    - Query with random parentIds, verify all results have matching parentId
    - **Validates: Requirements 2.3**

  - [x] 3.3 Implement FileNodesResource JAX-RS endpoint
    - Create FileNodesResource at @Path("/file-nodes")
    - Add @Produces(APPLICATION_JSON) at class level
    - Implement GET method with @QueryParam("parentId") defaulting to "desktop"
    - Return Response with JSON array of FileNode.toJSON()
    - Delegate to FileSystemService
    - _Requirements: 2.3, 2.4, 7.1, 7.2, 7.3, 7.4_

- [x] 4. Checkpoint - VFS Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Boot Configuration Subsystem
  - [x] 5.1 Implement BootConfig record with JSON-P serialization
    - Create BootConfig record with osVersion, theme, wallpaperUrl, username fields
    - Implement toJSON() and fromJSON() methods
    - _Requirements: 1.1, 8.3, 8.4, 8.5_

  - [x] 5.2 Implement BootService with MicroProfile Config
    - Create BootService as @ApplicationScoped
    - Inject config values using @ConfigProperty with default values
    - Always return "Visitor" as username
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 5.3 Write property test for boot config completeness
    - **Property 1: Boot Configuration Completeness**
    - Verify all boot responses contain osVersion, theme, wallpaperUrl, username
    - **Validates: Requirements 1.1**

  - [x] 5.4 Implement BootResource JAX-RS endpoint
    - Create BootResource at @Path("/system/boot")
    - Add @Produces(APPLICATION_JSON) at class level
    - Implement GET method returning BootConfig as JSON
    - _Requirements: 1.1, 7.1, 7.2, 7.3_

- [x] 6. Process Manager with SSE
  - [x] 6.1 Implement ProcessInfo record with JSON-P serialization
    - Create ProcessInfo record with pid, name, memoryBytes, status fields
    - Implement toJSON() and fromJSON() methods
    - _Requirements: 3.4, 8.3, 8.4, 8.5_

  - [x] 6.2 Implement ProcessService with JVM metrics
    - Create ProcessService as @ApplicationScoped
    - Use ManagementFactory.getMemoryMXBean() for heap metrics
    - Generate simulated processes (Chrome, Outlook, Explorer, etc.)
    - Implement getProcesses() returning List<ProcessInfo>
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 6.3 Write property tests for process info
    - **Property 5: Process Info Completeness**
    - Verify all ProcessInfo have pid, name, memoryBytes, status
    - **Property 6: JVM Metrics Validity**
    - Verify heap values are non-negative and used <= max
    - **Validates: Requirements 3.2, 3.4**

  - [x] 6.4 Implement ProcessesResource with SSE streaming
    - Create ProcessesResource at @Path("/processes")
    - Implement GET method with @Produces(SERVER_SENT_EVENTS)
    - Use SseEventSink and Sse to push updates
    - Stream process data at configurable interval (default 1s)
    - _Requirements: 3.1, 3.5, 7.1, 7.2_

- [x] 7. Checkpoint - Backend Core Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Terminal Command Subsystem
  - [x] 8.1 Implement CommandResult record with JSON-P serialization
    - Create CommandResult record with success, output, error fields
    - Implement toJSON() and fromJSON() methods
    - _Requirements: 9.7, 8.3, 8.4, 8.5_

  - [x] 8.2 Implement CommandService with pattern matching
    - Create CommandService as @ApplicationScoped
    - Inject FileSystemService for file operations
    - Implement execute(String input) using switch with pattern matching
    - Implement ls command (list directory contents)
    - Implement cat command (display file content)
    - Implement uname command (system info)
    - Implement whoami command (returns "Visitor")
    - Implement java --version command (JVM version)
    - Return error for unknown commands
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 8.3 Write property tests for terminal commands
    - **Property 7: ls Command Directory Listing**
    - Verify ls returns names matching directory children
    - **Property 8: cat Command File Content**
    - Verify cat returns file content field
    - **Property 9: Unknown Command Error Handling**
    - Verify unknown commands return success=false with error message
    - **Property 10: Command Result Structure Consistency**
    - Verify results have success+output OR success=false+error
    - **Validates: Requirements 9.3, 9.6, 9.7**

  - [x] 8.4 Implement TerminalResource JAX-RS endpoint
    - Create TerminalResource at @Path("/terminal")
    - Add @Consumes and @Produces(APPLICATION_JSON) at class level
    - Implement POST /exec accepting JsonObject with "command" field
    - Return CommandResult as JSON
    - _Requirements: 9.2, 7.1, 7.2, 7.3, 7.4_

- [x] 9. Checkpoint - Backend Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend BIOS and Desktop Shell
  - [x] 10.1 Create React project with Vite, Tailwind, and Three.js
    - Initialize Vite project with React and TypeScript
    - Install Tailwind CSS, React Three Fiber, Next UI
    - Configure project structure
    - _Requirements: 4.1, 5.1, 6.1_

  - [x] 10.2 Implement BIOS boot sequence component
    - Create BiosSequence component with text animation
    - Display simulated hardware checks (RAM, CPU)
    - Transition to Desktop after sequence completes
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 10.3 Implement Desktop shell with taskbar and icons
    - Create Desktop component with Windows 11 styling
    - Fetch icons from /file-nodes?parentId=desktop on mount
    - Render desktop icons with click handlers
    - Implement taskbar with start button
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 11. Frontend Task Manager and Terminal
  - [x] 11.1 Implement Task Manager with SSE connection
    - Create TaskManager component
    - Connect to /processes SSE endpoint
    - Display real-time process list with memory usage
    - Update UI on each SSE event
    - _Requirements: 3.1, 3.4_

  - [x] 11.2 Implement Terminal UI component
    - Create Terminal component with command input
    - POST commands to /terminal/exec
    - Display output in monospace font
    - Support command history (up/down arrows)
    - _Requirements: 9.2_

- [x] 12. Frontend 3D Environment
  - [x] 12.1 Implement 3D desk scene with React Three Fiber
    - Create 3D scene with desk and monitor model
    - Render Desktop UI as texture on monitor screen
    - Add ambient lighting and shadows
    - _Requirements: 6.1_

  - [x] 12.2 Implement responsive 3D/2D switching
    - Detect device type (mobile vs desktop)
    - Show 3D scene with camera controls on desktop
    - Show full-screen 2D UI on mobile
    - _Requirements: 6.2, 6.3_

- [x] 13. Final Checkpoint - Full System Integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify boot → desktop → file browsing → terminal → task manager flow

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Backend tasks (1-9) should be completed before frontend tasks (10-12)
- Each checkpoint verifies incremental progress before continuing
- Property tests use jqwik with minimum 100 iterations per test
