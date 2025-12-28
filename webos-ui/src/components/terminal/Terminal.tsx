import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { executeCommand } from '../../api'

interface TerminalProps {
  onClose: () => void
}

interface HistoryEntry {
  command: string
  output: string
  isError: boolean
}

export function Terminal({ onClose }: TerminalProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight)
  }, [history])

  async function handleSubmit() {
    const trimmedInput = input.trim()
    if (!trimmedInput || isExecuting) return

    setIsExecuting(true)
    setCommandHistory(prev => [...prev, trimmedInput])
    setHistoryIndex(-1)

    try {
      const result = await executeCommand(trimmedInput)
      setHistory(prev => [...prev, {
        command: trimmedInput,
        output: result.success ? (result.output || '') : (result.error || 'Unknown error'),
        isError: !result.success
      }])
    } catch (err) {
      setHistory(prev => [...prev, {
        command: trimmedInput,
        output: 'Failed to connect to backend',
        isError: true
      }])
    } finally {
      setInput('')
      setIsExecuting(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSubmit()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
      setHistoryIndex(newIndex)
      setInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex <= 0) {
        setHistoryIndex(-1)
        setInput('')
        return
      }
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
    }
  }

  function handleTerminalClick() {
    inputRef.current?.focus()
  }

  return (
    <div 
      className="flex flex-col h-full bg-black text-green-400 font-mono text-sm rounded-lg overflow-hidden"
      onClick={handleTerminalClick}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-white text-sm font-medium">Terminal</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div 
        ref={outputRef}
        className="flex-1 overflow-auto p-4 space-y-2"
      >
        <div className="text-gray-500">
          WebOS Terminal v1.0.0 - Type 'help' for available commands
        </div>

        {history.map((entry, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-2">
              <span className="text-blue-400">visitor@webos</span>
              <span className="text-white">$</span>
              <span>{entry.command}</span>
            </div>
            <pre className={`whitespace-pre-wrap ${entry.isError ? 'text-red-400' : 'text-gray-300'}`}>
              {entry.output}
            </pre>
          </div>
        ))}

        <div className="flex gap-2 items-center">
          <span className="text-blue-400">visitor@webos</span>
          <span className="text-white">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
            autoComplete="off"
            spellCheck={false}
          />
          {isExecuting && <span className="animate-pulse">▌</span>}
        </div>
      </div>
    </div>
  )
}
