package io.webos.portfolio.games.minesweeper.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Core game state for Minesweeper holding the grid, revealed cells, and game status.
 * Grid values: 0-8 = adjacent mine count, 9 = mine.
 */
public class GridState {

    static final int SIZE = 10;
    static final int MINE_COUNT = 10;
    static final int MINE_VALUE = 9;
    static final int NON_MINE_CELLS = SIZE * SIZE - MINE_COUNT;

    int[][] grid;
    boolean[][] revealed;
    GameStatus status;
    int revealedCount;

    public GridState() {
        this(new Random());
    }

    public GridState(Random random) {
        this.grid = new int[SIZE][SIZE];
        this.revealed = new boolean[SIZE][SIZE];
        this.status = GameStatus.PLAYING;
        this.revealedCount = 0;
        placeMines(random);
        calculateAdjacentCounts();
    }

    void placeMines(Random random) {
        int placed = 0;
        while (placed < MINE_COUNT) {
            int r = random.nextInt(SIZE);
            int c = random.nextInt(SIZE);
            if (this.grid[r][c] != MINE_VALUE) {
                this.grid[r][c] = MINE_VALUE;
                placed++;
            }
        }
    }

    void calculateAdjacentCounts() {
        for (int r = 0; r < SIZE; r++) {
            for (int c = 0; c < SIZE; c++) {
                if (this.grid[r][c] != MINE_VALUE) {
                    this.grid[r][c] = countAdjacentMines(r, c);
                }
            }
        }
    }


    int countAdjacentMines(int row, int col) {
        int count = 0;
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                if (dr == 0 && dc == 0) continue;
                int nr = row + dr;
                int nc = col + dc;
                if (isInBounds(nr, nc) && this.grid[nr][nc] == MINE_VALUE) {
                    count++;
                }
            }
        }
        return count;
    }

    boolean isInBounds(int r, int c) {
        return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
    }

    /**
     * Reveals a cell and returns the list of cell updates.
     * Handles mine click (LOST), number click (single reveal), blank click (flood fill).
     */
    public List<CellUpdate> reveal(int row, int col) {
        var updates = new ArrayList<CellUpdate>();

        if (this.status != GameStatus.PLAYING) {
            return updates;
        }

        if (!isInBounds(row, col) || this.revealed[row][col]) {
            return updates;
        }

        int value = this.grid[row][col];

        if (value == MINE_VALUE) {
            this.revealed[row][col] = true;
            this.status = GameStatus.LOST;
            updates.add(new CellUpdate(row, col, MINE_VALUE));
            return updates;
        }

        if (value > 0) {
            this.revealed[row][col] = true;
            this.revealedCount++;
            updates.add(new CellUpdate(row, col, value));
            checkWinCondition();
            return updates;
        }

        floodFill(row, col, updates);
        checkWinCondition();
        return updates;
    }


    void floodFill(int row, int col, List<CellUpdate> updates) {
        if (!isInBounds(row, col) || this.revealed[row][col]) {
            return;
        }

        int value = this.grid[row][col];
        if (value == MINE_VALUE) {
            return;
        }

        this.revealed[row][col] = true;
        this.revealedCount++;
        updates.add(new CellUpdate(row, col, value));

        if (value == 0) {
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    if (dr == 0 && dc == 0) continue;
                    floodFill(row + dr, col + dc, updates);
                }
            }
        }
    }

    void checkWinCondition() {
        if (this.revealedCount == NON_MINE_CELLS) {
            this.status = GameStatus.WON;
        }
    }

    public GameStatus status() {
        return this.status;
    }

    public int revealedCount() {
        return this.revealedCount;
    }

    public int[][] grid() {
        return this.grid;
    }

    public boolean[][] revealed() {
        return this.revealed;
    }

    public int size() {
        return SIZE;
    }

    public int mineCount() {
        return MINE_COUNT;
    }
}
