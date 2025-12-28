import { useState, useEffect, useCallback } from 'react'
import { fetchFileNodes, fetchNodeById } from '../../api'
import type { FileNode } from '../../types'

interface FileExplorerProps {
  onClose: () => void
  onOpenApp?: (appId: string) => void
}

interface BreadcrumbItem {
  id: string
  name: string
}

const ICON_MAP: Record<FileNode['type'], string> = {
  DIRECTORY: '📁',
  FILE: '📄',
  SHORTCUT: '🔗'
}

export function FileExplorer({ onClose, onOpenApp }: FileExplorerProps) {
  const [currentParentId, setCurrentParentId] = useState('desktop')
  const [nodes, setNodes] = useState<FileNode[]>([])
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([{ id: 'desktop', name: 'Desktop' }])
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewNode, setPreviewNode] = useState<FileNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNodes = useCallback(async (parentId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedNodes = await fetchFileNodes(parentId)
      setNodes(fetchedNodes)
    } catch (err) {
      console.error('Failed to load nodes:', err)
      setError('Failed to load directory contents')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNodes(currentParentId)
  }, [currentParentId, loadNodes])


  async function navigateToDirectory(node: FileNode) {
    if (node.type !== 'DIRECTORY') return
    
    setCurrentParentId(node.id)
    setBreadcrumbPath(prev => [...prev, { id: node.id, name: node.name }])
    setSelectedNode(null)
    setPreviewContent(null)
    setPreviewNode(null)
  }

  function navigateToBreadcrumb(index: number) {
    const targetItem = breadcrumbPath[index]
    if (!targetItem) return
    
    setCurrentParentId(targetItem.id)
    setBreadcrumbPath(prev => prev.slice(0, index + 1))
    setSelectedNode(null)
    setPreviewContent(null)
    setPreviewNode(null)
  }

  function navigateBack() {
    if (breadcrumbPath.length <= 1) return
    
    const parentIndex = breadcrumbPath.length - 2
    navigateToBreadcrumb(parentIndex)
  }

  async function handleFilePreview(node: FileNode) {
    if (node.type !== 'FILE') return
    
    try {
      const fullNode = await fetchNodeById(node.id)
      setPreviewContent(fullNode.content)
      setPreviewNode(fullNode)
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
    } else if (node.content.startsWith('http')) {
      window.open(node.content, '_blank')
    }
  }

  function handleDoubleClick(node: FileNode) {
    if (node.type === 'DIRECTORY') {
      navigateToDirectory(node)
    } else if (node.type === 'FILE') {
      handleFilePreview(node)
    } else if (node.type === 'SHORTCUT') {
      handleShortcut(node)
    }
  }

  function handleNodeClick(e: React.MouseEvent, node: FileNode) {
    e.stopPropagation()
    setSelectedNode(node)
  }

  function closePreview() {
    setPreviewContent(null)
    setPreviewNode(null)
  }

  const isAtRoot = breadcrumbPath.length <= 1


  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Window Header */}
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <span className="text-white text-sm font-medium">File Explorer</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Toolbar with Back Button and Breadcrumbs */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border-b border-gray-700">
        <button
          onClick={navigateBack}
          disabled={isAtRoot}
          className={`p-1.5 rounded transition-colors ${
            isAtRoot 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          title="Back"
        >
          ←
        </button>
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          {breadcrumbPath.map((item, index) => (
            <div key={item.id} className="flex items-center">
              {index > 0 && <span className="text-gray-500 mx-1">/</span>}
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  index === breadcrumbPath.length - 1
                    ? 'text-white bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Grid */}
        <div 
          className="flex-1 p-4 overflow-auto"
          onClick={() => setSelectedNode(null)}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-red-400">{error}</span>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">This folder is empty</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 content-start">
              {nodes.map(node => (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node)}
                  onDoubleClick={() => handleDoubleClick(node)}
                  className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNode?.id === node.id
                      ? 'bg-blue-600/30 ring-1 ring-blue-500'
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-3xl mb-2">{ICON_MAP[node.type]}</span>
                  <span className="text-xs text-center truncate w-full">{node.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Preview Panel */}
        {previewContent !== null && previewNode && (
          <div className="w-64 border-l border-gray-700 bg-gray-800/50 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
              <span className="text-sm font-medium truncate">{previewNode.name}</span>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                {previewContent || '(empty file)'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
