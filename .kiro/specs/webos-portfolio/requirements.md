# Requirements Document

## Introduction

This document defines the requirements for "WebOS Portfolio" — a simulated Windows 11 Operating System running in the browser, powered by a low-level Java 25 Backend Kernel. The system provides a creative portfolio experience through a desktop simulation with 3D visualization capabilities.

## Glossary

- **Kernel**: The Java 25 backend providing core OS services (boot, file system, process management)
- **Bootloader**: Backend subsystem providing initial OS configuration without database persistence
- **VFS (Virtual File System)**: Simulated hard drive file structure managed in-memory
- **MFT (Master File Table)**: In-memory data structure holding all FileNode entries
- **FileNode**: Record representing a file system entry (directory, file, or shortcut)
- **Process_Manager**: Backend subsystem providing JVM metrics and simulated process data
- **Desktop_UI**: React-based Windows 11-style user interface
- **BIOS_Sequence**: Initial text-based boot animation displayed before desktop loads

## Requirements

### Requirement 1: System Boot Configuration

**User Story:** As a visitor, I want the system to boot with default configuration, so that I can immediately experience the portfolio without authentication.

#### Acceptance Criteria

1. WHEN the frontend requests boot configuration, THE Bootloader SHALL return OS version, theme, and wallpaper URL as a JSON-P object
2. THE Bootloader SHALL read configuration values from microprofile-config.properties
3. THE Bootloader SHALL treat every user as "Visitor" without requiring authentication
4. WHEN configuration properties are missing, THE Bootloader SHALL provide sensible default values

### Requirement 2: Virtual File System

**User Story:** As a visitor, I want to browse a simulated file system, so that I can explore portfolio content like a real desktop.

#### Acceptance Criteria

1. THE VFS SHALL represent file system entries using FileNode records with id, parentId, name, type, and content fields
2. THE VFS SHALL support three FileNode types: DIRECTORY, FILE, and SHORTCUT
3. WHEN a client requests file nodes with a parentId, THE VFS SHALL return all FileNode children of that parent
4. WHEN a client requests file nodes without a parentId, THE VFS SHALL default to returning desktop-level nodes
5. THE VFS SHALL maintain an in-memory Master File Table containing portfolio data (Resume, GitHub links, About Me)
6. THE FileNode record SHALL provide a toJSON() method returning a JSON-P JsonObject
7. THE FileNode record SHALL provide a static fromJSON(JsonObject) factory method for deserialization

### Requirement 3: Process Manager (Real-Time)

**User Story:** As a visitor, I want to view a Task Manager with live-updating system processes, so that I can experience realistic OS simulation.

#### Acceptance Criteria

1. THE Process_Manager SHALL expose a Server-Sent Events (SSE) endpoint to stream JVM metrics updates (push) rather than requiring client polling
2. THE Process_Manager SHALL include real JVM metrics (heap usage) from ManagementFactory.getMemoryMXBean()
3. THE Process_Manager SHALL include simulated application processes (e.g., "Chrome", "Outlook")
4. THE Process_Manager SHALL return process data including name, memory usage, and status
5. THE Process_Manager SHALL push metric updates at a configurable interval (default: 1 second)

### Requirement 4: BIOS Boot Sequence

**User Story:** As a visitor, I want to see a BIOS-style boot animation, so that I experience an authentic OS startup.

#### Acceptance Criteria

1. WHEN the application loads, THE Desktop_UI SHALL display a BIOS-style text boot sequence
2. THE BIOS_Sequence SHALL show simulated hardware checks (RAM, CPU)
3. WHEN the boot sequence completes, THE Desktop_UI SHALL transition to the desktop view

### Requirement 5: Desktop User Interface

**User Story:** As a visitor, I want to interact with a Windows 11-style desktop, so that I can navigate the portfolio intuitively.

#### Acceptance Criteria

1. THE Desktop_UI SHALL render a Windows 11-style interface with taskbar and desktop icons
2. WHEN the desktop loads, THE Desktop_UI SHALL fetch icons from the VFS backend
3. THE Desktop_UI SHALL support clicking icons to open content or navigate directories
4. THE Desktop_UI SHALL display a start menu when the start button is clicked

### Requirement 6: 3D Environment Rendering

**User Story:** As a desktop visitor, I want to see the OS rendered on a virtual monitor in a 3D scene, so that I have an immersive portfolio experience.

#### Acceptance Criteria

1. WHEN viewing on desktop devices, THE Desktop_UI SHALL render the UI inside a virtual monitor on a 3D desk using Three.js
2. WHEN viewing on desktop devices, THE Desktop_UI SHALL support camera movement around the 3D scene
3. WHEN viewing on mobile devices, THE Desktop_UI SHALL render full-screen UI without 3D environment

### Requirement 7: JAX-RS Resource Standards

**User Story:** As a developer, I want consistent REST API design, so that the backend follows established conventions.

#### Acceptance Criteria

1. THE Kernel SHALL name JAX-RS resource classes in plural form (e.g., FileNodesResource)
2. THE Kernel SHALL declare @Consumes and @Produces annotations at class level
3. THE Kernel SHALL return JAX-RS Response objects from resource methods
4. THE Kernel SHALL delegate business logic to @ApplicationScoped services, not implement it in resources

### Requirement 8: JSON Processing Standards

**User Story:** As a developer, I want consistent JSON handling, so that serialization follows project conventions.

#### Acceptance Criteria

1. THE Kernel SHALL use JSON-P (Jakarta JSON Processing) for all JSON operations
2. THE Kernel SHALL NOT use JSON-B for serialization
3. THE Kernel SHALL model entities as Java Records
4. WHEN serializing entities, THE Kernel SHALL use the record's toJSON() method
5. WHEN deserializing entities, THE Kernel SHALL use the record's static fromJSON(JsonObject) method

### Requirement 9: Terminal Command Subsystem

**User Story:** As a power user, I want to use a command-line interface, so that I can interact with the system using text commands (e.g., `cat resume.txt`, `java --version`).

#### Acceptance Criteria

1. THE Kernel SHALL provide a CommandService that uses Java 25 Pattern Matching for switch to parse input strings
2. THE Terminal_UI SHALL communicate with the backend via a REST endpoint (POST /terminal/exec)
3. THE CommandService SHALL support basic file operations: `ls` (list directory), `cat` (display file content)
4. THE CommandService SHALL support system info commands: `uname` (system info), `whoami` (current user)
5. THE CommandService SHALL support developer commands: `java --version` (JVM version info)
6. WHEN an unknown command is entered, THE CommandService SHALL return a helpful error message
7. THE CommandService SHALL return command output as plain text or structured JSON-P depending on the command
