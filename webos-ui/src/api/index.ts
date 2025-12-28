import type { FileNode, BootConfig, CommandResult } from '../types'

// In production, use the full backend URL; in dev, use relative path
const API_BASE = import.meta.env.PROD 
  ? 'https://webos-api.onrender.com' 
  : '/api'

export async function fetchBootConfig(): Promise<BootConfig> {
  const response = await fetch(`${API_BASE}/system/boot`)
  if (!response.ok) throw new Error('Failed to fetch boot config')
  return response.json()
}

export async function fetchFileNodes(parentId = 'desktop'): Promise<FileNode[]> {
  const response = await fetch(`${API_BASE}/file-nodes?parentId=${parentId}`)
  if (!response.ok) throw new Error('Failed to fetch file nodes')
  return response.json()
}

export async function fetchNodeById(id: string): Promise<FileNode> {
  const response = await fetch(`${API_BASE}/file-nodes/${id}`)
  if (!response.ok) throw new Error('Failed to fetch file node')
  return response.json()
}

export async function createDirectory(parentId: string, name: string): Promise<FileNode> {
  const response = await fetch(`${API_BASE}/file-nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentId, name, type: 'DIRECTORY' })
  })
  if (!response.ok) throw new Error('Failed to create directory')
  return response.json()
}

export async function createFile(parentId: string, name: string): Promise<FileNode> {
  const response = await fetch(`${API_BASE}/file-nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parentId, name, type: 'FILE', content: '' })
  })
  if (!response.ok) throw new Error('Failed to create file')
  return response.json()
}

export async function deleteNode(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/file-nodes/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete node')
}

export async function executeCommand(command: string): Promise<CommandResult> {
  const response = await fetch(`${API_BASE}/terminal/exec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  })
  if (!response.ok) throw new Error('Failed to execute command')
  return response.json()
}

export interface TerminalContext {
  currentDirectory: string
  currentPath: string
  currentDirName: string
}

export async function fetchTerminalContext(): Promise<TerminalContext> {
  const response = await fetch(`${API_BASE}/terminal/context`)
  if (!response.ok) throw new Error('Failed to fetch terminal context')
  return response.json()
}

export async function fetchAutocomplete(input: string): Promise<string[]> {
  const response = await fetch(`${API_BASE}/terminal/autocomplete?input=${encodeURIComponent(input)}`)
  if (!response.ok) throw new Error('Failed to fetch autocomplete')
  const data = await response.json()
  return data.suggestions
}

export function createProcessesEventSource(): EventSource {
  return new EventSource(`${API_BASE}/processes`)
}
