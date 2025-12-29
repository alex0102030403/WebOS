package io.webos.portfolio.compiler.entity;

import jakarta.json.JsonObject;

/**
 * Request payload for code execution.
 * Contains the Java code snippet to be executed by JShell.
 */
public record ExecutionRequest(String code) {

    /**
     * Deserializes an ExecutionRequest from a JSON-P JsonObject.
     * Returns empty code if the "code" field is missing.
     */
    public static ExecutionRequest fromJSON(JsonObject json) {
        var code = json.getString("code", "");
        return new ExecutionRequest(code);
    }
}
