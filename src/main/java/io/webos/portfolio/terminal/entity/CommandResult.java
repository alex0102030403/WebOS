package io.webos.portfolio.terminal.entity;

import jakarta.json.Json;
import jakarta.json.JsonObject;

/**
 * Result of a terminal command execution.
 * Contains success status with either output (on success) or error message (on failure).
 */
public record CommandResult(
    boolean success,
    String output,
    String error
) {

    /**
     * Factory method for successful command execution.
     */
    public static CommandResult success(String output) {
        return new CommandResult(true, output, null);
    }

    /**
     * Factory method for failed command execution.
     */
    public static CommandResult failure(String error) {
        return new CommandResult(false, null, error);
    }

    /**
     * Serializes this CommandResult to a JSON-P JsonObject.
     */
    public JsonObject toJSON() {
        var builder = Json.createObjectBuilder()
            .add("success", this.success);

        if (this.output != null) {
            builder.add("output", this.output);
        } else {
            builder.addNull("output");
        }

        if (this.error != null) {
            builder.add("error", this.error);
        } else {
            builder.addNull("error");
        }

        return builder.build();
    }

    /**
     * Deserializes a CommandResult from a JSON-P JsonObject.
     */
    public static CommandResult fromJSON(JsonObject json) {
        var success = json.getBoolean("success");
        var output = json.isNull("output") ? null : json.getString("output");
        var error = json.isNull("error") ? null : json.getString("error");

        return new CommandResult(success, output, error);
    }
}
