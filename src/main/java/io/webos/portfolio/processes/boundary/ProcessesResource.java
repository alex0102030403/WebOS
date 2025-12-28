package io.webos.portfolio.processes.boundary;

import io.webos.portfolio.processes.control.ProcessService;
import jakarta.inject.Inject;
import jakarta.json.Json;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.sse.Sse;
import jakarta.ws.rs.sse.SseEventSink;

import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * JAX-RS resource for streaming process information via Server-Sent Events.
 */
@Path("/processes")
public class ProcessesResource {

    @Inject
    ProcessService processService;

    /**
     * Streams process data at configurable intervals via SSE.
     */
    @GET
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public void streamProcesses(@Context SseEventSink eventSink, @Context Sse sse) {
        var executor = Executors.newSingleThreadScheduledExecutor();
        
        executor.scheduleAtFixedRate(() -> {
            if (eventSink.isClosed()) {
                executor.shutdown();
                return;
            }
            
            var processes = this.processService.processes();
            var jsonArray = Json.createArrayBuilder();
            processes.forEach(p -> jsonArray.add(p.toJSON()));
            
            var event = sse.newEventBuilder()
                .name("processes")
                .data(jsonArray.build().toString())
                .build();
            
            eventSink.send(event);
        }, 0, this.processService.updateInterval(), TimeUnit.MILLISECONDS);
    }
}
