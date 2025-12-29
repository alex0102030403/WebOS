package io.webos.portfolio.filesystem.control;

import io.webos.portfolio.filesystem.entity.FileNode;
import io.webos.portfolio.filesystem.entity.FileType;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Manages the Virtual File System with an in-memory Master File Table.
 * Provides file lookup and mutable operations for the portfolio content.
 */
@ApplicationScoped
public class FileSystemService {

    static final String DEFAULT_PARENT_ID = "desktop";
    static final String ROOT_ID = "desktop";

    /**
     * Master File Table containing all file system entries.
     * Mutable ArrayList pre-populated with portfolio content.
     */
    List<FileNode> mft = new ArrayList<>(List.of(
        new FileNode("desktop", null, "Desktop", FileType.DIRECTORY, null),
        new FileNode("cv", "desktop", "My CV", FileType.SHORTCUT, "app:cvviewer"),
        new FileNode("github", "desktop", "GitHub", FileType.SHORTCUT, "https://github.com/webos-portfolio"),
        new FileNode("about", "desktop", "About Me.txt", FileType.FILE, 
            "Welcome to my WebOS Portfolio! I'm passionate about building innovative software solutions."),
        new FileNode("projects", "desktop", "Projects", FileType.DIRECTORY, null),
        new FileNode("terminal", "desktop", "Terminal", FileType.SHORTCUT, "app:terminal"),
        new FileNode("task-manager", "desktop", "Task Manager", FileType.SHORTCUT, "app:taskmanager"),
        new FileNode("settings", "desktop", "Settings", FileType.SHORTCUT, "app:settings"),
        new FileNode("file-explorer", "desktop", "File Explorer", FileType.SHORTCUT, "app:fileexplorer"),
        new FileNode("chrome", "desktop", "Chrome", FileType.SHORTCUT, "app:chrome"),
        new FileNode("paint", "desktop", "Paint", FileType.SHORTCUT, "app:paint"),
        new FileNode("linkedin", "desktop", "LinkedIn", FileType.SHORTCUT, "https://linkedin.com/in/webos-portfolio"),
        new FileNode("project-webos", "projects", "WebOS Portfolio", FileType.FILE, 
            "A browser-based Windows 11 simulation powered by Java 25 backend."),
        new FileNode("project-api", "projects", "REST API Framework", FileType.FILE, 
            "High-performance JAX-RS framework with reactive streams support.")
    ));

    /**
     * Finds all FileNodes with the specified parentId.
     * Defaults to "desktop" when parentId is null.
     */
    public List<FileNode> findByParentId(String parentId) {
        var effectiveParentId = parentId == null ? DEFAULT_PARENT_ID : parentId;
        return this.mft.stream()
            .filter(node -> effectiveParentId.equals(node.parentId()))
            .toList();
    }

    /**
     * Finds a single FileNode by its id.
     */
    public Optional<FileNode> findById(String id) {
        return this.mft.stream()
            .filter(node -> node.id().equals(id))
            .findFirst();
    }

    /**
     * Finds a FileNode by name within a specific parent directory.
     * Used for duplicate checking before creating new nodes.
     */
    public Optional<FileNode> findByNameInParent(String parentId, String name) {
        var effectiveParentId = parentId == null ? DEFAULT_PARENT_ID : parentId;
        return this.mft.stream()
            .filter(node -> effectiveParentId.equals(node.parentId()))
            .filter(node -> name.equals(node.name()))
            .findFirst();
    }

    /**
     * Creates a new FileNode and adds it to the MFT.
     * Generates a UUID for the new node's id.
     */
    public FileNode createNode(String parentId, String name, FileType type, String content) {
        var id = UUID.randomUUID().toString();
        var node = new FileNode(id, parentId, name, type, content);
        this.mft.add(node);
        return node;
    }

    /**
     * Deletes a single FileNode by its id.
     * Returns true if the node was found and removed.
     */
    public boolean deleteNode(String id) {
        return this.mft.removeIf(node -> node.id().equals(id));
    }

    /**
     * Deletes a FileNode and all its children recursively.
     * Returns true if the node was found and removed.
     */
    public boolean deleteNodeRecursive(String id) {
        var nodeExists = findById(id).isPresent();
        if (!nodeExists) {
            return false;
        }
        
        collectChildIds(id).forEach(this::deleteNode);
        return deleteNode(id);
    }

    /**
     * Collects all descendant node ids for recursive deletion.
     */
    List<String> collectChildIds(String parentId) {
        var children = findByParentId(parentId);
        var result = new ArrayList<String>();
        
        for (var child : children) {
            result.addAll(collectChildIds(child.id()));
            result.add(child.id());
        }
        
        return result;
    }

    /**
     * Builds the full path string from root to the specified node.
     * Returns path formatted with forward slashes (e.g., /desktop/projects).
     */
    public String buildPath(String nodeId) {
        var pathParts = new ArrayList<String>();
        var currentId = nodeId;
        
        while (currentId != null) {
            var node = findById(currentId);
            if (node.isEmpty()) {
                break;
            }
            pathParts.addFirst(node.get().name());
            currentId = node.get().parentId();
        }
        
        return "/" + String.join("/", pathParts);
    }
}
