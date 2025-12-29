import { useState, useRef } from 'react'
import type { FileNode } from '../../types'

interface Position {
  x: number
  y: number
}

interface DesktopIconProps {
  node: FileNode
  onClick: (node: FileNode) => void
  isSelected: boolean
  onSelect: (node: FileNode, addToSelection: boolean) => void
  position: Position
  onPositionChange: (nodeId: string, position: Position) => void
  onMultiDrag: (deltaX: number, deltaY: number) => void
  onDragEnd: () => void
  gridSize: number
  selectedCount: number
}

function getIconPath(node: FileNode): string {
  const baseName = node.name.replace(/\.[^/.]+$/, '')
  return `/icons/${baseName}.png`
}

function getFallbackEmoji(node: FileNode): string {
  if (node.type === 'DIRECTORY') return '📁'
  if (node.type === 'SHORTCUT') {
    if (node.content?.startsWith('app:terminal')) return '💻'
    if (node.content?.startsWith('app:taskmanager')) return '📊'
    if (node.content?.startsWith('app:minesweeper')) return '💣'
    if (node.content?.includes('github')) return '🐙'
    return '🔗'
  }
  if (node.name.endsWith('.pdf')) return '📄'
  if (node.name.endsWith('.txt')) return '📝'
  return '📄'
}

function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

export function DesktopIcon({ 
  node, 
  onClick, 
  isSelected, 
  onSelect, 
  position, 
  onPositionChange,
  onMultiDrag,
  onDragEnd,
  gridSize,
  selectedCount
}: DesktopIconProps) {
  const [imgError, setImgError] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef<Position>({ x: 0, y: 0 })
  const iconStartPos = useRef<Position>({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const lastSnappedDelta = useRef<Position>({ x: 0, y: 0 })

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    
    // If clicking on unselected icon without ctrl, select only this one
    // If clicking with ctrl, add to selection
    // If clicking on already selected icon, keep selection for dragging
    if (!isSelected) {
      onSelect(node, e.ctrlKey || e.metaKey)
    }
    
    setIsDragging(true)
    hasMoved.current = false
    lastSnappedDelta.current = { x: 0, y: 0 }
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    iconStartPos.current = { x: position.x, y: position.y }

    const isMultiDrag = isSelected && selectedCount > 1

    function handleMouseMove(moveEvent: MouseEvent) {
      const deltaX = moveEvent.clientX - dragStartPos.current.x
      const deltaY = moveEvent.clientY - dragStartPos.current.y
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved.current = true
      }

      const snappedDeltaX = snapToGrid(deltaX, gridSize)
      const snappedDeltaY = snapToGrid(deltaY, gridSize)

      // Only update if snapped position changed
      if (snappedDeltaX !== lastSnappedDelta.current.x || snappedDeltaY !== lastSnappedDelta.current.y) {
        lastSnappedDelta.current = { x: snappedDeltaX, y: snappedDeltaY }
        
        if (isMultiDrag) {
          onMultiDrag(snappedDeltaX, snappedDeltaY)
        } else {
          const newX = iconStartPos.current.x + snappedDeltaX
          const newY = iconStartPos.current.y + snappedDeltaY
          onPositionChange(node.id, { x: Math.max(0, newX), y: Math.max(0, newY) })
        }
      }
    }

    function handleMouseUp() {
      setIsDragging(false)
      if (hasMoved.current) {
        onDragEnd()
      }
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!hasMoved.current) {
      onClick(node)
    }
  }

  const baseName = node.name.replace(/\.[^/.]+$/, '')

  return (
    <div
      data-icon
      className={`
        absolute flex flex-col items-center justify-center w-20 p-2 rounded-lg
        transition-shadow duration-150 select-none
        ${isDragging ? 'opacity-80 cursor-grabbing z-50' : 'cursor-pointer'}
        ${isSelected 
          ? 'bg-white/20 ring-1 ring-white/40' 
          : 'hover:bg-white/10'
        }
      `}
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-10 h-10 mb-1 flex items-center justify-center">
        {imgError ? (
          <span className="text-4xl">{getFallbackEmoji(node)}</span>
        ) : (
          <img
            src={getIconPath(node)}
            alt={baseName}
            className="w-full h-full object-contain drop-shadow-lg"
            onError={() => setImgError(true)}
            draggable={false}
          />
        )}
      </div>
      <span className="text-white text-xs text-center leading-tight drop-shadow-lg line-clamp-2">
        {node.name}
      </span>
    </div>
  )
}
