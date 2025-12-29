package io.webos.portfolio.games.minesweeper.boundary;

import io.webos.portfolio.games.minesweeper.control.MinesweeperService;
import jakarta.inject.Inject;
import jakarta.json.JsonObject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * JAX-RS resource for Minesweeper game operations.
 * Provides endpoints for creating new games and processing cell clicks.
 */
@Path("/games/minesweeper")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MinesweeperResource {

    @Inject
    MinesweeperService minesweeperService;

    @POST
    @Path("/new")
    public Response newGame(JsonObject request) {
        var sessionId = request.getString("sessionId", null);
        if (sessionId == null || sessionId.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"sessionId is required\"}")
                    .build();
        }

        var response = this.minesweeperService.newGame(sessionId);
        return Response.ok(response.toJSON()).build();
    }

    @POST
    @Path("/click")
    public Response click(JsonObject request) {
        var sessionId = request.getString("sessionId", null);
        if (sessionId == null || sessionId.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"sessionId is required\"}")
                    .build();
        }

        var row = request.getInt("row", -1);
        var col = request.getInt("col", -1);
        if (row < 0 || row > 9 || col < 0 || col > 9) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"row and col must be between 0 and 9\"}")
                    .build();
        }

        return this.minesweeperService.click(sessionId, row, col)
                .map(gameResponse -> Response.ok(gameResponse.toJSON()).build())
                .orElseGet(() -> Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\": \"Session not found\"}")
                        .build());
    }
}
