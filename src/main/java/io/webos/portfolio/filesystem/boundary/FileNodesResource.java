package io.webos.portfolio.filesystem.boundary;

import io.webos.portfolio.filesystem.control.FileSystemService;
import io.webos.portfolio.filesystem.entity.FileNode;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * JAX-RS resource for Virtual File System operations.
 * Provides file node queries for the portfolio desktop experience.
 */
@Path("/file-nodes")
@Produces(MediaType.APPLICATION_JSON)
public class FileNodesResource {

    @Inject
    FileSystemService fileSystemService;

    /**
     * Lists all file nodes with the specified parentId.
     * Defaults to "desktop" when parentId is not provided.
     */
    @GET
    public Response listNodes(
            @QueryParam("parentId") @DefaultValue("desktop") String parentId) {
        
        var nodes = this.fileSystemService.findByParentId(parentId);
        var arrayBuilder = Json.createArrayBuilder();
        nodes.forEach(node -> arrayBuilder.add(node.toJSON()));
        
        return Response.ok(arrayBuilder.build()).build();
    }
}
