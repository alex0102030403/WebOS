package io.webos.portfolio.games.minesweeper.entity;

import jakarta.json.Json;
import jakarta.json.JsonObject;

/**
 * Represents a single cell reveal update sent to the client.
 * Contains row, column, and the revealed value (0-8 for adjacent count, 9 for mine).
 */
public record CellUpdate(int r, int c, int val) {

    public JsonObject toJSON() {
        return Json.createObjectBuilder()
                .add("r", this.r)
                .add("c", this.c)
                .add("val", this.val)
                .build();
    }

    public static CellUpdate fromJSON(JsonObject json) {
        return new CellUpdate(
                json.getInt("r"),
                json.getInt("c"),
                json.getInt("val")
        );
    }
}
