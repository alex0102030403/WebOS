import { useState, useRef, type ReactNode, type MouseEvent } from 'react'

interface DraggableWindowProps {
  children: ReactNode
  initialX?: number
  initialY?: number
  width: number
  height: number
  onFocus?: () => void
  zIndex?: number
}

interface Position {
  x: number
  y: number
}

export function DraggableWindow({ 
  children, 
  initialX = 100, 
  initialY = 50, 
  width, 
  height,
  onFocus,
  zIndex = 10
}: DraggableWindowProps) {
  const [position, setPosition] = useState<Position>({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const startPos = useRef<Position>({ x: 0, y: 0 })
  const startMouse = useRef<Position>({ x: 0, y: 0 })

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
        const maxX = bounds.width - width
        const maxY = bounds.height - height - 48
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

  return (
    <div
      ref={windowRef}
      className={`absolute shadow-2xl ${isDragging ? 'cursor-grabbing select-none' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width,
        height,
        zIndex
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation()
        onFocus?.()
      }}
    >
      {children}
    </div>
  )
}
