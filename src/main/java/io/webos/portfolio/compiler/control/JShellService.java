package io.webos.portfolio.compiler.control;

import jakarta.enterprise.context.ApplicationScoped;
import jdk.jshell.JShell;
import jdk.jshell.Snippet;
import jdk.jshell.SnippetEvent;
import jdk.jshell.Diag;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Executes Java code snippets using the JShell API with timeout enforcement.
 * Each execution runs in a separate thread with a 500ms timeout to prevent
 * infinite loops from freezing the server.
 */
@ApplicationScoped
public class JShellService {

    static final System.Logger LOGGER = System.getLogger(JShellService.class.getName());
    static final long TIMEOUT_MS = 3000;

    /**
     * Executes Java code and returns combined output.
     * Runs in a separate thread with 500ms timeout.
     *
     * @param code the Java code to execute
     * @return combined output (System.out + expression results)
     */
    public String execute(String code) {
        if (code == null || code.isBlank()) {
            return "No code provided";
        }

        ExecutorService executor = Executors.newSingleThreadExecutor();
        try {
            Future<String> future = executor.submit(() -> executeInJShell(code));
            return future.get(TIMEOUT_MS, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            LOGGER.log(System.Logger.Level.WARNING, "Code execution timed out");
            return "Timeout Error: Execution exceeded 3000ms";
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "Error: Execution interrupted";
        } catch (Exception e) {
            LOGGER.log(System.Logger.Level.ERROR, "Execution error", e);
            return "Error: " + e.getMessage();
        } finally {
            executor.shutdownNow();
        }
    }

    String executeInJShell(String code) {
        var outputCapture = new ByteArrayOutputStream();
        var resultBuilder = new StringBuilder();

        try (var shell = createJShellWithOutput(outputCapture)) {
            var events = shell.eval(code);
            
            for (var event : events) {
                processSnippetEvent(event, shell, resultBuilder);
            }

            var capturedOutput = outputCapture.toString(StandardCharsets.UTF_8);
            return combineOutput(capturedOutput, resultBuilder.toString());
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    JShell createJShellWithOutput(ByteArrayOutputStream outputCapture) {
        var printStream = new PrintStream(outputCapture, true, StandardCharsets.UTF_8);
        return JShell.builder()
            .out(printStream)
            .err(printStream)
            .build();
    }

    void processSnippetEvent(SnippetEvent event, JShell shell, StringBuilder resultBuilder) {
        var snippet = event.snippet();
        var status = event.status();

        if (status == Snippet.Status.REJECTED) {
            appendCompilationErrors(shell, snippet, resultBuilder);
            return;
        }

        if (event.exception() != null) {
            appendException(event.exception(), resultBuilder);
            return;
        }

        appendSnippetResult(event, resultBuilder);
    }

    void appendCompilationErrors(JShell shell, Snippet snippet, StringBuilder resultBuilder) {
        shell.diagnostics(snippet).forEach(diag -> {
            if (resultBuilder.length() > 0) {
                resultBuilder.append("\n");
            }
            resultBuilder.append(formatDiagnostic(diag));
        });
    }

    String formatDiagnostic(Diag diag) {
        var message = diag.getMessage(null);
        if (diag.isError()) {
            return "Compilation Error: " + message;
        }
        return "Warning: " + message;
    }

    void appendException(jdk.jshell.JShellException exception, StringBuilder resultBuilder) {
        if (resultBuilder.length() > 0) {
            resultBuilder.append("\n");
        }
        resultBuilder.append("Runtime Error: ").append(exception.getMessage());
    }

    void appendSnippetResult(SnippetEvent event, StringBuilder resultBuilder) {
        var value = event.value();
        var snippet = event.snippet();

        if (value == null || snippet == null) {
            return;
        }

        var kind = snippet.kind();
        if (kind == Snippet.Kind.VAR || kind == Snippet.Kind.EXPRESSION) {
            if (resultBuilder.length() > 0) {
                resultBuilder.append("\n");
            }
            var name = extractName(snippet);
            resultBuilder.append(name).append(" ==> ").append(value);
        }
    }

    String extractName(Snippet snippet) {
        var source = snippet.source().trim();
        if (snippet.kind() == Snippet.Kind.VAR) {
            var parts = source.split("\\s+");
            if (parts.length >= 2) {
                var namePart = parts[1].split("=")[0].trim();
                return namePart;
            }
        }
        return source;
    }

    String combineOutput(String capturedOutput, String snippetResults) {
        var combined = new StringBuilder();
        
        if (!capturedOutput.isEmpty()) {
            combined.append(capturedOutput);
        }
        
        if (!snippetResults.isEmpty()) {
            if (combined.length() > 0 && !combined.toString().endsWith("\n")) {
                combined.append("\n");
            }
            combined.append(snippetResults);
        }
        
        return combined.toString().isEmpty() ? "Executed successfully" : combined.toString();
    }
}
