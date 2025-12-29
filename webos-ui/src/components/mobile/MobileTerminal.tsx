/**
 * MobileTerminal - Mobile-optimized Terminal wrapper
 * Requirements: 8.1 - Touch-friendly input, larger font size, full-width layout
 */

import { useState, useRef, useEffect, type KeyboardEvent, type TouchEvent } from 'react'
import { executeCommand, fetchTerminalContext, fetchAutocomplete } from '../../api'

interface MobileTerminalProps {
  onClose: () => void
  onFileSystemChange?: () => void
}

interface HistoryEntry {
  command: string
  output: string
  isError: boolean
  path: string
}

export function MobileTerminal({ onClose, onFileSystemChange }: MobileTerminalProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentPath, setCurrentPath] = useState('/Desktop')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showQuickCommands, setShowQuickCommands] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Suppress unused variable warning
  void onClose

  useEffect(() => {
    inputRef.current?.focus()
    refreshContext()
  }, [])

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight)
  }, [history])

  async function refreshContext() {
    try {
      const ctx = await fetchTerminalContext()
      setCurrentPath(ctx.currentPath)
    } catch {
      // Keep default path on error
    }
  }

  async function handleSubmit() {
    const trimmedInput = input.trim()
    if (!trimmedInput || isExecuting) return

    setIsExecuting(true)
    setSuggestions([])
    setShowQuickCommands(false)
    setCommandHistory(prev => [...prev, trimmedInput])
    setHistoryIndex(-1)

    if (trimmedInput === 'clear') {
      setHistory([])
      setInput('')
      setIsExecuting(false)
      setShowQuickCommands(true)
      return
    }

    if (trimmedInput === 'help') {
      setHistory(prev => [...prev, {
        command: trimmedInput,
        output: `Available commands:
  ls [dir]     - List directory contents
  cd [dir]     - Change directory
  cat <file>   - Display file contents
  mkdir <dir>  - Create directory
  touch <file> - Create empty file
  rm [-r] <n>  - Remove file or directory
  pwd          - Print working directory
  clear        - Clear terminal
  uname        - System information
  whoami       - Current user
  java -v      - Java version`,
        isError: false,
        path: currentPath
      }])
      setInput('')
      setIsExecuting(false)
      return
    }

    try {
      const result = await executeCommand(trimmedInput)
      setHistory(prev => [...prev, {
        command: trimmedInput,
        output: result.success ? (result.output || '') : (result.error || 'Unknown error'),
        isError: !result.success,
        path: currentPath
      }])
      await refreshContext()
      
      const fsCommands = ['rm', 'mkdir', 'touch', 'echo']
      const cmd = trimmedInput.split(/\s+/)[0]
      if (result.success && fsCommands.includes(cmd)) {
        onFileSystemChange?.()
      }
    } catch {
      setHistory(prev => [...prev, {
        command: trimmedInput,
        output: 'Failed to connect to backend',
        isError: true,
        path: currentPath
      }])
    } finally {
      setInput('')
      setIsExecuting(false)
    }
  }

  async function handleTab() {
    if (suggestions.length === 0) {
      try {
        const results = await fetchAutocomplete(input)
        if (results.length === 1) {
          applyCompletion(results[0])
        } else if (results.length > 1) {
          setSuggestions(results)
        }
      } catch {
        // Ignore autocomplete errors
      }
    }
  }

  function applyCompletion(completion: string) {
    const parts = input.trim().split(/\s+/)
    if (parts.length <= 1 && !input.includes(' ')) {
      setInput(completion + ' ')
    } else {
      parts[parts.length - 1] = completion
      setInput(parts.join(' ') + (completion.includes('.') ? '' : ' '))
    }
    setSuggestions([])
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      handleTab()
      return
    }

    if (suggestions.length > 0 && e.key !== 'Tab') {
      setSuggestions([])
    }

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

  function formatPath(path: string) {
    if (path === '/Desktop') return '~'
    const parts = path.split('/')
    return parts[parts.length - 1] || '~'
  }

  // Quick command buttons for touch-friendly input
  function handleQuickCommand(cmd: string) {
    setInput(cmd)
    inputRef.current?.focus()
  }

  // Handle suggestion tap
  function handleSuggestionTap(suggestion: string, e: TouchEvent) {
    e.preventDefault()
    applyCompletion(suggestion)
    inputRef.current?.focus()
  }

  const quickCommands = ['ls', 'pwd', 'help', 'clear', 'cd ..', 'whoami']

  return (
    <div 
      className="flex flex-col h-full bg-black text-green-400 font-mono"
      onClick={handleTerminalClick}
    >
      {/* Output area - larger text for mobile */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-auto p-4 space-y-4 text-base"
      >
        <div className="text-gray-500 mb-3 text-sm">
          WebOS Terminal v1.0.0 - Type 'help' for commands
        </div>

        {history.map((entry, index) => (
          <div key={index} className="space-y-2">
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-blue-400">visitor@webos</span>
              <span className="text-purple-400">{formatPath(entry.path)}</span>
              <span className="text-white">$</span>
              <span className="break-all">{entry.command}</span>
            </div>
            {entry.output && (
              <pre className={`whitespace-pre-wrap break-words text-sm ${entry.isError ? 'text-red-400' : 'text-gray-300'}`}>
                {entry.output}
              </pre>
            )}
          </div>
        ))}

        {/* Current prompt */}
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-blue-400">visitor@webos</span>
          <span className="text-purple-400">{formatPath(currentPath)}</span>
          <span className="text-white">$</span>
          {isExecuting && <span className="animate-pulse ml-2">▌</span>}
        </div>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onTouchEnd={(e) => handleSuggestionTap(s, e)}
                onClick={() => applyCompletion(s)}
                className="px-3 py-2 bg-gray-800 text-yellow-400 rounded-lg text-sm active:bg-gray-700"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick commands - touch-friendly buttons */}
      {showQuickCommands && history.length === 0 && (
        <div className="px-4 py-3 bg-gray-900 border-t border-gray-800">
          <div className="text-xs text-gray-500 mb-2">Quick commands:</div>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map(cmd => (
              <button
                key={cmd}
                onClick={() => handleQuickCommand(cmd)}
                className="px-3 py-2 bg-gray-800 text-green-400 rounded-lg text-sm active:bg-gray-700 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area - larger touch target */}
      <div className="p-3 bg-gray-900 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder="Enter command..."
            className="flex-1 bg-gray-800 text-green-400 px-4 py-3 rounded-lg text-base outline-none focus:ring-2 focus:ring-green-500 caret-green-400"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            onClick={handleSubmit}
            disabled={isExecuting || !input.trim()}
            className="px-5 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed active:bg-green-700 transition-colors"
          >
            Run
          </button>
        </div>
      </div>
    </div>
  )
}
