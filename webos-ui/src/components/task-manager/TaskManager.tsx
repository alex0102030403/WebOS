import { useState, useEffect, useRef } from 'react'
import { createProcessesEventSource } from '../../api'
import type { ProcessInfo } from '../../types'

interface TaskManagerProps {
  onClose: () => void
}

export function TaskManager({ onClose }: TaskManagerProps) {
  const [processes, setProcesses] = useState<ProcessInfo[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    function connect() {
      const eventSource = createProcessesEventSource()
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        setError(null)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (Array.isArray(data)) {
            setProcesses(data)
          } else {
            setProcesses([data])
          }
        } catch (err) {
          console.error('Failed to parse SSE data:', err)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        setError('Connection lost. Reconnecting...')
        eventSource.close()
        setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  function formatMemory(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Task Manager</span>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 bg-yellow-600/20 text-yellow-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Name</th>
              <th className="text-left px-4 py-2 font-medium">PID</th>
              <th className="text-right px-4 py-2 font-medium">Memory</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr 
                key={process.pid} 
                className="border-b border-gray-800 hover:bg-gray-800/50"
              >
                <td className="px-4 py-2">{process.name}</td>
                <td className="px-4 py-2 text-gray-400">{process.pid}</td>
                <td className="px-4 py-2 text-right text-blue-400">
                  {formatMemory(process.memoryBytes)}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    process.status === 'Running' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {process.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {processes.length === 0 && !error && (
          <div className="flex items-center justify-center h-32 text-gray-500">
            Waiting for process data...
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        {processes.length} processes • {isConnected ? 'Live' : 'Disconnected'}
      </div>
    </div>
  )
}
