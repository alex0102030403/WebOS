import { useState, useEffect, useCallback } from 'react'
import { newMinesweeperGame, clickMinesweeperCell } from '../../api'
import type { CellState, GameResponse } from '../../types'

interface MinesweeperProps {
  onClose: () => void
}

const GRID_SIZE = 10
const SESSION_KEY = 'minesweeper-session-id'

function generateSessionId(): string {
  return crypto.randomUUID()
}

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

function createEmptyGrid(): CellState[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      revealed: false,
      value: -1,
      flagged: false
    }))
  )
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-600',
  4: 'text-purple-700',
  5: 'text-amber-700',
  6: 'text-cyan-600',
  7: 'text-gray-800',
  8: 'text-gray-600'
}

export function Minesweeper({ onClose }: MinesweeperProps) {
  const [grid, setGrid] = useState<CellState[][]>(createEmptyGrid)
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'LOST' | 'WON'>('PLAYING')
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startNewGame = useCallback(async (sid: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await newMinesweeperGame(sid)
      setGrid(createEmptyGrid())
      setGameStatus(response.status)
    } catch (err) {
      setError('Failed to start game. Please try again.')
      console.error('Failed to start new game:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)
    startNewGame(sid)
  }, [startNewGame])

  function applyUpdates(response: GameResponse) {
    setGameStatus(response.status)
    if (response.updates.length === 0) return

    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })))
      for (const update of response.updates) {
        newGrid[update.r][update.c] = {
          revealed: true,
          value: update.val,
          flagged: false
        }
      }
      return newGrid
    })
  }

  async function handleCellClick(row: number, col: number) {
    if (gameStatus !== 'PLAYING') return
    if (grid[row][col].revealed) return
    if (grid[row][col].flagged) return

    try {
      const response = await clickMinesweeperCell(sessionId, row, col)
      applyUpdates(response)
    } catch (err) {
      setError('Failed to process click. Please try again.')
      console.error('Failed to process click:', err)
    }
  }

  function handleRightClick(e: React.MouseEvent, row: number, col: number) {
    e.preventDefault()
    if (gameStatus !== 'PLAYING') return
    if (grid[row][col].revealed) return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(cell => ({ ...cell })))
      newGrid[row][col].flagged = !newGrid[row][col].flagged
      return newGrid
    })
  }

  async function handleNewGame() {
    const newSid = generateSessionId()
    localStorage.setItem(SESSION_KEY, newSid)
    setSessionId(newSid)
    await startNewGame(newSid)
  }

  function renderCell(cell: CellState, row: number, col: number) {
    const baseClasses = 'w-7 h-7 flex items-center justify-center text-sm font-bold border border-gray-400 transition-colors'
    
    if (!cell.revealed) {
      return (
        <button
          key={`${row}-${col}`}
          className={`${baseClasses} bg-gray-300 hover:bg-gray-200 active:bg-gray-400`}
          onClick={() => handleCellClick(row, col)}
          onContextMenu={(e) => handleRightClick(e, row, col)}
          disabled={gameStatus !== 'PLAYING'}
        >
          {cell.flagged ? '🚩' : ''}
        </button>
      )
    }

    if (cell.value === 9) {
      return (
        <div
          key={`${row}-${col}`}
          className={`${baseClasses} bg-red-500`}
        >
          💣
        </div>
      )
    }

    if (cell.value === 0) {
      return (
        <div
          key={`${row}-${col}`}
          className={`${baseClasses} bg-gray-100`}
        />
      )
    }

    return (
      <div
        key={`${row}-${col}`}
        className={`${baseClasses} bg-gray-100 ${NUMBER_COLORS[cell.value] || 'text-black'}`}
      >
        {cell.value}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-200">
      {/* Title bar */}
      <div data-window-header className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white cursor-move">
        <div className="flex items-center gap-2">
          <span>💣</span>
          <span className="font-semibold">Minesweeper</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 px-3 py-2 bg-gray-100 border-b border-gray-300">
        <button
          onClick={handleNewGame}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          New Game
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          {gameStatus === 'PLAYING' && <span className="text-sm">🎮 Playing</span>}
          {gameStatus === 'WON' && <span className="text-sm text-green-600 font-bold">🎉 Victory!</span>}
          {gameStatus === 'LOST' && <span className="text-sm text-red-600 font-bold">💥 Game Over</span>}
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {isLoading ? (
          <div className="text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={handleNewGame}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="inline-block border-2 border-gray-500 bg-gray-400 p-1">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-3 py-1 bg-gray-100 border-t border-gray-300 text-xs text-gray-600">
        Left-click to reveal • Right-click to flag
      </div>
    </div>
  )
}
