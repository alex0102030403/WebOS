package io.webos.portfolio.terminal.control;

import io.webos.portfolio.filesystem.control.FileSystemService;
import io.webos.portfolio.filesystem.entity.FileNode;
import io.webos.portfolio.filesystem.entity.FileType;
import io.webos.portfolio.terminal.entity.CommandResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.json.JsonObject;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Parses and executes terminal commands using pattern matching.
 * Delegates file operations to FileSystemService.
 */
@ApplicationScoped
public class CommandService {

    static final List<String> COMMANDS = List.of(
        "ls", "cat", "cd", "mkdir", "touch", "rm", "pwd", "uname", "whoami", "java", "echo", "help", "clear"
    );

    @Inject
    FileSystemService fileSystemService;

    /**
     * Current directory context for terminal operations.
     * Initialized to desktop (home directory).
     */
    String currentDirectory = "desktop";

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
            case "cd" -> changeDirectory(parts);
            case "mkdir" -> makeDirectory(parts);
            case "touch" -> touchFile(parts);
            case "rm" -> removeFile(parts);
            case "pwd" -> printWorkingDirectory();
            case "uname" -> systemInfo();
            case "whoami" -> currentUser();
            case "java" -> javaCommand(parts);
            case "echo" -> echo(input);
            default -> CommandResult.failure("Unknown command: " + command);
        };
    }

    CommandResult listDirectory(String[] parts) {
        var targetId = parts.length > 1 
            ? resolvePathToId(parts[1]) 
            : this.currentDirectory;
        
        if (targetId == null) {
            return CommandResult.failure("Directory not found: " + parts[1]);
        }
        
        var targetNode = this.fileSystemService.findById(targetId);
        if (targetNode.isPresent() && targetNode.get().type() != FileType.DIRECTORY) {
            return CommandResult.failure("ls: " + parts[1] + ": Not a directory");
        }

        var nodes = this.fileSystemService.findByParentId(targetId);
        if (nodes.isEmpty() && targetNode.isEmpty()) {
            return CommandResult.failure("Directory not found: " + (parts.length > 1 ? parts[1] : targetId));
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

        var fileName = parts[1];
        var node = this.fileSystemService.findByNameInParent(this.currentDirectory, fileName);
        
        if (node.isEmpty()) {
            node = this.fileSystemService.findById(fileName);
        }

        if (node.isEmpty()) {
            return CommandResult.failure("File not found: " + fileName);
        }
        
        if (node.get().type() == FileType.DIRECTORY) {
            return CommandResult.failure("cat: " + fileName + ": Is a directory");
        }

        return node.get().content() != null 
            ? CommandResult.success(node.get().content())
            : CommandResult.failure("File has no content: " + fileName);
    }

    CommandResult changeDirectory(String[] parts) {
        if (parts.length < 2) {
            this.currentDirectory = "desktop";
            return CommandResult.success("");
        }

        var target = parts[1];
        
        if ("..".equals(target)) {
            var currentNode = this.fileSystemService.findById(this.currentDirectory);
            if (currentNode.isPresent() && currentNode.get().parentId() != null) {
                this.currentDirectory = currentNode.get().parentId();
            }
            return CommandResult.success("");
        }

        var targetNode = this.fileSystemService.findByNameInParent(this.currentDirectory, target);
        if (targetNode.isEmpty()) {
            targetNode = this.fileSystemService.findById(target);
        }

        if (targetNode.isEmpty()) {
            return CommandResult.failure("Directory not found: " + target);
        }

        if (targetNode.get().type() != FileType.DIRECTORY) {
            return CommandResult.failure("cd: " + target + ": Not a directory");
        }

        this.currentDirectory = targetNode.get().id();
        return CommandResult.success("");
    }

    CommandResult makeDirectory(String[] parts) {
        if (parts.length < 2) {
            return CommandResult.failure("Usage: mkdir <dirname>");
        }

        var dirName = parts[1];
        var existing = this.fileSystemService.findByNameInParent(this.currentDirectory, dirName);
        
        if (existing.isPresent()) {
            return CommandResult.failure("Directory already exists: " + dirName);
        }

        this.fileSystemService.createNode(this.currentDirectory, dirName, FileType.DIRECTORY, null);
        return CommandResult.success("Directory created: " + dirName);
    }

    CommandResult touchFile(String[] parts) {
        if (parts.length < 2) {
            return CommandResult.failure("Usage: touch <filename>");
        }

        var fileName = parts[1];
        var existing = this.fileSystemService.findByNameInParent(this.currentDirectory, fileName);
        
        if (existing.isPresent()) {
            return CommandResult.success("");
        }

        this.fileSystemService.createNode(this.currentDirectory, fileName, FileType.FILE, "");
        return CommandResult.success("");
    }

    CommandResult removeFile(String[] parts) {
        if (parts.length < 2) {
            return CommandResult.failure("Usage: rm [-r] <name>");
        }

        var recursive = "-r".equals(parts[1]);
        var targetName = recursive ? (parts.length > 2 ? parts[2] : null) : parts[1];
        
        if (targetName == null) {
            return CommandResult.failure("Usage: rm [-r] <name>");
        }

        var targetNode = this.fileSystemService.findByNameInParent(this.currentDirectory, targetName);
        if (targetNode.isEmpty()) {
            targetNode = this.fileSystemService.findById(targetName);
        }

        if (targetNode.isEmpty()) {
            return CommandResult.failure("File not found: " + targetName);
        }

        if (targetNode.get().type() == FileType.DIRECTORY && !recursive) {
            return CommandResult.failure("rm: " + targetName + ": Is a directory (use -r)");
        }

        if (recursive) {
            this.fileSystemService.deleteNodeRecursive(targetNode.get().id());
        } else {
            this.fileSystemService.deleteNode(targetNode.get().id());
        }

        return CommandResult.success("");
    }

    CommandResult printWorkingDirectory() {
        var path = this.fileSystemService.buildPath(this.currentDirectory);
        return CommandResult.success(path);
    }

    /**
     * Resolves a path string to a node id.
     * Supports relative paths from current directory.
     */
    String resolvePathToId(String path) {
        if ("..".equals(path)) {
            var currentNode = this.fileSystemService.findById(this.currentDirectory);
            return currentNode.map(FileNode::parentId).orElse(null);
        }
        
        var byName = this.fileSystemService.findByNameInParent(this.currentDirectory, path);
        if (byName.isPresent()) {
            return byName.get().id();
        }
        
        var byId = this.fileSystemService.findById(path);
        return byId.map(FileNode::id).orElse(null);
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

    /**
     * Handles echo command with redirection.
     * Supports: echo "content" > file (overwrite)
     *           echo "content" >> file (append)
     *           echo content (output to terminal)
     */
    CommandResult echo(String input) {
        var afterEcho = input.length() > 4 ? input.substring(5).trim() : "";
        
        if (afterEcho.isEmpty()) {
            return CommandResult.success("");
        }
        
        if (afterEcho.contains(">>")) {
            return handleAppend(afterEcho);
        } else if (afterEcho.contains(">")) {
            return handleOverwrite(afterEcho);
        }
        
        return CommandResult.success(extractContent(afterEcho));
    }

    CommandResult handleOverwrite(String input) {
        var redirectIndex = input.indexOf(">");
        if (redirectIndex < 0) {
            return CommandResult.failure("Invalid redirection syntax");
        }
        
        var contentPart = input.substring(0, redirectIndex).trim();
        var filename = input.substring(redirectIndex + 1).trim();
        
        if (filename.isEmpty()) {
            return CommandResult.failure("No filename specified");
        }
        
        var content = extractContent(contentPart);
        this.fileSystemService.saveFile(this.currentDirectory, filename, content);
        return CommandResult.success("");
    }

    CommandResult handleAppend(String input) {
        var redirectIndex = input.indexOf(">>");
        if (redirectIndex < 0) {
            return CommandResult.failure("Invalid redirection syntax");
        }
        
        var contentPart = input.substring(0, redirectIndex).trim();
        var filename = input.substring(redirectIndex + 2).trim();
        
        if (filename.isEmpty()) {
            return CommandResult.failure("No filename specified");
        }
        
        var content = extractContent(contentPart);
        var existing = this.fileSystemService.findByNameInParent(this.currentDirectory, filename);
        var newContent = existing
            .map(f -> f.content() != null ? f.content() + "\n" + content : content)
            .orElse(content);
        
        this.fileSystemService.saveFile(this.currentDirectory, filename, newContent);
        return CommandResult.success("");
    }

    String extractContent(String quoted) {
        if (quoted == null || quoted.isEmpty()) {
            return "";
        }
        if (quoted.startsWith("\"") && quoted.endsWith("\"") && quoted.length() >= 2) {
            return quoted.substring(1, quoted.length() - 1);
        }
        if (quoted.startsWith("'") && quoted.endsWith("'") && quoted.length() >= 2) {
            return quoted.substring(1, quoted.length() - 1);
        }
        return quoted;
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

    /**
     * Returns current terminal context as JSON.
     * Includes current directory path and name.
     */
    public JsonObject getContext() {
        var path = this.fileSystemService.buildPath(this.currentDirectory);
        var currentNode = this.fileSystemService.findById(this.currentDirectory);
        var dirName = currentNode.map(FileNode::name).orElse("desktop");
        
        return Json.createObjectBuilder()
            .add("currentDirectory", this.currentDirectory)
            .add("currentPath", path)
            .add("currentDirName", dirName)
            .build();
    }

    /**
     * Returns autocomplete suggestions for the given input.
     * Completes commands and file/directory names.
     */
    public List<String> autocomplete(String input) {
        if (input == null || input.isBlank()) {
            return COMMANDS;
        }

        var parts = input.trim().split("\\s+");
        
        // Complete command name if only one word
        if (parts.length == 1 && !input.endsWith(" ")) {
            var prefix = parts[0].toLowerCase();
            return COMMANDS.stream()
                .filter(cmd -> cmd.startsWith(prefix))
                .toList();
        }

        // Complete file/directory names for second argument
        var prefix = parts.length > 1 ? parts[parts.length - 1] : "";
        var nodes = this.fileSystemService.findByParentId(this.currentDirectory);
        
        return nodes.stream()
            .map(FileNode::name)
            .filter(name -> name.toLowerCase().startsWith(prefix.toLowerCase()))
            .toList();
    }
}
