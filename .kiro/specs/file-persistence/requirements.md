# Requirements Document

## Introduction

A file persistence system for WebOS Portfolio that enables applications (Terminal, Notepad, Paint) to create and save files to the virtual file system. When files are created on the desktop or within desktop folders, corresponding icons appear automatically. This extends the existing file system to support content persistence and real-time desktop synchronization.

## Glossary

- **File_System_Service**: The backend service managing the in-memory Master File Table (MFT)
- **FileNode**: A record representing a file system entry (directory, file, or shortcut)
- **Desktop**: The root directory where user files and shortcuts are displayed as icons
- **Paint_App**: The drawing application that can save canvas content as PNG images
- **Notepad_App**: The text editor application that can save text content to files
- **Terminal_App**: The command-line interface that can create files via mkdir and touch commands
- **File_Explorer**: The graphical file browser that displays the virtual file system

## Requirements

### Requirement 1: File Content Persistence

**User Story:** As a user, I want to save file content from applications, so that my work is preserved in the virtual file system.

#### Acceptance Criteria

1. WHEN a user saves a file in Notepad_App, THE File_System_Service SHALL update the FileNode content with the new text
2. WHEN a user creates a new file via Notepad_App save, THE File_System_Service SHALL create a new FileNode with the specified name and content
3. WHEN a user saves an image in Paint_App, THE File_System_Service SHALL create a new FileNode with PNG image data encoded as base64
4. WHEN a file is saved with an existing name in the same directory, THE File_System_Service SHALL update the existing FileNode content
5. IF a save operation fails, THEN THE application SHALL display an error message to the user

### Requirement 2: Desktop Icon Synchronization

**User Story:** As a user, I want to see new files appear as icons on my desktop, so that I can access them visually.

#### Acceptance Criteria

1. WHEN a file is created in the desktop directory, THE Desktop SHALL display a new icon for that file
2. WHEN a file is deleted from the desktop directory, THE Desktop SHALL remove the corresponding icon
3. WHEN a directory is created in the desktop directory, THE Desktop SHALL display a new folder icon
4. THE Desktop SHALL refresh icons when the file system changes without requiring manual refresh
5. WHEN a file is created inside a desktop folder, THE File_Explorer SHALL display the new file when that folder is opened

### Requirement 3: Paint Image Save Functionality

**User Story:** As a user, I want to save my Paint drawings as PNG files, so that I can preserve my artwork.

#### Acceptance Criteria

1. WHEN a user clicks Save in Paint_App, THE Paint_App SHALL prompt for a filename
2. WHEN a user confirms the save, THE Paint_App SHALL export the canvas as PNG and save to the current directory
3. THE Paint_App SHALL default the save location to the desktop directory
4. WHEN saving, THE Paint_App SHALL append ".png" extension if not provided
5. IF the filename already exists, THEN THE Paint_App SHALL ask for confirmation before overwriting

### Requirement 4: Notepad Save Functionality

**User Story:** As a user, I want to save text files from Notepad, so that I can preserve my notes and documents.

#### Acceptance Criteria

1. WHEN a user clicks Save on an existing file, THE Notepad_App SHALL update the file content
2. WHEN a user clicks Save on a new file, THE Notepad_App SHALL prompt for a filename
3. WHEN a user confirms the save, THE Notepad_App SHALL save the content to the specified location
4. THE Notepad_App SHALL default the save location to the desktop directory
5. WHEN saving, THE Notepad_App SHALL append ".txt" extension if not provided

### Requirement 5: Terminal File Creation with Content

**User Story:** As a user, I want to create files with content using terminal commands, so that I can manage files via CLI.

#### Acceptance Criteria

1. WHEN a user executes `echo "content" > filename`, THE Command_Service SHALL create a file with the specified content
2. WHEN a user executes `echo "content" >> filename`, THE Command_Service SHALL append content to an existing file
3. WHEN the target file does not exist for append, THE Command_Service SHALL create a new file with the content
4. WHEN a user executes `cat > filename`, THE Command_Service SHALL enter interactive mode to accept multi-line input

### Requirement 6: File System API Extensions

**User Story:** As a developer, I want API endpoints for file content operations, so that frontend applications can persist data.

#### Acceptance Criteria

1. THE File_System_Service SHALL provide an endpoint to update file content by id
2. THE File_System_Service SHALL provide an endpoint to create files with initial content
3. WHEN updating a non-existent file, THE File_System_Service SHALL return a not found error
4. WHEN creating a file with a duplicate name, THE File_System_Service SHALL return a conflict error
5. THE File_System_Service SHALL support base64-encoded content for binary files

