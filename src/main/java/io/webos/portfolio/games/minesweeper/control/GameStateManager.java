package io.webos.portfolio.games.minesweeper.control;

import io.webos.portfolio.games.minesweeper.entity.GridState;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages active Minesweeper game sessions using thread-safe storage.
 */
@ApplicationScoped
public class GameStateManager {

    ConcurrentHashMap<String, GridState> sessions = new ConcurrentHashMap<>();

    public GridState createOrReplace(String sessionId) {
        var gridState = new GridState();
        this.sessions.put(sessionId, gridState);
        return gridState;
    }

    public Optional<GridState> get(String sessionId) {
        return Optional.ofNullable(this.sessions.get(sessionId));
    }

    public void remove(String sessionId) {
        this.sessions.remove(sessionId);
    }
}
