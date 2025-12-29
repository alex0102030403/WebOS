import type { FileNode } from '../../types'

interface ImageViewerProps {
  onClose: () => void
  file: FileNode
}

export function ImageViewer({ onClose, file }: ImageViewerProps) {
  // Content is base64 encoded PNG
  const imageSrc = file.content ? `data:image/png;base64,${file.content}` : ''

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🖼️</span>
          <span className="text-sm font-medium">{file.name}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-gray-950 overflow-auto">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-500">No image content</div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        {file.name}
      </div>
    </div>
  )
}
