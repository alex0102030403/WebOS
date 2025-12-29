package io.webos.portfolio.games.minesweeper.entity;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import java.util.List;

/**
 * API response structure for Minesweeper game operations.
 * Contains game status and list of revealed cell updates.
 */
public record GameResponse(GameStatus status, List<CellUpdate> updates) {

    public JsonObject toJSON() {
        var updatesArray = Json.createArrayBuilder();
        this.updates.forEach(u -> updatesArray.add(u.toJSON()));
        return Json.createObjectBuilder()
                .add("status", this.status.name())
                .add("updates", updatesArray)
                .build();
    }
}
