export interface FileNode {
  id: string
  parentId: string | null
  name: string
  type: 'DIRECTORY' | 'FILE' | 'SHORTCUT'
  content: string | null
}

export interface BootConfig {
  osVersion: string
  theme: string
  wallpaperUrl: string
  username: string
}

export interface ProcessInfo {
  pid: string
  name: string
  memoryBytes: number
  status: string
}

export interface CommandResult {
  success: boolean
  output: string | null
  error: string | null
}

export interface OpenApp {
  id: string
  name: string
  icon: string
  file?: FileNode | null
}

export interface RecentApp {
  id: string
  name: string
  icon: string
  timestamp: number
}

// Minesweeper types
export interface CellUpdate {
  r: number
  c: number
  val: number
}

export interface GameResponse {
  status: 'PLAYING' | 'LOST' | 'WON'
  updates: CellUpdate[]
}

export interface CellState {
  revealed: boolean
  value: number      // -1 = unknown, 0-8 = number, 9 = mine
  flagged: boolean   // Client-side only
}

// Mobile UI types
export interface MobileApp {
  id: string
  name: string
  icon: string           // emoji or image URL
  iconBackground?: string // gradient or solid color
}
