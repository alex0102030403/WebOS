package io.webos.portfolio.compiler.entity;

import jakarta.json.Json;
import jakarta.json.JsonObject;

/**
 * Result of code execution containing the output string.
 * Includes factory methods for common result types: success, error, and timeout.
 */
public record ExecutionResult(String output, boolean success) {

    /**
     * Serializes this ExecutionResult to a JSON-P JsonObject.
     */
    public JsonObject toJSON() {
        return Json.createObjectBuilder()
            .add("output", this.output)
            .build();
    }

    /**
     * Factory method for successful execution.
     */
    public static ExecutionResult success(String output) {
        return new ExecutionResult(output, true);
    }

    /**
     * Factory method for execution errors.
     */
    public static ExecutionResult error(String message) {
        return new ExecutionResult(message, false);
    }

    /**
     * Factory method for timeout errors.
     */
    public static ExecutionResult timeout() {
        return new ExecutionResult("Timeout Error: Execution exceeded 500ms", false);
    }
}
