# Requirements Document

## Introduction

This module enables a "JShell Studio" application within the WebOS portfolio. The application allows visitors to write and execute small Java code snippets in real-time using the Java Shell API (jdk.jshell). The execution is sandboxed with strict timeout constraints to prevent infinite loops and resource exhaustion.

## Glossary

- **JShell_Service**: The backend Java service responsible for executing Java code snippets using the JShell API
- **Compiler_Resource**: The JAX-RS REST endpoint exposing the code execution functionality
- **JShell_Studio**: The React frontend component that renders the code editor and output display
- **Execution_Thread**: A separate thread used to run code with timeout enforcement
- **Snippet_Result**: The combined output containing both System.out prints and expression evaluation results

## Requirements

### Requirement 1: JShell Engine Management

**User Story:** As a backend service, I want to manage JShell instances, so that I can execute Java code snippets submitted by users.

#### Acceptance Criteria

1. THE JShell_Service SHALL use jdk.jshell.JShell.create() to instantiate a JShell engine
2. THE JShell_Service SHALL be an @ApplicationScoped CDI bean
3. THE JShell_Service SHALL provide a method execute(String code) that returns a String result

### Requirement 2: Code Execution with Timeout

**User Story:** As a system administrator, I want code execution to be time-limited, so that infinite loops cannot freeze the server.

#### Acceptance Criteria

1. WHEN code is submitted for execution, THE JShell_Service SHALL run it in a separate thread
2. THE JShell_Service SHALL enforce a maximum execution timeout of 500 milliseconds
3. IF the execution exceeds the timeout, THEN THE JShell_Service SHALL terminate the attempt and return "Timeout Error: Execution exceeded 500ms"
4. THE JShell_Service SHALL NOT allow any single execution to block the main application thread

### Requirement 3: Output Collection

**User Story:** As a visitor, I want to see both printed output and expression results, so that I can understand what my code produced.

#### Acceptance Criteria

1. THE JShell_Service SHALL capture System.out.println output from executed code
2. THE JShell_Service SHALL capture expression evaluation results (e.g., "x ==> 10")
3. THE JShell_Service SHALL combine captured output and results into a single return string
4. WHEN multiple snippets are in the code, THE JShell_Service SHALL return results for each snippet

### Requirement 4: Error Handling

**User Story:** As a visitor, I want to see compilation and runtime errors, so that I can fix my code.

#### Acceptance Criteria

1. WHEN code contains syntax errors, THE JShell_Service SHALL return the compilation error message
2. WHEN code throws a runtime exception, THE JShell_Service SHALL return the exception message
3. THE JShell_Service SHALL NOT crash or become unresponsive due to malformed input

### Requirement 5: Compiler API Endpoint

**User Story:** As a frontend component, I want to submit code via a REST endpoint, so that I can display execution results.

#### Acceptance Criteria

1. THE Compiler_Resource SHALL expose a POST endpoint at `/compiler/execute`
2. THE endpoint SHALL consume application/json with body format: {"code": "<java_code>"}
3. THE endpoint SHALL produce application/json with body format: {"output": "<execution_result>"}
4. WHEN the request body is missing or invalid, THE Compiler_Resource SHALL return HTTP 400 (Bad Request)

### Requirement 6: JShell Studio UI

**User Story:** As a visitor, I want a code editor interface, so that I can write and run Java code.

#### Acceptance Criteria

1. THE JShell_Studio SHALL display a multi-line text area for code input
2. THE JShell_Studio SHALL display a "Run" button to execute the code
3. THE JShell_Studio SHALL display an output area showing execution results
4. WHEN the "Run" button is clicked, THE JShell_Studio SHALL send a POST request to /compiler/execute

### Requirement 7: UI Feedback

**User Story:** As a visitor, I want visual feedback during execution, so that I know my code is being processed.

#### Acceptance Criteria

1. WHILE code is executing, THE JShell_Studio SHALL display a loading indicator
2. WHEN execution completes, THE JShell_Studio SHALL display the output in the results area
3. WHEN an error occurs, THE JShell_Studio SHALL display the error message clearly
4. THE JShell_Studio SHALL clear previous output when new code is executed

### Requirement 8: Desktop Integration

**User Story:** As a visitor, I want JShell Studio to appear as an app in the WebOS desktop, so that I can launch it like other applications.

#### Acceptance Criteria

1. THE JShell_Studio SHALL be launchable from the desktop or start menu
2. THE JShell_Studio SHALL appear in a draggable window like other WebOS applications
3. THE JShell_Studio SHALL have an appropriate icon in the taskbar when open
