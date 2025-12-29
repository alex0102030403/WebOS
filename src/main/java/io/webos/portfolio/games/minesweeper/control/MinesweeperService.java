package io.webos.portfolio.games.minesweeper.control;

import io.webos.portfolio.games.minesweeper.entity.GameResponse;
import io.webos.portfolio.games.minesweeper.entity.GameStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Optional;

/**
 * Orchestrates Minesweeper game operations, coordinating between
 * the REST boundary and game state management.
 */
@ApplicationScoped
public class MinesweeperService {

    @Inject
    GameStateManager stateManager;

    public GameResponse newGame(String sessionId) {
        this.stateManager.createOrReplace(sessionId);
        return new GameResponse(GameStatus.PLAYING, List.of());
    }

    public Optional<GameResponse> click(String sessionId, int row, int col) {
        return this.stateManager.get(sessionId)
                .map(gridState -> {
                    var updates = gridState.reveal(row, col);
                    return new GameResponse(gridState.status(), updates);
                });
    }
}
