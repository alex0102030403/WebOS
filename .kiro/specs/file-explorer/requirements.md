# Requirements Document

## Introduction

A functional File Explorer application for WebOS Portfolio that provides visual file browsing capabilities and integrates with terminal commands (`mkdir`, `cat`, `cd`, `ls`, `rm`, `touch`) for file system manipulation. The file explorer displays the virtual file system hierarchy and allows users to navigate, view, and manage files through both GUI and CLI interfaces.

## Glossary

- **File_Explorer**: The graphical application component that displays and navigates the virtual file system
- **File_System_Service**: The backend service managing the in-memory Master File Table (MFT)
- **Command_Service**: The backend service that parses and executes terminal commands
- **FileNode**: A record representing a file system entry (directory, file, or shortcut)
- **MFT**: Master File Table - the in-memory data structure storing all file system entries
- **Current_Directory**: The active directory context for terminal operations

## Requirements

### Requirement 1: File Explorer GUI

**User Story:** As a user, I want to browse files and folders visually, so that I can navigate the file system without using terminal commands.

#### Acceptance Criteria

1. WHEN the File_Explorer opens, THE File_Explorer SHALL display the contents of the desktop directory
2. WHEN a user double-clicks a directory, THE File_Explorer SHALL navigate into that directory and display its contents
3. WHEN a user clicks the back button, THE File_Explorer SHALL navigate to the parent directory
4. WHEN a user double-clicks a file, THE File_Explorer SHALL display the file content in a preview panel
5. WHEN a user double-clicks a shortcut, THE File_Explorer SHALL open the linked application or URL
6. THE File_Explorer SHALL display file icons appropriate to each FileNode type (directory, file, shortcut)
7. THE File_Explorer SHALL show the current path in a breadcrumb navigation bar

### Requirement 2: Terminal mkdir Command

**User Story:** As a user, I want to create new directories using the terminal, so that I can organize my files.

#### Acceptance Criteria

1. WHEN a user executes `mkdir <dirname>`, THE Command_Service SHALL create a new directory FileNode in the current directory
2. WHEN a user executes `mkdir` without arguments, THE Command_Service SHALL return an error message with usage instructions
3. WHEN a user attempts to create a directory with an existing name, THE Command_Service SHALL return an error indicating the directory already exists
4. WHEN a directory is created, THE File_System_Service SHALL add the new FileNode to the MFT

### Requirement 3: Terminal cat Command Enhancement

**User Story:** As a user, I want to view file contents using the cat command, so that I can read files from the terminal.

#### Acceptance Criteria

1. WHEN a user executes `cat <filename>`, THE Command_Service SHALL display the file content
2. WHEN a user executes `cat` on a directory, THE Command_Service SHALL return an error indicating it is a directory
3. WHEN a user executes `cat` on a non-existent file, THE Command_Service SHALL return a file not found error
4. WHEN a user executes `cat` without arguments, THE Command_Service SHALL return usage instructions

### Requirement 4: Terminal cd Command

**User Story:** As a user, I want to change the current directory using the terminal, so that I can navigate the file system via CLI.

#### Acceptance Criteria

1. WHEN a user executes `cd <dirname>`, THE Command_Service SHALL change the current directory context
2. WHEN a user executes `cd ..`, THE Command_Service SHALL navigate to the parent directory
3. WHEN a user executes `cd` without arguments, THE Command_Service SHALL navigate to the desktop (home) directory
4. WHEN a user executes `cd` on a non-existent directory, THE Command_Service SHALL return a directory not found error
5. WHEN a user executes `cd` on a file, THE Command_Service SHALL return an error indicating it is not a directory

### Requirement 5: Terminal touch Command

**User Story:** As a user, I want to create new empty files using the terminal, so that I can add files to the system.

#### Acceptance Criteria

1. WHEN a user executes `touch <filename>`, THE Command_Service SHALL create a new file FileNode with empty content
2. WHEN a user executes `touch` without arguments, THE Command_Service SHALL return usage instructions
3. WHEN a user executes `touch` on an existing file, THE Command_Service SHALL not modify the existing file
4. WHEN a file is created, THE File_System_Service SHALL add the new FileNode to the MFT

### Requirement 6: Terminal rm Command

**User Story:** As a user, I want to remove files and directories using the terminal, so that I can manage my file system.

#### Acceptance Criteria

1. WHEN a user executes `rm <filename>`, THE Command_Service SHALL remove the file FileNode from the MFT
2. WHEN a user executes `rm -r <dirname>`, THE Command_Service SHALL remove the directory and all its contents recursively
3. WHEN a user executes `rm` on a directory without -r flag, THE Command_Service SHALL return an error indicating it is a directory
4. WHEN a user executes `rm` on a non-existent file, THE Command_Service SHALL return a file not found error
5. WHEN a user executes `rm` without arguments, THE Command_Service SHALL return usage instructions

### Requirement 7: Terminal pwd Command

**User Story:** As a user, I want to see my current directory path, so that I know where I am in the file system.

#### Acceptance Criteria

1. WHEN a user executes `pwd`, THE Command_Service SHALL display the full path of the current directory
2. THE Command_Service SHALL format the path with forward slashes (e.g., /desktop/projects)

### Requirement 8: File System State Synchronization

**User Story:** As a user, I want the file explorer and terminal to reflect the same file system state, so that changes made in one are visible in the other.

#### Acceptance Criteria

1. WHEN a file is created via terminal, THE File_Explorer SHALL display the new file when refreshed or navigated
2. WHEN a file is deleted via terminal, THE File_Explorer SHALL no longer display the file when refreshed
3. WHEN a directory is created via terminal, THE File_Explorer SHALL display the new directory when refreshed
4. THE File_System_Service SHALL maintain a single source of truth for all file operations
