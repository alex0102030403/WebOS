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
