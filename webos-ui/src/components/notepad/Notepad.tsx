import { useState, useEffect } from 'react'
import type { FileNode } from '../../types'
import { updateFileContent, saveFile } from '../../api'

interface NotepadProps {
  onClose: () => void
  file?: FileNode | null
  currentDirectory?: string
  onFileSaved?: () => void
}

export function Notepad({ onClose, file, currentDirectory = 'desktop', onFileSaved }: NotepadProps) {
  const [content, setContent] = useState(file?.content || '')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filename, setFilename] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setContent(file?.content || '')
    setIsDirty(false)
  }, [file])

  function handleChange(value: string) {
    setContent(value)
    setIsDirty(true)
  }

  async function handleSave() {
    if (!isDirty) return
    
    // For new files (no file prop), show save dialog
    if (!file) {
      setShowSaveDialog(true)
      return
    }
    
    // For existing files, update content directly
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateFileContent(file.id, content)
      setIsDirty(false)
      onFileSaved?.()
    } catch {
      setSaveError('Failed to save file')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveAs() {
    if (!filename.trim()) return
    
    // Append .txt extension if not provided
    const finalName = filename.endsWith('.txt') ? filename : `${filename}.txt`
    
    setIsSaving(true)
    setSaveError(null)
    try {
      await saveFile(currentDirectory, finalName, content)
      setIsDirty(false)
      setShowSaveDialog(false)
      setFilename('')
      onFileSaved?.()
    } catch {
      setSaveError('Failed to save file')
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
        {saveError && <span className="text-xs text-red-400 ml-2">{saveError}</span>}
      </div>

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full p-5 bg-gray-950 text-gray-100 font-mono text-sm resize-none outline-none"
        placeholder="Start typing..."
        spellCheck={false}
      />

      <div className="px-5 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400 flex justify-between">
        <span>{content.length} characters</span>
        <span>{content.split('\n').length} lines</span>
      </div>

      {showSaveDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-4 w-80 shadow-xl border border-gray-700">
            <h3 className="text-white font-medium mb-3">Save As</h3>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm mb-3 outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveAs()
                if (e.key === 'Escape') setShowSaveDialog(false)
              }}
            />
            <p className="text-xs text-gray-400 mb-3">.txt extension will be added if not provided</p>
            {saveError && <p className="text-xs text-red-400 mb-3">{saveError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setFilename('')
                  setSaveError(null)
                }}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAs}
                disabled={!filename.trim() || isSaving}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
