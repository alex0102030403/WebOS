package io.webos.portfolio.filesystem.entity;

import jakarta.json.Json;
import jakarta.json.JsonObject;

/**
 * Represents a file system entry in the Virtual File System.
 * Supports directories, files, and shortcuts with JSON-P serialization.
 */
public record FileNode(
    String id,
    String parentId,
    String name,
    FileType type,
    String content
) {

    /**
     * Serializes this FileNode to a JSON-P JsonObject.
     */
    public JsonObject toJSON() {
        var builder = Json.createObjectBuilder()
            .add("id", this.id)
            .add("name", this.name)
            .add("type", this.type.name());

        if (this.parentId != null) {
            builder.add("parentId", this.parentId);
        } else {
            builder.addNull("parentId");
        }

        if (this.content != null) {
            builder.add("content", this.content);
        } else {
            builder.addNull("content");
        }

        return builder.build();
    }

    /**
     * Deserializes a FileNode from a JSON-P JsonObject.
     */
    public static FileNode fromJSON(JsonObject json) {
        var id = json.getString("id");
        var parentId = json.isNull("parentId") ? null : json.getString("parentId");
        var name = json.getString("name");
        var type = FileType.valueOf(json.getString("type"));
        var content = json.isNull("content") ? null : json.getString("content");

        return new FileNode(id, parentId, name, type, content);
    }
}
