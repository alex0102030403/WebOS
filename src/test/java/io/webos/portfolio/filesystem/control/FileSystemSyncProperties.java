package io.webos.portfolio.filesystem.control;

import io.webos.portfolio.filesystem.entity.FileType;
import io.webos.portfolio.terminal.control.CommandService;
import net.jqwik.api.*;
import net.jqwik.api.constraints.AlphaChars;
import net.jqwik.api.constraints.StringLength;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests verifying synchronization between terminal commands
 * and file system queries (used by File Explorer).
 * 
 * Feature: file-explorer, Property 11: File system changes sync to explorer
 * Validates: Requirements 8.1, 8.2, 8.3
 */
class FileSystemSyncProperties {

    /**
     * Property 11: File System Changes Sync to Explorer
     * 
     * For any FileNode created via terminal mkdir command,
     * the File Explorer (via FileSystemService) SHALL reflect that change
     * when querying the same parentId.
     * 
     * Validates: Requirements 8.1, 8.3
     */
    @Property(tries = 100)
    void mkdirCreatesDirectoryVisibleToExplorer(
            @ForAll @AlphaChars @StringLength(min = 1, max = 20) String dirName
    ) {
        var fileSystemService = new FileSystemService();
        var commandService = createCommandService(fileSystemService);
        
        var initialNodes = fileSystemService.findByParentId("desktop");
        var initialCount = initialNodes.size();
        
        // Skip if directory already exists
        if (fileSystemService.findByNameInParent("desktop", dirName).isPresent()) {
            return;
        }
        
        // Create directory via terminal
        var result = commandService.execute("mkdir " + dirName);
        
        // Verify via FileSystemService (explorer's data source)
        var updatedNodes = fileSystemService.findByParentId("desktop");
        var createdNode = fileSystemService.findByNameInParent("desktop", dirName);
        
        assertThat(result.success()).isTrue();
        assertThat(updatedNodes).hasSize(initialCount + 1);
        assertThat(createdNode).isPresent();
        assertThat(createdNode.get().type()).isEqualTo(FileType.DIRECTORY);
        assertThat(createdNode.get().name()).isEqualTo(dirName);
    }

    /**
     * Property 11: File System Changes Sync to Explorer
     * 
     * For any FileNode created via terminal touch command,
     * the File Explorer (via FileSystemService) SHALL reflect that change
     * when querying the same parentId.
     * 
     * Validates: Requirements 8.1
     */
    @Property(tries = 100)
    void touchCreatesFileVisibleToExplorer(
            @ForAll @AlphaChars @StringLength(min = 1, max = 20) String fileName
    ) {
        var fileSystemService = new FileSystemService();
        var commandService = createCommandService(fileSystemService);
        
        var initialNodes = fileSystemService.findByParentId("desktop");
        var initialCount = initialNodes.size();
        
        // Skip if file already exists
        if (fileSystemService.findByNameInParent("desktop", fileName).isPresent()) {
            return;
        }
        
        // Create file via terminal
        var result = commandService.execute("touch " + fileName);
        
        // Verify via FileSystemService (explorer's data source)
        var updatedNodes = fileSystemService.findByParentId("desktop");
        var createdNode = fileSystemService.findByNameInParent("desktop", fileName);
        
        assertThat(result.success()).isTrue();
        assertThat(updatedNodes).hasSize(initialCount + 1);
        assertThat(createdNode).isPresent();
        assertThat(createdNode.get().type()).isEqualTo(FileType.FILE);
    }

    /**
     * Property 11: File System Changes Sync to Explorer
     * 
     * For any FileNode deleted via terminal rm command,
     * the File Explorer (via FileSystemService) SHALL no longer display
     * that file when querying.
     * 
     * Validates: Requirements 8.2
     */
    @Property(tries = 100)
    void rmRemovesFileFromExplorerView(
            @ForAll @AlphaChars @StringLength(min = 1, max = 20) String fileName
    ) {
        var fileSystemService = new FileSystemService();
        var commandService = createCommandService(fileSystemService);
        
        // Skip if file already exists with same name
        if (fileSystemService.findByNameInParent("desktop", fileName).isPresent()) {
            return;
        }
        
        // First create a file via terminal
        commandService.execute("touch " + fileName);
        
        var nodesAfterCreate = fileSystemService.findByParentId("desktop");
        var countAfterCreate = nodesAfterCreate.size();
        
        // Verify file exists
        assertThat(fileSystemService.findByNameInParent("desktop", fileName)).isPresent();
        
        // Delete via terminal
        var result = commandService.execute("rm " + fileName);
        
        // Verify via FileSystemService (explorer's data source)
        var nodesAfterDelete = fileSystemService.findByParentId("desktop");
        var deletedNode = fileSystemService.findByNameInParent("desktop", fileName);
        
        assertThat(result.success()).isTrue();
        assertThat(nodesAfterDelete).hasSize(countAfterCreate - 1);
        assertThat(deletedNode).isEmpty();
    }

    /**
     * Property 11: File System Changes Sync to Explorer
     * 
     * For any directory deleted via terminal rm -r command,
     * the File Explorer (via FileSystemService) SHALL no longer display
     * that directory when querying.
     * 
     * Validates: Requirements 8.2, 8.3
     */
    @Property(tries = 100)
    void rmRecursiveRemovesDirectoryFromExplorerView(
            @ForAll @AlphaChars @StringLength(min = 1, max = 20) String dirName
    ) {
        var fileSystemService = new FileSystemService();
        var commandService = createCommandService(fileSystemService);
        
        // Skip if directory already exists with same name
        if (fileSystemService.findByNameInParent("desktop", dirName).isPresent()) {
            return;
        }
        
        // First create a directory via terminal
        commandService.execute("mkdir " + dirName);
        
        var nodesAfterCreate = fileSystemService.findByParentId("desktop");
        var countAfterCreate = nodesAfterCreate.size();
        
        // Verify directory exists
        assertThat(fileSystemService.findByNameInParent("desktop", dirName)).isPresent();
        
        // Delete via terminal with -r flag
        var result = commandService.execute("rm -r " + dirName);
        
        // Verify via FileSystemService (explorer's data source)
        var nodesAfterDelete = fileSystemService.findByParentId("desktop");
        var deletedNode = fileSystemService.findByNameInParent("desktop", dirName);
        
        assertThat(result.success()).isTrue();
        assertThat(nodesAfterDelete).hasSize(countAfterCreate - 1);
        assertThat(deletedNode).isEmpty();
    }

    /**
     * Creates a CommandService with injected FileSystemService.
     * Uses reflection to set the field since we're not in a CDI context.
     */
    CommandService createCommandService(FileSystemService fileSystemService) {
        var commandService = new CommandService();
        try {
            var field = CommandService.class.getDeclaredField("fileSystemService");
            field.setAccessible(true);
            field.set(commandService, fileSystemService);
        } catch (Exception e) {
            throw new RuntimeException("Failed to inject FileSystemService", e);
        }
        return commandService;
    }
}
