# Implementation Plan: File Explorer

## Overview

This plan implements a functional File Explorer with terminal command integration. Tasks are ordered to build incrementally: backend file operations first, then terminal commands, then frontend explorer component.

## Tasks

- [x] 1. Enhance FileSystemService with mutable operations
  - [x] 1.1 Convert MFT to mutable ArrayList and add write operations
    - Change `final List<FileNode> mft` to mutable `ArrayList<FileNode>`
    - Add `createNode(parentId, name, type, content)` method that generates UUID and adds to MFT
    - Add `findByNameInParent(parentId, name)` method for duplicate checking
    - Add `deleteNode(id)` method that removes single node
    - Add `deleteNodeRecursive(id)` method that removes node and all children
    - Add `buildPath(nodeId)` method that constructs full path string
    - _Requirements: 2.4, 5.4, 6.1, 6.2, 7.1_

  - [ ]* 1.2 Write property test for createNode
    - **Property 3: mkdir creates directory in MFT**
    - **Validates: Requirements 2.1, 2.4**

  - [ ]* 1.3 Write property test for deleteNode
    - **Property 8: rm removes file from MFT**
    - **Validates: Requirements 6.1**

  - [ ]* 1.4 Write property test for deleteNodeRecursive
    - **Property 9: rm -r removes directory recursively**
    - **Validates: Requirements 6.2**

  - [ ]* 1.5 Write property test for buildPath
    - **Property 10: pwd returns correctly formatted path**
    - **Validates: Requirements 7.1, 7.2**

- [x] 2. Implement terminal commands in CommandService
  - [x] 2.1 Add current directory state and cd command
    - Add `currentDirectory` field initialized to "desktop"
    - Implement `cd(parts)` handling: no args → desktop, `..` → parent, dirname → navigate
    - Validate target is a directory, return error if file or not found
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.2 Write property test for cd command
    - **Property 5: cd changes current directory**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 2.3 Implement mkdir command
    - Parse `mkdir <dirname>` from input
    - Check for existing name in current directory
    - Call `fileSystemService.createNode()` with DIRECTORY type
    - Return success message or appropriate error
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.4 Implement touch command
    - Parse `touch <filename>` from input
    - Check if file exists (idempotent - no error if exists)
    - Call `fileSystemService.createNode()` with FILE type and empty content
    - Return success message
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 2.5 Write property test for touch idempotence
    - **Property 7: touch is idempotent on existing files**
    - **Validates: Requirements 5.3**

  - [x] 2.6 Implement rm command
    - Parse `rm [-r] <name>` from input
    - Handle `-r` flag for recursive directory deletion
    - Validate file exists, check if directory without -r flag
    - Call appropriate delete method on FileSystemService
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 2.7 Implement pwd command
    - Call `fileSystemService.buildPath(currentDirectory)`
    - Return formatted path string
    - _Requirements: 7.1, 7.2_

  - [x] 2.8 Enhance cat command to use current directory context
    - Resolve filename relative to current directory
    - Validate file type (error if directory)
    - Return file content or appropriate error
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.9 Write property test for cat command
    - **Property 4: cat returns file content**
    - **Validates: Requirements 3.1**

  - [x] 2.10 Enhance ls command to use current directory context
    - Default to current directory if no argument
    - List contents of specified or current directory
    - _Requirements: 1.2 (terminal equivalent)_

- [x] 3. Checkpoint - Backend complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 4. Extend frontend API layer
  - [x] 4.1 Add API functions for file operations
    - Add `fetchNodeById(id)` to get single node with content
    - Add `createDirectory(parentId, name)` POST endpoint call
    - Add `createFile(parentId, name)` POST endpoint call  
    - Add `deleteNode(id)` DELETE endpoint call
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 5. Create FileExplorer component
  - [x] 5.1 Create FileExplorer component with basic structure
    - Create `webos-ui/src/components/file-explorer/FileExplorer.tsx`
    - Implement state: currentParentId, nodes, selectedNode, breadcrumbPath
    - Fetch and display nodes for current directory on mount
    - Add window header with close button
    - _Requirements: 1.1_

  - [x] 5.2 Implement file/folder icons and grid display
    - Create icon mapping for DIRECTORY, FILE, SHORTCUT types
    - Display nodes in grid layout with appropriate icons
    - Show node name below each icon
    - _Requirements: 1.6_

  - [ ]* 5.3 Write property test for icon mapping
    - **Property 2: File icons match FileNode types**
    - **Validates: Requirements 1.6**

  - [x] 5.4 Implement directory navigation
    - Double-click directory → update currentParentId and fetch new nodes
    - Update breadcrumb path on navigation
    - _Requirements: 1.2_

  - [ ]* 5.5 Write property test for directory navigation
    - **Property 1: Directory navigation displays correct contents**
    - **Validates: Requirements 1.2**

  - [x] 5.6 Implement breadcrumb navigation bar
    - Display current path as clickable breadcrumbs
    - Click breadcrumb segment → navigate to that directory
    - _Requirements: 1.7_

  - [x] 5.7 Implement back button navigation
    - Add back button to toolbar
    - Click → navigate to parent directory
    - Disable when at root (desktop)
    - _Requirements: 1.3_

  - [x] 5.8 Implement file preview panel
    - Double-click file → fetch content and display in preview panel
    - Show preview panel on right side or as modal
    - _Requirements: 1.4_

  - [x] 5.9 Implement shortcut handling
    - Double-click shortcut → parse content for action
    - `app:*` shortcuts → trigger app open callback
    - `http*` shortcuts → open in new tab
    - _Requirements: 1.5_

- [x] 6. Integrate FileExplorer into Desktop
  - [x] 6.1 Add FileExplorer to Desktop component
    - Add "File Explorer" to available apps
    - Create desktop icon for File Explorer
    - Wire up open/close handlers
    - _Requirements: 1.1_

- [x] 7. Verify synchronization between terminal and explorer
  - [x]* 7.1 Write property test for file system synchronization
    - **Property 11: File system changes sync to explorer**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Backend tasks (1-3) should be completed before frontend tasks (4-7)
- Property tests use jqwik library already configured in pom.xml
- Each property test references specific design document properties
