import { useState, useRef, type ReactNode, type MouseEvent } from 'react'

interface DraggableWindowProps {
  children: ReactNode
  initialX?: number
  initialY?: number
  width: number
  height: number
  onFocus?: () => void
  zIndex?: number
  minWidth?: number
  minHeight?: number
}

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null

export function DraggableWindow({ 
  children, 
  initialX = 100, 
  initialY = 50, 
  width: initialWidth, 
  height: initialHeight,
  onFocus,
  zIndex = 10,
  minWidth = 300,
  minHeight = 200
}: DraggableWindowProps) {
  const [position, setPosition] = useState<Position>({ x: initialX, y: initialY })
  const [size, setSize] = useState<Size>({ width: initialWidth, height: initialHeight })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const startPos = useRef<Position>({ x: 0, y: 0 })
  const startSize = useRef<Size>({ width: 0, height: 0 })
  const startMouse = useRef<Position>({ x: 0, y: 0 })
  const resizeDir = useRef<ResizeDirection>(null)

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('button, input, textarea')) return
    
    const header = (e.target as HTMLElement).closest('[data-window-header]')
    if (!header) return

    e.preventDefault()
    e.stopPropagation()
    onFocus?.()
    setIsDragging(true)
    
    startPos.current = { x: position.x, y: position.y }
    startMouse.current = { x: e.clientX, y: e.clientY }

    const container = windowRef.current?.parentElement

    function handleMouseMove(moveEvent: globalThis.MouseEvent) {
      const deltaX = moveEvent.clientX - startMouse.current.x
      const deltaY = moveEvent.clientY - startMouse.current.y
      
      let newX = startPos.current.x + deltaX
      let newY = startPos.current.y + deltaY
      
      if (container) {
        const bounds = container.getBoundingClientRect()
        const maxX = bounds.width - size.width
        const maxY = bounds.height - size.height - 48
        newX = Math.max(0, Math.min(newX, maxX))
        newY = Math.max(0, Math.min(newY, maxY))
      }
      
      setPosition({ x: newX, y: newY })
    }

    function handleMouseUp() {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  function handleResizeStart(e: MouseEvent, direction: ResizeDirection) {
    e.preventDefault()
    e.stopPropagation()
    onFocus?.()
    setIsResizing(true)
    resizeDir.current = direction
    
    startPos.current = { x: position.x, y: position.y }
    startSize.current = { width: size.width, height: size.height }
    startMouse.current = { x: e.clientX, y: e.clientY }

    function handleMouseMove(moveEvent: globalThis.MouseEvent) {
      const deltaX = moveEvent.clientX - startMouse.current.x
      const deltaY = moveEvent.clientY - startMouse.current.y
      const dir = resizeDir.current
      
      let newWidth = startSize.current.width
      let newHeight = startSize.current.height
      let newX = startPos.current.x
      let newY = startPos.current.y

      // Handle horizontal resize
      if (dir?.includes('e')) {
        newWidth = Math.max(minWidth, startSize.current.width + deltaX)
      }
      if (dir?.includes('w')) {
        const widthDelta = Math.min(deltaX, startSize.current.width - minWidth)
        newWidth = startSize.current.width - widthDelta
        newX = startPos.current.x + widthDelta
      }

      // Handle vertical resize
      if (dir?.includes('s')) {
        newHeight = Math.max(minHeight, startSize.current.height + deltaY)
      }
      if (dir?.includes('n')) {
        const heightDelta = Math.min(deltaY, startSize.current.height - minHeight)
        newHeight = startSize.current.height - heightDelta
        newY = startPos.current.y + heightDelta
      }

      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newX, y: newY })
    }

    function handleMouseUp() {
      setIsResizing(false)
      resizeDir.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const resizeHandleClass = "absolute bg-transparent hover:bg-blue-500/20 transition-colors"

  return (
    <div
      ref={windowRef}
      className={`absolute shadow-2xl ${isDragging || isResizing ? 'select-none' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation()
        onFocus?.()
      }}
    >
      {children}
      
      {/* Resize handles */}
      {/* Edges */}
      <div 
        className={`${resizeHandleClass} top-0 left-2 right-2 h-1 cursor-n-resize`}
        onMouseDown={(e) => handleResizeStart(e, 'n')}
      />
      <div 
        className={`${resizeHandleClass} bottom-0 left-2 right-2 h-1 cursor-s-resize`}
        onMouseDown={(e) => handleResizeStart(e, 's')}
      />
      <div 
        className={`${resizeHandleClass} left-0 top-2 bottom-2 w-1 cursor-w-resize`}
        onMouseDown={(e) => handleResizeStart(e, 'w')}
      />
      <div 
        className={`${resizeHandleClass} right-0 top-2 bottom-2 w-1 cursor-e-resize`}
        onMouseDown={(e) => handleResizeStart(e, 'e')}
      />
      
      {/* Corners */}
      <div 
        className={`${resizeHandleClass} top-0 left-0 w-2 h-2 cursor-nw-resize`}
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      <div 
        className={`${resizeHandleClass} top-0 right-0 w-2 h-2 cursor-ne-resize`}
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div 
        className={`${resizeHandleClass} bottom-0 left-0 w-2 h-2 cursor-sw-resize`}
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
      <div 
        className={`${resizeHandleClass} bottom-0 right-0 w-2 h-2 cursor-se-resize`}
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />
    </div>
  )
}
