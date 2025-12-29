# Design Document: JShell Studio

## Overview

The JShell Studio provides a real-time Java code execution environment within the WebOS portfolio. It consists of a Java backend service that uses the JShell API (jdk.jshell) to execute code snippets with strict timeout enforcement, and a React frontend that provides a code editor interface.

The system prioritizes security through timeboxed execution - all code runs in a separate thread with a 500ms timeout to prevent infinite loops from freezing the server.

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["JShell Studio (React)"]
        CE[Code Editor]
        RB[Run Button]
        OP[Output Panel]
    end
    
    subgraph Backend["Compiler Module (Java)"]
        CR[CompilerResource]
        JS[JShellService]
        ET[Execution Thread]
    end
    
    subgraph JShell["JShell Engine"]
        JE[JShell Instance]
        SO[System.out Capture]
        SR[Snippet Results]
    end
    
    CE -->|Code Input| RB
    RB -->|"POST /compiler/execute"| CR
    CR -->|execute(code)| JS
    JS -->|Submit in Thread| ET
    ET -->|eval()| JE
    JE --> SO
    JE --> SR
    SO -->|Captured Output| JS
    SR -->|Expression Results| JS
    JS -->|Combined Output| CR
    CR -->|JSON Response| OP
```

## Components and Interfaces

### Backend Components

#### JShellService (Control Layer)

Location: `io.webos.portfolio.compiler.control.JShellService`

Responsibilities:
- Manage JShell engine instance
- Execute code in a separate thread with timeout
- Capture System.out output
- Collect snippet evaluation results
- Handle compilation and runtime errors

```java
@ApplicationScoped
public class JShellService {
    
    /**
     * Executes Java code and returns combined output.
     * Runs in a separate thread with 500ms timeout.
     * 
     * @param code the Java code to execute
     * @return combined output (System.out + expression results)
     */
    String execute(String code);
}
```

#### CompilerResource (Boundary Layer)

Location: `io.webos.portfolio.compiler.boundary.CompilerResource`

Responsibilities:
- Expose REST endpoint for code execution
- Parse JSON request body
- Return JSON response with output

```java
@Path("/compiler")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CompilerResource {
    
    @POST
    @Path("/execute")
    JsonObject execute(JsonObject request);
}
```

### Frontend Components

#### JShellStudio (React Component)

Location: `webos-ui/src/components/jshell-studio/JShellStudio.tsx`

Responsibilities:
- Render code editor textarea
- Handle Run button click
- Display execution output
- Show loading state during execution

```typescript
interface JShellStudioProps {
    onClose: () => void;
}

interface ExecutionState {
    isExecuting: boolean;
    output: string;
    error: string | null;
}
```

## Data Models

### Backend Entities

#### ExecutionRequest (Entity Layer)

Location: `io.webos.portfolio.compiler.entity.ExecutionRequest`

```java
public record ExecutionRequest(String code) {
    
    public static ExecutionRequest fromJSON(JsonObject json) {
        return new ExecutionRequest(json.getString("code", ""));
    }
}
```

#### ExecutionResult (Entity Layer)

Location: `io.webos.portfolio.compiler.entity.ExecutionResult`

```java
public record ExecutionResult(String output, boolean success) {
    
    public JsonObject toJSON() {
        return Json.createObjectBuilder()
            .add("output", output)
            .build();
    }
    
    public static ExecutionResult timeout() {
        return new ExecutionResult(
            "Timeout Error: Execution exceeded 500ms", 
            false
        );
    }
    
    public static ExecutionResult success(String output) {
        return new ExecutionResult(output, true);
    }
    
    public static ExecutionResult error(String message) {
        return new ExecutionResult(message, false);
    }
}
```

### Frontend Types

```typescript
interface ExecutionRequest {
    code: string;
}

interface ExecutionResponse {
    output: string;
}

interface ExecutionState {
    isExecuting: boolean;
    output: string;
    error: string | null;
}
```

## Timeout Execution Strategy

The JShellService uses a dedicated thread with timeout enforcement:

```java
// Pseudocode for timeout execution
ExecutorService executor = Executors.newSingleThreadExecutor();

