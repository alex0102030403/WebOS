/**
 * MobileFileExplorer - Mobile-optimized File Explorer wrapper
 * Requirements: 8.3 - List view instead of grid, touch-friendly file items
 */

import { useState, useEffect, useCallback } from 'react'
import { fetchFileNodes, fetchNodeById } from '../../api'
import type { FileNode } from '../../types'

interface MobileFileExplorerProps {
  onClose: () => void
  onOpenApp?: (appId: string, file?: FileNode) => void
  refreshTrigger?: number
}

interface BreadcrumbItem {
  id: string
  name: string
}

function getFallbackEmoji(node: FileNode): string {
  if (node.type === 'DIRECTORY') return '📁'
  if (node.type === 'SHORTCUT') {
    if (node.content?.startsWith('app:terminal')) return '💻'
    if (node.content?.startsWith('app:taskmanager')) return '📊'
    if (node.content?.startsWith('app:settings')) return '⚙️'
    if (node.content?.startsWith('app:fileexplorer')) return '📂'
    if (node.content?.startsWith('app:chrome')) return '🌐'
    if (node.content?.startsWith('app:paint')) return '🎨'
    if (node.content?.startsWith('app:jshellstudio')) return '☕'
    if (node.content?.startsWith('app:minesweeper')) return '💣'
    if (node.content?.startsWith('app:cvviewer')) return '📄'
    if (node.content?.includes('github')) return '🐙'
    if (node.content?.includes('linkedin')) return '💼'
    return '🔗'
  }
  if (node.name.endsWith('.pdf')) return '📄'
  if (node.name.endsWith('.txt')) return '📝'
  return '📄'
}

function getFileTypeLabel(node: FileNode): string {
  if (node.type === 'DIRECTORY') return 'Folder'
  if (node.type === 'SHORTCUT') return 'Shortcut'
  if (node.name.endsWith('.pdf')) return 'PDF Document'
  if (node.name.endsWith('.txt')) return 'Text File'
  return 'File'
}

export function MobileFileExplorer({ onClose, onOpenApp, refreshTrigger }: MobileFileExplorerProps) {
  const [currentParentId, setCurrentParentId] = useState('desktop')
  const [nodes, setNodes] = useState<FileNode[]>([])
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([{ id: 'desktop', name: 'Desktop' }])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Suppress unused variable warning
  void onClose

  const loadNodes = useCallback(async (parentId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedNodes = await fetchFileNodes(parentId)
      // Sort: directories first, then files
      const sorted = [...fetchedNodes].sort((a, b) => {
        if (a.type === 'DIRECTORY' && b.type !== 'DIRECTORY') return -1
        if (a.type !== 'DIRECTORY' && b.type === 'DIRECTORY') return 1
        return a.name.localeCompare(b.name)
      })
      setNodes(sorted)
    } catch (err) {
      console.error('Failed to load nodes:', err)
      setError('Failed to load directory contents')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNodes(currentParentId)
  }, [currentParentId, loadNodes, refreshTrigger])

  async function navigateToDirectory(node: FileNode) {
    if (node.type !== 'DIRECTORY') return
    
    setCurrentParentId(node.id)
    setBreadcrumbPath(prev => [...prev, { id: node.id, name: node.name }])
  }

  function navigateBack() {
    if (breadcrumbPath.length <= 1) return
    
    const parentIndex = breadcrumbPath.length - 2
    const targetItem = breadcrumbPath[parentIndex]
    if (!targetItem) return
    
    setCurrentParentId(targetItem.id)
    setBreadcrumbPath(prev => prev.slice(0, parentIndex + 1))
  }

  async function handleFileOpen(node: FileNode) {
    if (node.type !== 'FILE') return
    
    try {
      const fullNode = await fetchNodeById(node.id)
      onOpenApp?.('notepad', fullNode)
    } catch (err) {
      console.error('Failed to fetch file content:', err)
      setError('Failed to load file content')
    }
  }

  function handleShortcut(node: FileNode) {
    if (node.type !== 'SHORTCUT' || !node.content) return
    
    if (node.content.startsWith('app:')) {
      const appId = node.content.replace('app:', '')
      onOpenApp?.(appId)
    } else if (node.content.startsWith('http') || node.content.startsWith('/')) {
      window.open(node.content, '_blank')
    }
  }

  function handleItemTap(node: FileNode) {
    if (node.type === 'DIRECTORY') {
      navigateToDirectory(node)
    } else if (node.type === 'FILE') {
      handleFileOpen(node)
    } else if (node.type === 'SHORTCUT') {
      handleShortcut(node)
    }
  }

  const isAtRoot = breadcrumbPath.length <= 1
  const currentFolder = breadcrumbPath[breadcrumbPath.length - 1]?.name || 'Desktop'

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Navigation header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={navigateBack}
            disabled={isAtRoot}
            className={`p-2 rounded-full ${
              isAtRoot 
                ? 'text-gray-300' 
                : 'text-blue-500 active:bg-gray-100'
            }`}
          >
            <span className="text-xl">←</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {currentFolder}
            </h1>
            {!isAtRoot && (
              <p className="text-xs text-gray-500 truncate">
                {breadcrumbPath.map(b => b.name).join(' / ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 px-4">
            <span className="text-red-500 text-center">{error}</span>
            <button
              onClick={() => loadNodes(currentParentId)}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-gray-500">This folder is empty</span>
          </div>
        ) : (
          <div className="bg-white">
            {nodes.map((node, index) => (
              <button
                key={node.id}
                onClick={() => handleItemTap(node)}
                className={`w-full flex items-center gap-4 px-4 py-3 active:bg-gray-50 ${
                  index !== nodes.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl">
                  <span className="text-2xl">{getFallbackEmoji(node)}</span>
                </div>
                
                {/* File info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-base font-medium text-gray-900 truncate">
                    {node.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getFileTypeLabel(node)}
                  </div>
                </div>
                
                {/* Chevron for directories */}
                {node.type === 'DIRECTORY' && (
                  <span className="text-gray-400 text-lg">›</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <span className="text-xs text-gray-500">
          {nodes.length} {nodes.length === 1 ? 'item' : 'items'}
        </span>
      </div>
    </div>
  )
}
