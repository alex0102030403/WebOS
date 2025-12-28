import { useState, useEffect } from 'react'
import type { FileNode } from '../../types'

interface NotepadProps {
  onClose: () => void
  file?: FileNode | null
  onSave?: (content: string) => void
}

export function Notepad({ onClose, file, onSave }: NotepadProps) {
  const [content, setContent] = useState(file?.content || '')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setContent(file?.content || '')
    setIsDirty(false)
  }, [file])

  function handleChange(value: string) {
    setContent(value)
    setIsDirty(true)
  }

  async function handleSave() {
    if (!onSave || !isDirty) return
    setIsSaving(true)
    try {
      await onSave(content)
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }

  const fileName = file?.name || 'Untitled'
  const title = isDirty ? `${fileName} *` : fileName

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border-b border-gray-700">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            isDirty && !isSaving
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <span className="text-xs text-gray-500">Ctrl+S</span>
      </div>

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full p-4 bg-gray-950 text-gray-100 font-mono text-sm resize-none outline-none"
        placeholder="Start typing..."
        spellCheck={false}
      />

      <div className="px-4 py-1.5 bg-gray-800 border-t border-gray-700 text-xs text-gray-400 flex justify-between">
        <span>{content.length} characters</span>
        <span>{content.split('\n').length} lines</span>
      </div>
    </div>
  )
}
