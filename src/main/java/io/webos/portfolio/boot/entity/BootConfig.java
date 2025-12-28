package io.webos.portfolio.boot.entity;

import jakarta.json.Json;
import jakarta.json.JsonObject;

/**
 * Boot configuration containing OS settings returned during system startup.
 */
public record BootConfig(
    String osVersion,
    String theme,
    String wallpaperUrl,
    String username
) {

    /**
     * Serializes this BootConfig to a JSON-P JsonObject.
     */
    public JsonObject toJSON() {
        return Json.createObjectBuilder()
            .add("osVersion", this.osVersion)
            .add("theme", this.theme)
            .add("wallpaperUrl", this.wallpaperUrl)
            .add("username", this.username)
            .build();
    }

    /**
     * Deserializes a BootConfig from a JSON-P JsonObject.
     */
    public static BootConfig fromJSON(JsonObject json) {
        return new BootConfig(
            json.getString("osVersion"),
            json.getString("theme"),
            json.getString("wallpaperUrl"),
            json.getString("username")
        );
    }
}
