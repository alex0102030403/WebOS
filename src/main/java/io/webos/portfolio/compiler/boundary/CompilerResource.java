package io.webos.portfolio.compiler.boundary;

import io.webos.portfolio.compiler.control.JShellService;
import io.webos.portfolio.compiler.entity.ExecutionRequest;
import io.webos.portfolio.compiler.entity.ExecutionResult;
import jakarta.inject.Inject;
import jakarta.json.JsonObject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * JAX-RS resource for Java code execution via JShell.
 * Accepts code snippets via POST and returns execution results.
 */
@Path("/compiler")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CompilerResource {

    @Inject
    JShellService jshellService;

    /**
     * Executes Java code and returns the combined output.
     * 
     * @param request JSON object containing "code" field
     * @return JSON response with "output" field containing execution results
     */
    @POST
    @Path("/execute")
    public Response execute(JsonObject request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }

        var executionRequest = ExecutionRequest.fromJSON(request);
        var code = executionRequest.code();

        if (code == null || code.isBlank()) {
            throw new BadRequestException("Code field is required and cannot be empty");
        }

        var output = this.jshellService.execute(code);
        var result = ExecutionResult.success(output);
        
        return Response.ok(result.toJSON()).build();
    }
}
