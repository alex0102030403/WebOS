import { useState, useRef, useEffect } from 'react'
import { executeCode } from '../../api'

interface JShellStudioProps {
  onClose: () => void
}

const DEFAULT_CODE = `// Welcome to JShell Studio!
// Write Java code and click Run to execute

System.out.println("Hello, WebOS!");

int x = 10;
int y = 20;
x + y`

export function JShellStudio({ onClose }: JShellStudioProps) {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  async function handleRun() {
    if (isExecuting || !code.trim()) return

    setIsExecuting(true)
    setOutput('')
    setError(null)

    try {
      const result = await executeCode(code)
      setOutput(result.output)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute code')
    } finally {
      setIsExecuting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleRun()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white font-mono text-sm rounded-lg overflow-hidden">
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-orange-400">☕</span>
          <span className="text-white text-sm font-medium">JShell Studio</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <button
          onClick={handleRun}
          disabled={isExecuting || !code.trim()}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white text-xs font-medium transition-colors"
        >
          {isExecuting ? (
            <>
              <span className="animate-spin">⟳</span>
              Running...
            </>
          ) : (
            <>
              <span>▶</span>
              Run
            </>
          )}
        </button>
        <span className="text-gray-500 text-xs">Ctrl+Enter to run</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 border-b border-gray-700">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder="Enter Java code here..."
            className="w-full h-full p-5 bg-gray-900 text-green-400 resize-none outline-none font-mono text-sm"
            spellCheck={false}
          />
        </div>

        <div className="h-1/3 min-h-[120px] flex flex-col">
          <div className="px-4 py-1 bg-gray-800 text-gray-400 text-xs border-b border-gray-700">
            Output
          </div>
          <div className="flex-1 overflow-auto p-5 bg-black">
            {isExecuting && (
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="animate-pulse">●</span>
                Executing...
              </div>
            )}
            {error && (
              <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
            )}
            {!isExecuting && !error && output && (
              <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
            )}
            {!isExecuting && !error && !output && (
              <span className="text-gray-600">Click Run to execute your code</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
