interface CVViewerProps {
  onClose: () => void
}

export function CVViewer({ onClose }: CVViewerProps) {
  function handleDownload() {
    const link = document.createElement('a')
    link.href = '/Alexandru-Man.pdf'
    link.download = 'Alexandru-Man-CV.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <span className="text-sm font-medium">CV - Alexandru Man</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
        >
          <span>⬇️</span>
          Download PDF
        </button>
        <span className="text-xs text-gray-400">Click to download the full CV</span>
      </div>

      <div className="flex-1 overflow-auto bg-gray-950 p-4 flex items-start justify-center">
        <img
          src="/CV.png"
          alt="Alexandru Man CV"
          className="max-w-full h-auto rounded shadow-lg border border-gray-700"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        />
      </div>
    </div>
  )
}
