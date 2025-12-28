interface StartMenuProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

const PINNED_APPS = [
  { name: 'Terminal', icon: '💻' },
  { name: 'Task Manager', icon: '📊' },
  { name: 'File Explorer', icon: '📁' },
  { name: 'Settings', icon: '⚙️' },
]

export function StartMenu({ isOpen, onClose, username }: StartMenuProps) {
  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[600px] max-w-[95vw] bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
        <div className="p-6">
          <input
            type="text"
            placeholder="Type to search..."
            className="w-full bg-gray-800/50 border border-white/10 rounded-full px-4 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="px-6 pb-4">
          <h3 className="text-white/60 text-xs font-medium mb-3">Pinned</h3>
          <div className="grid grid-cols-4 gap-2">
            {PINNED_APPS.map((app) => (
              <button
                key={app.name}
                className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-2xl">{app.icon}</span>
                <span className="text-white text-xs">{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-white text-sm">{username}</span>
          </div>
          
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
