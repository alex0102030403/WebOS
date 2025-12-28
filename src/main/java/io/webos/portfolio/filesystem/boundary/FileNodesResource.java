package io.webos.portfolio.filesystem.boundary;

import io.webos.portfolio.filesystem.control.FileSystemService;
import io.webos.portfolio.filesystem.entity.FileNode;
import io.webos.portfolio.filesystem.entity.FileType;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
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
@Consumes(MediaType.APPLICATION_JSON)
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

    /**
     * Gets a single file node by its id.
     */
    @GET
    @Path("/{id}")
    public Response getNode(@PathParam("id") String id) {
        return this.fileSystemService.findById(id)
            .map(node -> Response.ok(node.toJSON()).build())
            .orElse(Response.status(Response.Status.NOT_FOUND)
                .entity(Json.createObjectBuilder()
                    .add("error", "File not found: " + id)
                    .build())
                .build());
    }

    /**
     * Creates a new file node (file or directory).
     */
    @POST
    public Response createNode(JsonObject request) {
        var parentId = request.getString("parentId", "desktop");
        var name = request.getString("name", null);
        var typeStr = request.getString("type", "FILE");
        var content = request.getString("content", null);

        if (name == null || name.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Json.createObjectBuilder()
                    .add("error", "Name is required")
                    .build())
                .build();
        }

        var existing = this.fileSystemService.findByNameInParent(parentId, name);
        if (existing.isPresent()) {
            return Response.status(Response.Status.CONFLICT)
                .entity(Json.createObjectBuilder()
                    .add("error", "File already exists: " + name)
                    .build())
                .build();
        }

        var type = FileType.valueOf(typeStr);
        var node = this.fileSystemService.createNode(parentId, name, type, content);
        
        return Response.status(Response.Status.CREATED)
            .entity(node.toJSON())
            .build();
    }

    /**
     * Deletes a file node by its id.
     */
    @DELETE
    @Path("/{id}")
    public Response deleteNode(@PathParam("id") String id) {
        var node = this.fileSystemService.findById(id);
        if (node.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Json.createObjectBuilder()
                    .add("error", "File not found: " + id)
                    .build())
                .build();
        }

        var deleted = node.get().type() == FileType.DIRECTORY
            ? this.fileSystemService.deleteNodeRecursive(id)
            : this.fileSystemService.deleteNode(id);

        if (deleted) {
            return Response.noContent().build();
        }
        
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity(Json.createObjectBuilder()
                .add("error", "Failed to delete node")
                .build())
            .build();
    }
}
