import type { FileNode, BootConfig, CommandResult } from '../types'

const API_BASE = '/api'

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

export async function executeCommand(command: string): Promise<CommandResult> {
  const response = await fetch(`${API_BASE}/terminal/exec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  })
  if (!response.ok) throw new Error('Failed to execute command')
  return response.json()
}

export function createProcessesEventSource(): EventSource {
  return new EventSource(`${API_BASE}/processes`)
}
