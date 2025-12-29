interface MobileNavBarProps {
  appName: string
  onClose: () => void
}

// iOS design tokens
const IOS_NAV_BAR_HEIGHT = 44

function BackChevron() {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
      <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function MobileNavBar({ appName, onClose }: MobileNavBarProps) {
  const handleBack = () => {
    onClose()
  }

  return (
    <div
      className="flex items-center px-4 text-white"
      style={{
        height: IOS_NAV_BAR_HEIGHT,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      data-testid="mobile-nav-bar"
    >
      {/* Left side - Back button */}
      <button
        className="flex items-center gap-1 text-blue-400 active:opacity-60 transition-opacity"
        onClick={handleBack}
        onTouchEnd={(e) => {
          e.preventDefault()
          handleBack()
        }}
        data-testid="nav-back-button"
      >
        <BackChevron />
        <span className="text-base">Back</span>
      </button>

      {/* Center - App title */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-base truncate max-w-[50%]"
        data-testid="nav-app-title"
      >
        {appName}
      </div>

      {/* Right side - Empty for balance */}
      <div className="w-16" />
    </div>
  )
}
