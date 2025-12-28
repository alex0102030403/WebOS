package io.webos.portfolio.boot.boundary;

import io.webos.portfolio.boot.control.BootService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * JAX-RS resource for system boot configuration.
 * Returns OS settings needed for frontend initialization.
 */
@Path("/system/boot")
@Produces(MediaType.APPLICATION_JSON)
public class BootResource {

    @Inject
    BootService bootService;

    /**
     * Returns the boot configuration for system startup.
     */
    @GET
    public Response boot() {
        var config = this.bootService.bootConfig();
        return Response.ok(config.toJSON()).build();
    }
}
