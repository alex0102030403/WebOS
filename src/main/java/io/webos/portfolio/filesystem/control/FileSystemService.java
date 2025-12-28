package io.webos.portfolio.filesystem.control;

import io.webos.portfolio.filesystem.entity.FileNode;
import io.webos.portfolio.filesystem.entity.FileType;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

/**
 * Manages the Virtual File System with an in-memory Master File Table.
 * Provides file lookup operations for the portfolio content.
 */
@ApplicationScoped
public class FileSystemService {

    static final String DEFAULT_PARENT_ID = "desktop";

    /**
     * Master File Table containing all file system entries.
     * Pre-populated with portfolio content.
     */
    final List<FileNode> mft = List.of(
        new FileNode("desktop", null, "Desktop", FileType.DIRECTORY, null),
        new FileNode("resume", "desktop", "Resume.pdf", FileType.FILE, 
            "Senior Software Engineer with 10+ years of experience in Java, cloud architecture, and distributed systems."),
        new FileNode("github", "desktop", "GitHub", FileType.SHORTCUT, "https://github.com/webos-portfolio"),
        new FileNode("about", "desktop", "About Me.txt", FileType.FILE, 
            "Welcome to my WebOS Portfolio! I'm passionate about building innovative software solutions."),
        new FileNode("projects", "desktop", "Projects", FileType.DIRECTORY, null),
        new FileNode("terminal", "desktop", "Terminal", FileType.SHORTCUT, "app:terminal"),
        new FileNode("task-manager", "desktop", "Task Manager", FileType.SHORTCUT, "app:taskmanager"),
        new FileNode("linkedin", "desktop", "LinkedIn", FileType.SHORTCUT, "https://linkedin.com/in/webos-portfolio"),
        new FileNode("project-webos", "projects", "WebOS Portfolio", FileType.FILE, 
            "A browser-based Windows 11 simulation powered by Java 25 backend."),
        new FileNode("project-api", "projects", "REST API Framework", FileType.FILE, 
            "High-performance JAX-RS framework with reactive streams support.")
    );

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
}