String execute(String code) {
    Future<String> future = executor.submit(() -> {
        // Execute code in JShell
        return evaluateSnippets(code);
    });
    
    try {
        return future.get(500, TimeUnit.MILLISECONDS);
    } catch (TimeoutException e) {
        future.cancel(true);
        return "Timeout Error: Execution exceeded 500ms";
    }
}
```

Key implementation details:
- Use `ExecutorService.submit()` to run code in a separate thread
- Use `Future.get(timeout, unit)` to enforce the 500ms limit
- Cancel the future on timeout to interrupt the execution
- Create a fresh JShell instance per execution to avoid state pollution


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Timeout Enforcement

*For any* code snippet that executes for longer than 500 milliseconds (e.g., an infinite loop like `while(true){}`), the execute method shall return a result containing "Timeout Error" within a reasonable time bound (< 1 second total).

**Validates: Requirements 2.2, 2.3**

### Property 2: Output Completeness

*For any* valid Java code containing System.out.println statements and/or expression evaluations, the returned output shall contain both the printed text and the expression results (e.g., "x ==> 10").

**Validates: Requirements 3.1, 3.2, 3.4**

### Property 3: Error Message Propagation

*For any* code containing syntax errors or code that throws runtime exceptions, the returned output shall contain a descriptive error message rather than an empty string or null.

**Validates: Requirements 4.1, 4.2**

### Property 4: Robustness Under Malformed Input

*For any* input string (including null, empty, whitespace-only, or syntactically invalid code), the execute method shall return a non-null string response without throwing an uncaught exception.

**Validates: Requirements 4.3**

## Error Handling

### Backend Error Handling

| Scenario | Behavior | Response |
|----------|----------|----------|
| Valid code executes successfully | Return output | `{"output": "<results>"}` |
| Code times out (> 500ms) | Terminate and return error | `{"output": "Timeout Error: Execution exceeded 500ms"}` |
| Syntax error in code | Return compilation error | `{"output": "<error message>"}` |
| Runtime exception thrown | Return exception info | `{"output": "<exception message>"}` |
| Missing/invalid request body | HTTP 400 | `{"error": "Bad Request"}` |

### Exception Handling Strategy

```java
// JShellService handles all exceptions internally
// Never throws - always returns a result string
String execute(String code) {
    if (code == null || code.isBlank()) {
        return "No code provided";
    }
    
    try {
        // Execute with timeout
        return executeWithTimeout(code);
    } catch (TimeoutException e) {
        return "Timeout Error: Execution exceeded 500ms";
    } catch (Exception e) {
        return "Error: " + e.getMessage();
    }
}
```

### Frontend Error Handling

- Display all backend responses in the output panel
- Show loading indicator during execution
- Clear previous output when new execution starts

## Testing Strategy

### Property-Based Testing (jqwik)

Property-based tests will be implemented using jqwik with minimum 100 iterations per property.

**Test Configuration:**
- Framework: jqwik 1.9.2
- Assertions: AssertJ 3.26.3
- Minimum iterations: 100 per property

**Property Tests to Implement:**

1. **JShellTimeoutProperties** - Tests for Property 1
   - Generate code patterns that cause infinite loops
   - Verify timeout occurs within expected bounds
   - Verify timeout message is returned

2. **JShellOutputProperties** - Tests for Property 2
   - Generate random strings and create print statements
   - Generate random expressions and verify results
   - Verify combined output contains all expected parts

3. **JShellErrorProperties** - Tests for Property 3
   - Generate syntactically invalid code
   - Generate code that throws exceptions
   - Verify error messages are present in output

4. **JShellRobustnessProperties** - Tests for Property 4
   - Generate arbitrary strings including edge cases
   - Verify non-null response for all inputs
   - Verify no uncaught exceptions

### Unit Tests

Unit tests complement property tests for specific examples:

- Empty string input handling
- Null input handling
- Simple expression evaluation (e.g., "1 + 1")
- Variable declaration and usage
- Multi-line code execution

### Integration Tests

- End-to-end REST endpoint testing
- JSON request/response format verification
- HTTP status code verification

## Dependencies

### Backend

The JShell API is part of the JDK (jdk.jshell module). No additional Maven dependencies required.

**Note:** If using Java modules (module-info.java), add:
```java
requires jdk.jshell;
```

### Frontend

No additional dependencies required - uses existing React, TypeScript, and Tailwind CSS stack.
