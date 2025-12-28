package io.webos.portfolio.processes.control;

import io.webos.portfolio.processes.entity.ProcessInfo;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.util.List;
import java.util.Random;

/**
 * Provides process information including real JVM metrics and simulated application processes.
 */
@ApplicationScoped
public class ProcessService {

    static final List<String> SIMULATED_APPS = List.of(
        "Chrome",
        "Outlook",
        "Explorer",
        "VSCode",
        "Spotify",
        "Discord",
        "Slack"
    );

    @ConfigProperty(name = "webos.process.update.interval", defaultValue = "1000")
    long updateIntervalMs;

    final MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
    final Random random = new Random();

    /**
     * Returns the configured update interval in milliseconds.
     */
    public long updateInterval() {
        return this.updateIntervalMs;
    }

    /**
     * Returns current list of processes including JVM metrics and simulated apps.
     */
    public List<ProcessInfo> processes() {
        var heapUsage = this.memoryBean.getHeapMemoryUsage();
        
        var jvmProcess = new ProcessInfo(
            "1",
            "WebOS Kernel",
            heapUsage.getUsed(),
            "Running"
        );

        var simulatedProcesses = SIMULATED_APPS.stream()
            .map(this::createSimulatedProcess)
            .toList();

        return List.of(
            jvmProcess,
            simulatedProcesses.get(0),
            simulatedProcesses.get(1),
            simulatedProcesses.get(2),
            simulatedProcesses.get(3),
            simulatedProcesses.get(4),
            simulatedProcesses.get(5),
            simulatedProcesses.get(6)
        );
    }

    ProcessInfo createSimulatedProcess(String name) {
        var pid = String.valueOf(1000 + SIMULATED_APPS.indexOf(name));
        var memoryBytes = 50_000_000L + this.random.nextLong(200_000_000L);
        return new ProcessInfo(pid, name, memoryBytes, "Running");
    }
}
