package io.webos.portfolio.terminal.boundary;

import io.webos.portfolio.terminal.control.CommandService;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * JAX-RS resource for terminal command execution.
 * Accepts commands via POST and returns execution results.
 */
@Path("/terminal")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TerminalResource {

    @Inject
    CommandService commandService;

    /**
     * Executes a terminal command and returns the result.
     */
    @POST
    @Path("/exec")
    public Response execute(JsonObject request) {
        var command = request.getString("command", "");
        var result = this.commandService.execute(command);
        return Response.ok(result.toJSON()).build();
    }

    /**
     * Returns current terminal context including working directory.
     */
    @GET
    @Path("/context")
    public Response context() {
        var context = this.commandService.getContext();
        return Response.ok(context).build();
    }

    /**
     * Returns autocomplete suggestions for the given input prefix.
     */
    @GET
    @Path("/autocomplete")
    public Response autocomplete(@QueryParam("input") String input) {
        var suggestions = this.commandService.autocomplete(input);
        var array = Json.createArrayBuilder();
        suggestions.forEach(array::add);
        return Response.ok(Json.createObjectBuilder().add("suggestions", array).build()).build();
    }
}
