package io.webos.portfolio.browser.boundary;

import io.webos.portfolio.browser.control.BrowserService;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * JAX-RS resource for browser proxy operations.
 * Provides secure, whitelist-based content proxying for the WebOS portfolio.
 */
@Path("/browser")
public class BrowserResource {

    @Inject
    BrowserService browserService;

    /**
     * Navigates to a URL and returns sanitized HTML content.
     * Returns 404 for blocked URLs, 502 for fetch failures.
     */
    @GET
    @Path("/navigate")
    @Produces(MediaType.TEXT_HTML)
    public Response navigate(@QueryParam("url") String url) {
        if (url == null || url.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Json.createObjectBuilder()
                            .add("error", "URL parameter is required")
                            .build()
                            .toString())
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }

        try {
            var sanitizedHtml = this.browserService.fetchAndSanitize(url);
            return Response.ok(sanitizedHtml, MediaType.TEXT_HTML).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Json.createObjectBuilder()
                            .add("error", "404 Not Found")
                            .build()
                            .toString())
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }
    }
}
