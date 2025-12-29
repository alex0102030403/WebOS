# Implementation Plan: File Persistence

## Overview

This plan implements file persistence for WebOS Portfolio, enabling applications to save files to the virtual file system with automatic desktop icon synchronization. Tasks are ordered: backend first (file operations, echo command), then frontend (API, Paint save, Notepad save, desktop refresh).

## Tasks

- [-] 1. Enhance FileSystemService with content operations
  - [x] 1.1 Add updateContent and saveFile methods
    - Add `findIndexById(id)` helper method to locate node in MFT
    - Add `updateContent(id, content)` method that updates existing FileNode content
    - Add `saveFile(parentId, name, content)` method that creates or updates file
    - _Requirements: 1.1, 1.2, 1.4, 6.1, 6.2_

  - [ ]* 1.2 Write property test for content update round-trip
    - **Property 1: File content update round-trip**
    - **Validates: Requirements 1.1, 4.1, 6.1**

  - [ ]* 1.3 Write property test for file creation with content
    - **Property 2: File creation with content**
    - **Validates: Requirements 1.2, 4.3, 6.2**

  - [ ]* 1.4 Write property test for save preserves single file
    - **Property 4: Save preserves single file**
    - **Validates: Requirements 1.4**

- [x] 2. Add REST endpoints for file content operations
  - [x] 2.1 Add PUT endpoint for content update
    - Add `PUT /files/{id}/content` endpoint to FileNodesResource
    - Accept JSON body with `content` field
    - Return updated FileNode or 404 if not found
    - _Requirements: 6.1, 6.3_

  - [x] 2.2 Add POST endpoint for file save
    - Add `POST /files/save` endpoint to FileNodesResource
    - Accept JSON body with `parentId`, `name`, `content` fields
    - Return created/updated FileNode or 400 for invalid input
    - _Requirements: 6.2, 6.4_

- [x] 3. Implement echo command in CommandService
  - [x] 3.1 Add echo command with redirection support
    - Add `echo(parts)` method to CommandService
    - Parse `>` for overwrite and `>>` for append
    - Extract content from quoted strings
    - Call `fileSystemService.saveFile()` for file operations
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 3.2 Write property test for echo command
    - **Property 7: Echo command file operations**
    - **Validates: Requirements 5.1, 5.2**

- [x] 4. Checkpoint - Backend complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 5. Extend frontend API layer
  - [x] 5.1 Add API functions for file content operations
    - Add `updateFileContent(id, content)` function
    - Add `saveFile(parentId, name, content)` function
    - Handle errors and return typed responses
    - _Requirements: 1.1, 1.2, 6.1, 6.2_

- [x] 6. Enhance Paint component with save functionality
  - [x] 6.1 Add save dialog to Paint
    - Add `showSaveDialog` state and filename input
    - Add Save button to toolbar that opens dialog
    - Add dialog with filename input and Save/Cancel buttons
    - _Requirements: 3.1, 3.2_

  - [x] 6.2 Implement canvas export and save
    - Export canvas as PNG using `toDataURL('image/png')`
    - Extract base64 content from data URL
    - Append `.png` extension if not provided
    - Call `saveFile()` API with base64 content
    - _Requirements: 3.2, 3.4, 1.3_

  - [ ]* 6.3 Write property test for base64 content preservation
    - **Property 3: Base64 content preservation**
    - **Validates: Requirements 1.3, 6.5**

- [x] 7. Enhance Notepad component with save functionality
  - [x] 7.1 Add save-as dialog for new files
    - Add `showSaveDialog` state for new file saves
    - Show dialog when saving untitled file
    - Append `.txt` extension if not provided
    - _Requirements: 4.2, 4.5_

  - [x] 7.2 Implement save logic
    - For existing files: call `updateFileContent()` with file id
    - For new files: call `saveFile()` with filename and content
    - Update dirty state after successful save
    - _Requirements: 4.1, 4.3_

- [x] 8. Add desktop refresh capability
  - [x] 8.1 Add refresh function to Desktop component
    - Create `refreshDesktop()` callback that re-fetches nodes
    - Preserve existing icon positions for unchanged nodes
    - Add default positions for new nodes
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 8.2 Pass refresh callback to child apps
    - Pass `onFileSaved` prop to Paint and Notepad
    - Call refresh after successful file save
    - _Requirements: 2.4_

  - [ ]* 8.3 Write property test for node creation visibility
    - **Property 5: Node creation visibility**
    - **Validates: Requirements 2.1, 2.3, 2.5**

  - [ ]* 8.4 Write property test for node deletion visibility
    - **Property 6: Node deletion visibility**
    - **Validates: Requirements 2.2**

- [x] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Backend tasks (1-4) should be completed before frontend tasks (5-8)
- Property tests use jqwik library already configured in pom.xml
- Each property test references specific design document properties
- The existing FileNode record already supports content storage (no schema changes needed)
