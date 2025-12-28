package io.webos.portfolio.terminal.control;

import io.webos.portfolio.filesystem.control.FileSystemService;
import io.webos.portfolio.filesystem.entity.FileNode;
import io.webos.portfolio.terminal.entity.CommandResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.stream.Collectors;

/**
 * Parses and executes terminal commands using pattern matching.
 * Delegates file operations to FileSystemService.
 */
@ApplicationScoped
public class CommandService {

    @Inject
    FileSystemService fileSystemService;

    /**
     * Executes a command string and returns the result.
     * Uses pattern matching for switch to dispatch commands.
     */
    public CommandResult execute(String input) {
        if (input == null || input.isBlank()) {
            return CommandResult.failure("No command provided");
        }

        var parts = input.trim().split("\\s+");
        var command = parts[0];

        return switch (command) {
            case "ls" -> listDirectory(parts);
            case "cat" -> catFile(parts);
            case "uname" -> systemInfo();
            case "whoami" -> currentUser();
            case "java" -> javaCommand(parts);
            default -> CommandResult.failure("Unknown command: " + command);
        };
    }

    CommandResult listDirectory(String[] parts) {
        var parentId = parts.length > 1 ? parts[1] : "desktop";
        var nodes = this.fileSystemService.findByParentId(parentId);

        if (nodes.isEmpty()) {
            return CommandResult.failure("Directory not found: " + parentId);
        }

        var output = nodes.stream()
            .map(FileNode::name)
            .collect(Collectors.joining("\n"));

        return CommandResult.success(output);
    }

    CommandResult catFile(String[] parts) {
        if (parts.length < 2) {
            return CommandResult.failure("Usage: cat <filename>");
        }

        var fileId = parts[1];
        var node = this.fileSystemService.findById(fileId);

        return node
            .map(file -> file.content() != null 
                ? CommandResult.success(file.content())
                : CommandResult.failure("File has no content: " + fileId))
            .orElse(CommandResult.failure("File not found: " + fileId));
    }

    CommandResult systemInfo() {
        var info = """
            WebOS Portfolio 1.0.0
            Java %s
            %s %s""".formatted(
                System.getProperty("java.version"),
                System.getProperty("os.name"),
                System.getProperty("os.arch")
            );
        return CommandResult.success(info);
    }

    CommandResult currentUser() {
        return CommandResult.success("Visitor");
    }

    CommandResult javaCommand(String[] parts) {
        if (parts.length < 2) {
            return CommandResult.failure("Usage: java --version");
        }

        return switch (parts[1]) {
            case "--version", "-version" -> {
                var version = """
                    java %s
                    Java(TM) SE Runtime Environment
                    Java HotSpot(TM) 64-Bit Server VM""".formatted(
                        System.getProperty("java.version")
                    );
                yield CommandResult.success(version);
            }
            default -> CommandResult.failure("Unknown java option: " + parts[1]);
        };
    }
}
