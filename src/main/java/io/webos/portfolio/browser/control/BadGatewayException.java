package io.webos.portfolio.browser.control;

import jakarta.json.Json;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Exception thrown when the browser proxy fails to fetch content from an external site.
 * Results in HTTP 502 Bad Gateway response with JSON error body.
 */
public class BadGatewayException extends WebApplicationException {

    public BadGatewayException(String message) {
        super(message, Response.status(Response.Status.BAD_GATEWAY)
                .entity(Json.createObjectBuilder()
                        .add("error", "502 Bad Gateway")
                        .build()
                        .toString())
                .type(MediaType.APPLICATION_JSON)
                .build());
    }
}
