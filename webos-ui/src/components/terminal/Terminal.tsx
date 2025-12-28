import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { executeCommand, fetchTerminalContext, fetchAutocomplete } from '../../api'

interface TerminalProps {
  onClose: () => void
}

interface HistoryEntry {
  command: string
  output: string
  isError: boolean
  path: string
}

export function Terminal({ onClose }: TerminalProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentPath, setCurrentPath] = useState('/Desktop')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

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
    setCommandHistory(prev => [...prev, trimmedInput])
    setHistoryIndex(-1)

    // Handle clear command locally
    if (trimmedInput === 'clear') {
      setHistory([])
      setInput('')
      setIsExecuting(false)
      return
    }

    // Handle help command locally
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
      // Refresh context after command (cd might have changed directory)
      await refreshContext()
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
      // Fetch suggestions
      try {
        const results = await fetchAutocomplete(input)
        if (results.length === 1) {
          // Single match - complete it
          applyCompletion(results[0])
        } else if (results.length > 1) {
          setSuggestions(results)
          setSuggestionIndex(0)
        }
      } catch {
        // Ignore autocomplete errors
      }
    } else {
      // Cycle through suggestions
      const nextIndex = (suggestionIndex + 1) % suggestions.length
      setSuggestionIndex(nextIndex)
      applyCompletion(suggestions[nextIndex])
    }
  }

  function applyCompletion(completion: string) {
    const parts = input.trim().split(/\s+/)
    if (parts.length <= 1 && !input.includes(' ')) {
      // Completing command
      setInput(completion + ' ')
    } else {
      // Completing argument
      parts[parts.length - 1] = completion
      setInput(parts.join(' ') + (completion.includes('.') ? '' : ' '))
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      handleTab()
      return
    }

    // Clear suggestions on any other key
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

    if (e.key === 'Escape') {
      setSuggestions([])
    }
  }

  function handleTerminalClick() {
    inputRef.current?.focus()
  }

  function formatPath(path: string) {
    // Show ~ for desktop, otherwise show last part of path
    if (path === '/Desktop') return '~'
    const parts = path.split('/')
    return parts[parts.length - 1] || '~'
  }

  return (
    <div 
      className="flex flex-col h-full bg-black text-green-400 font-mono text-sm rounded-lg overflow-hidden"
      onClick={handleTerminalClick}
    >
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
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
              <span className="text-purple-400">{formatPath(entry.path)}</span>
              <span className="text-white">$</span>
              <span>{entry.command}</span>
            </div>
            {entry.output && (
              <pre className={`whitespace-pre-wrap ${entry.isError ? 'text-red-400' : 'text-gray-300'}`}>
                {entry.output}
              </pre>
            )}
          </div>
        ))}

        <div className="flex gap-2 items-center">
          <span className="text-blue-400">visitor@webos</span>
          <span className="text-purple-400">{formatPath(currentPath)}</span>
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

        {suggestions.length > 1 && (
          <div className="text-gray-500 flex flex-wrap gap-4 mt-1">
            {suggestions.map((s, i) => (
              <span key={s} className={i === suggestionIndex ? 'text-yellow-400' : ''}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
