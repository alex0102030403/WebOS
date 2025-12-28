import { useState, useCallback, type FormEvent } from 'react'

interface ChromeBrowserProps {
  onClose: () => void
  initialUrl?: string
}

interface Bookmark {
  id: string
  name: string
  url: string
  favicon: string
}

interface NavigationState {
  currentUrl: string
  isLoading: boolean
  error: string | null
}

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'github', name: 'GitHub', url: 'https://github.com/', favicon: '🐙' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://linkedin.com/in/', favicon: '💼' },
  { id: 'medium', name: 'Medium', url: 'https://medium.com/@', favicon: '📝' },
]

function buildProxyUrl(virtualUrl: string): string {
  return `/api/browser/navigate?url=${encodeURIComponent(virtualUrl)}`
}

export function ChromeBrowser({ onClose, initialUrl = '' }: ChromeBrowserProps) {
  const [addressBarValue, setAddressBarValue] = useState(initialUrl)
  const [navigation, setNavigation] = useState<NavigationState>({
    currentUrl: initialUrl,
    isLoading: false,
    error: null,
  })
  const [showBookmarks, setShowBookmarks] = useState(true)

  const navigateTo = useCallback((url: string) => {
    if (!url.trim()) return
    
    setNavigation({
      currentUrl: url,
      isLoading: true,
      error: null,
    })
    setAddressBarValue(url)
  }, [])

  function handleAddressSubmit(e: FormEvent) {
    e.preventDefault()
    navigateTo(addressBarValue)
  }

  function handleBookmarkClick(bookmark: Bookmark) {
    navigateTo(bookmark.url)
  }

  function handleIframeLoad() {
    setNavigation(prev => ({ ...prev, isLoading: false }))
  }

  function handleIframeError() {
    setNavigation(prev => ({
      ...prev,
      isLoading: false,
      error: 'Failed to load page',
    }))
  }

  function handleRefresh() {
    if (navigation.currentUrl) {
      setNavigation(prev => ({ ...prev, isLoading: true, error: null }))
      // Force iframe reload by briefly clearing and restoring the URL
      const currentUrl = navigation.currentUrl
      setNavigation(prev => ({ ...prev, currentUrl: '' }))
      setTimeout(() => {
        setNavigation(prev => ({ ...prev, currentUrl }))
      }, 50)
    }
  }

  function handleHome() {
    setNavigation({ currentUrl: '', isLoading: false, error: null })
    setAddressBarValue('')
  }

  const proxyUrl = navigation.currentUrl ? buildProxyUrl(navigation.currentUrl) : ''

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Window Header */}
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <span className="text-white text-sm font-medium">Chrome</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/80 border-b border-gray-700">
        {/* Navigation Buttons */}
        <button
          onClick={handleHome}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="Home"
        >
          🏠
        </button>
        <button
          onClick={handleRefresh}
          disabled={!navigation.currentUrl}
          className={`p-1.5 rounded transition-colors ${
            navigation.currentUrl 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          title="Refresh"
        >
          🔄
        </button>

        {/* Address Bar */}
        <form onSubmit={handleAddressSubmit} className="flex-1">
          <div className="flex items-center bg-gray-700 rounded-full px-4 py-1.5">
            <span className="text-gray-400 mr-2 text-sm">🔒</span>
            <input
              type="text"
              value={addressBarValue}
              onChange={(e) => setAddressBarValue(e.target.value)}
              placeholder="Enter URL (e.g., https://github.com/username)"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"
            />
            {navigation.isLoading && (
              <span className="text-gray-400 animate-spin ml-2">⏳</span>
            )}
          </div>
        </form>

        {/* Bookmarks Toggle */}
        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className={`p-1.5 rounded transition-colors ${
            showBookmarks 
              ? 'text-blue-400 bg-gray-700' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          title="Toggle Bookmarks"
        >
          ⭐
        </button>
      </div>

      {/* Bookmarks Bar */}
      {showBookmarks && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border-b border-gray-700 overflow-x-auto">
          {DEFAULT_BOOKMARKS.map(bookmark => (
            <button
              key={bookmark.id}
              onClick={() => handleBookmarkClick(bookmark)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-700/50 hover:bg-gray-600 transition-colors text-sm whitespace-nowrap"
            >
              <span>{bookmark.favicon}</span>
              <span className="text-gray-300">{bookmark.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {!navigation.currentUrl ? (
          /* Home Page */
          <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-800">
            <span className="text-6xl mb-4">🌐</span>
            <h2 className="text-xl font-semibold mb-2">WebOS Browser</h2>
            <p className="text-gray-500 text-sm mb-6">Enter a URL or click a bookmark to get started</p>
            <div className="flex flex-wrap justify-center gap-4 max-w-md">
              {DEFAULT_BOOKMARKS.map(bookmark => (
                <button
                  key={bookmark.id}
                  onClick={() => handleBookmarkClick(bookmark)}
                  className="flex flex-col items-center p-4 rounded-lg bg-white shadow hover:shadow-md transition-shadow"
                >
                  <span className="text-3xl mb-2">{bookmark.favicon}</span>
                  <span className="text-sm text-gray-700">{bookmark.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Proxied Content */
          <>
            {navigation.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="flex flex-col items-center">
                  <span className="text-4xl animate-bounce mb-2">🌐</span>
                  <span className="text-gray-600">Loading...</span>
                </div>
              </div>
            )}
            <iframe
              src={proxyUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Browser Content"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </>
        )}
      </div>
    </div>
  )
}
