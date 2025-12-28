package io.webos.portfolio.processes.entity;

import jakarta.json.Json;
import jakarta.json.JsonObject;

/**
 * Represents a system process with memory usage and status information.
 */
public record ProcessInfo(
    String pid,
    String name,
    long memoryBytes,
    String status
) {

    /**
     * Serializes this ProcessInfo to a JSON-P JsonObject.
     */
    public JsonObject toJSON() {
        return Json.createObjectBuilder()
            .add("pid", this.pid)
            .add("name", this.name)
            .add("memoryBytes", this.memoryBytes)
            .add("status", this.status)
            .build();
    }

    /**
     * Deserializes a ProcessInfo from a JSON-P JsonObject.
     */
    public static ProcessInfo fromJSON(JsonObject json) {
        return new ProcessInfo(
            json.getString("pid"),
            json.getString("name"),
            json.getJsonNumber("memoryBytes").longValue(),
            json.getString("status")
        );
    }
}
