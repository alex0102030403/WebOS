import { useRef, useState, useEffect } from 'react'
import { saveFile } from '../../api'

interface PaintProps {
  onClose: () => void
  currentDirectory?: string
  onFileSaved?: () => void
}

const COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#ff8000', '#8000ff', '#0080ff', '#ff0080',
  '#808080', '#c0c0c0', '#800000', '#008000', '#000080', '#808000',
]

const BRUSH_SIZES = [2, 4, 8, 12, 20, 32]

export function Paint({ onClose, currentDirectory = 'desktop', onFileSaved }: PaintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(4)
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filename, setFilename] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  function getCanvasCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true)
    lastPos.current = getCanvasCoords(e)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !lastPos.current) return

    const pos = getCanvasCoords(e)
    
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    
    lastPos.current = pos
  }

  function stopDrawing() {
    setIsDrawing(false)
    lastPos.current = null
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function openSaveDialog() {
    setFilename('')
    setSaveError(null)
    setShowSaveDialog(true)
  }

  async function handleSave() {
    if (!filename.trim()) {
      setSaveError('Please enter a filename')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const dataUrl = canvas.toDataURL('image/png')
      const base64Content = dataUrl.split(',')[1]
      const finalName = filename.endsWith('.png') ? filename : `${filename}.png`
      
      await saveFile(currentDirectory, finalName, base64Content)
      setShowSaveDialog(false)
      onFileSaved?.()
    } catch {
      setSaveError('Failed to save file. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0]">
      <TitleBar onClose={onClose} />
      <Toolbar
        tool={tool}
        setTool={setTool}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onClear={clearCanvas}
        onSave={openSaveDialog}
      />
      <div className="flex flex-1 overflow-hidden">
        <ColorPalette color={color} setColor={setColor} />
        <div className="flex-1 p-2 overflow-auto bg-[#808080]">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="bg-white cursor-crosshair shadow-lg"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
      <StatusBar tool={tool} brushSize={brushSize} color={color} />
      
      {showSaveDialog && (
        <SaveDialog
          filename={filename}
          setFilename={setFilename}
          onSave={handleSave}
          onCancel={() => setShowSaveDialog(false)}
          error={saveError}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}


interface TitleBarProps {
  onClose: () => void
}

function TitleBar({ onClose }: TitleBarProps) {
  return (
    <div 
      data-window-header
      className="flex items-center justify-between px-2 py-1 bg-[#0078d4] text-white cursor-move"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">🎨</span>
        <span className="text-sm font-medium">Paint</span>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-6 flex items-center justify-center hover:bg-red-500 rounded transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

interface ToolbarProps {
  tool: 'brush' | 'eraser'
  setTool: (tool: 'brush' | 'eraser') => void
  brushSize: number
  setBrushSize: (size: number) => void
  onClear: () => void
  onSave: () => void
}

function Toolbar({ tool, setTool, brushSize, setBrushSize, onClear, onSave }: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 px-3 py-2 bg-[#f5f5f5] border-b border-gray-300">
      <div className="flex gap-1">
        <ToolButton
          active={tool === 'brush'}
          onClick={() => setTool('brush')}
          title="Brush"
        >
          ✏️
        </ToolButton>
        <ToolButton
          active={tool === 'eraser'}
          onClick={() => setTool('eraser')}
          title="Eraser"
        >
          🧹
        </ToolButton>
      </div>
      
      <div className="h-6 w-px bg-gray-300" />
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">Size:</span>
        <select
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded"
        >
          {BRUSH_SIZES.map(size => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>
      </div>
      
      <div className="h-6 w-px bg-gray-300" />
      
      <button
        onClick={onClear}
        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
      >
        Clear
      </button>
      
      <button
        onClick={onSave}
        className="px-3 py-1 text-xs bg-[#0078d4] text-white border border-[#0078d4] rounded hover:bg-[#006cbd]"
      >
        💾 Save
      </button>
    </div>
  )
}

interface ToolButtonProps {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}

function ToolButton({ active, onClick, title, children }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
        active 
          ? 'bg-[#cce4f7] border-[#0078d4]' 
          : 'bg-white border-gray-300 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

interface ColorPaletteProps {
  color: string
  setColor: (color: string) => void
}

function ColorPalette({ color, setColor }: ColorPaletteProps) {
  return (
    <div className="w-16 p-2 bg-[#f0f0f0] border-r border-gray-300">
      <div
        className="w-10 h-10 mb-2 border-2 border-gray-400 rounded"
        style={{ backgroundColor: color }}
      />
      <div className="grid grid-cols-2 gap-1">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded border ${
              color === c ? 'border-black border-2' : 'border-gray-400'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  )
}

interface StatusBarProps {
  tool: 'brush' | 'eraser'
  brushSize: number
  color: string
}

function StatusBar({ tool, brushSize, color }: StatusBarProps) {
  return (
    <div className="flex items-center gap-4 px-3 py-1 bg-[#f0f0f0] border-t border-gray-300 text-xs text-gray-600">
      <span>Tool: {tool === 'brush' ? 'Brush' : 'Eraser'}</span>
      <span>Size: {brushSize}px</span>
      {tool === 'brush' && (
        <span className="flex items-center gap-1">
          Color: 
          <span 
            className="inline-block w-3 h-3 border border-gray-400"
            style={{ backgroundColor: color }}
          />
        </span>
      )}
    </div>
  )
}

interface SaveDialogProps {
  filename: string
  setFilename: (name: string) => void
  onSave: () => void
  onCancel: () => void
  error: string | null
  isSaving: boolean
}

function SaveDialog({ filename, setFilename, onSave, onCancel, error, isSaving }: SaveDialogProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !isSaving) onSave()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl p-4 w-80">
        <h3 className="text-sm font-semibold mb-3">Save Image</h3>
        
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Filename:</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="my-drawing"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#0078d4]"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">.png extension will be added automatically</p>
        </div>
        
        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-3 py-1 text-xs bg-[#0078d4] text-white rounded hover:bg-[#006cbd] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
