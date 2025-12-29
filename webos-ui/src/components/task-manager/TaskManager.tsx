import { useState, useEffect, useMemo } from 'react'
import type { OpenApp } from '../../types'

interface TaskManagerProps {
  onClose: () => void
  openApps: OpenApp[]
  onCloseApp: (appId: string) => void
}

interface ProcessInfo {
  pid: string
  name: string
  memoryBytes: number
  status: string
  icon: string
}

const MEMORY_ESTIMATES: Record<string, number> = {
  terminal: 45_000_000,
  taskmanager: 35_000_000,
  settings: 25_000_000,
  fileexplorer: 55_000_000,
  chrome: 180_000_000,
  notepad: 20_000_000,
  cvviewer: 30_000_000,
}

export function TaskManager({ onClose, openApps, onCloseApp }: TaskManagerProps) {
  const [memoryJitter, setMemoryJitter] = useState<Record<string, number>>({})

  // Simulate memory fluctuation for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryJitter(prev => {
        const next: Record<string, number> = {}
        openApps.forEach(app => {
          next[app.id] = (prev[app.id] || 0) + (Math.random() - 0.5) * 5_000_000
        })
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [openApps])

  const processes: ProcessInfo[] = useMemo(() => {
    const kernelMemory = 120_000_000 + Math.random() * 30_000_000
    
    const kernel: ProcessInfo = {
      pid: '1',
      name: 'WebOS Kernel',
      memoryBytes: kernelMemory,
      status: 'Running',
      icon: '🖥️'
    }

    const appProcesses = openApps.map((app, index) => ({
      pid: String(1000 + index),
      name: app.name,
      memoryBytes: (MEMORY_ESTIMATES[app.id] || 50_000_000) + (memoryJitter[app.id] || 0),
      status: 'Running',
      icon: app.icon
    }))

    return [kernel, ...appProcesses]
  }, [openApps, memoryJitter])

  const totalMemory = useMemo(() => 
    processes.reduce((sum, p) => sum + p.memoryBytes, 0), 
    [processes]
  )

  function formatMemory(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  function handleEndTask(process: ProcessInfo) {
    if (process.pid === '1') return // Can't kill kernel
    const app = openApps.find(a => a.name === process.name)
    if (app) onCloseApp(app.id)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="text-sm font-medium">Task Manager</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">PID</th>
              <th className="text-right px-5 py-3 font-medium">Memory</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-center px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr 
                key={process.pid} 
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <td className="px-5 py-3">
                  <span className="mr-2">{process.icon}</span>
                  {process.name}
                </td>
                <td className="px-5 py-3 text-gray-400">{process.pid}</td>
                <td className="px-5 py-3 text-right text-blue-400">
                  {formatMemory(process.memoryBytes)}
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                    {process.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  {process.pid !== '1' && (
                    <button
                      onClick={() => handleEndTask(process)}
                      className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      End Task
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {processes.length === 1 && (
          <div className="flex items-center justify-center h-24 text-gray-500">
            No applications running
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-gray-800 border-t border-gray-700 text-xs text-gray-400 flex justify-between">
        <span>{processes.length} processes</span>
        <span>Total: {formatMemory(totalMemory)}</span>
      </div>
    </div>
  )
}
