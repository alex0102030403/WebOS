# Implementation Plan: Minesweeper Game

## Overview

Server-authoritative Minesweeper implementation following BCE pattern. Backend holds all game state; frontend receives only revealed cell updates. Implementation uses Java 25 with jqwik for property-based testing.

## Tasks

- [x] 1. Create entity layer with game data structures
  - [x] 1.1 Create GameStatus enum (PLAYING, LOST, WON)
    - File: `src/main/java/io/webos/portfolio/games/minesweeper/entity/GameStatus.java`
    - _Requirements: 3.2, 5.1_
  - [x] 1.2 Create CellUpdate record with JSON-P serialization
    - File: `src/main/java/io/webos/portfolio/games/minesweeper/entity/CellUpdate.java`
    - Fields: r, c, val with toJSON() method
    - _Requirements: 3.1, 4.3_
  - [x] 1.3 Create GameResponse record with JSON-P serialization
    - File: `src/main/java/io/webos/portfolio/games/minesweeper/entity/GameResponse.java`
    - Fields: status, updates list with toJSON() method
    - _Requirements: 4.3_

- [x] 2. Implement GridState with core game logic
  - [x] 2.1 Create GridState class with grid initialization
    - File: `src/main/java/io/webos/portfolio/games/minesweeper/entity/GridState.java`
    - 10x10 int[][] grid, boolean[][] revealed, GameStatus, revealedCount
    - Constructor places 10 random mines and calculates adjacent counts
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 2.2 Write property test for grid validity invariant
    - **Property 3: Grid Validity Invariant**
    - Verify 10x10 dimensions, exactly 10 mines, correct adjacent counts
    - **Validates: Requirements 2.1, 2.2, 2.3**
  - [x] 2.3 Implement reveal() method with flood fill
    - Returns List<CellUpdate> for revealed cells
    - Handles mine click (LOST), number click (single reveal), blank click (flood fill)
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ]* 2.4 Write property test for mine click terminates game
    - **Property 4: Mine Click Terminates Game**
    - **Validates: Requirements 3.2**
  - [ ]* 2.5 Write property test for number click reveals single cell
    - **Property 5: Number Click Reveals Single Cell**
    - **Validates: Requirements 3.3**
  - [ ]* 2.6 Write property test for flood fill correctness
    - **Property 6: Flood Fill Correctness**
    - **Validates: Requirements 3.4**
  - [x] 2.7 Implement win condition detection
    - Check if revealedCount equals 90 (100 - 10 mines)
    - _Requirements: 5.1_
  - [ ]* 2.8 Write property test for win condition detection
    - **Property 8: Win Condition Detection**
    - **Validates: Requirements 5.1**

- [x] 3. Implement control layer services
  - [x] 3.1 Create GameStateManager with ConcurrentHashMap
    - File: `src/main/java/io/webos/portfolio/games/minesweeper/control/GameStateManager.java`
    - Methods: createOrReplace(), get(), remove()
    - _Requirements: 1.1, 1.4_
  - [ ]* 3.2 Write property test for session replacement idempotence
    - **Property 2: Session Replacement Idempotence**
    - **Validates: Requirements 1.3**
  - [x] 3.3 Create MinesweeperService for game orchestration
    - File: `src/main/java/io/webos/portfolio/games/minesweeper/control/MinesweeperService.java`
    - Methods: newGame(sessionId), click(sessionId, row, col)
    - _Requirements: 1.1, 3.1_
  - [ ]* 3.4 Write property test for new game initialization
    - **Property 1: New Game Initialization**
    - **Validates: Requirements 1.1, 1.2**

- [x] 4. Implement boundary layer REST API
  - [x] 4.1 Create MinesweeperResource with endpoints
    - File: `src/main/java/io/webos/portfolio/games/minesweeper/boundary/MinesweeperResource.java`
    - POST /games/minesweeper/new - creates new game
    - POST /games/minesweeper/click - processes cell click
    - _Requirements: 1.1, 3.1_
  - [ ]* 4.2 Write property test for security - no hidden information leaked
    - **Property 7: Security - No Hidden Information Leaked**
    - **Validates: Requirements 4.1, 4.2, 4.4**

- [x] 5. Checkpoint - Backend verification
  - Ensure all backend tests pass
  - Verify API endpoints respond correctly using manual testing or curl
  - Ask the user if questions arise

- [x] 6. Implement frontend API functions
  - [x] 6.1 Add Minesweeper types to types/index.ts
    - CellUpdate, GameResponse, CellState interfaces
    - _Requirements: 4.3_
  - [x] 6.2 Add API functions to api/index.ts
    - newMinesweeperGame(sessionId): Promise<GameResponse>
    - clickMinesweeperCell(sessionId, row, col): Promise<GameResponse>
    - _Requirements: 1.1, 3.1_

- [x] 7. Implement Minesweeper React component
  - [x] 7.1 Create Minesweeper.tsx with grid rendering
    - File: `webos-ui/src/components/minesweeper/Minesweeper.tsx`
    - Session ID generation and localStorage persistence
    - 10x10 grid of cell buttons with state management
    - _Requirements: 6.1, 6.2_
  - [x] 7.2 Implement click handlers and cell updates
    - Left-click sends coordinates to backend
    - Update only cells returned in response
    - _Requirements: 6.3_
  - [x] 7.3 Implement game status display
    - Show game over indicator when LOST
    - Show victory indicator when WON
    - Disable grid when game ends
    - _Requirements: 6.4, 6.5_
  - [x] 7.4 Implement cell styling and visuals
    - Numbers 1-8 with distinct colors
    - Bomb icon for revealed mines
    - Gray buttons for unrevealed cells
    - _Requirements: 6.6_
  - [x] 7.5 Implement flag marking (right-click)
    - Toggle flag on right-click
    - Prevent left-click on flagged cells
    - Client-side state only
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 8. Integrate Minesweeper into WebOS Desktop
  - [x] 8.1 Add Minesweeper to Desktop app registry
    - Add icon and app entry to Desktop.tsx
    - Wire up window opening logic
    - _Requirements: 6.1_
  - [x] 8.2 Add Minesweeper icon to public/icons
    - Create or add Minesweeper.png icon
    - _Requirements: 6.1_

- [x] 9. Final checkpoint - Full integration verification
  - Ensure all tests pass (backend property tests + unit tests)
  - Verify end-to-end flow: open app → new game → click cells → win/lose
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests
- Backend uses jqwik for property testing (already configured in project)
- Frontend flag state is purely client-side, no server communication needed
- Session IDs are UUIDs generated by frontend and stored in localStorage
