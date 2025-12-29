import { useCallback } from 'react'
import type { MobileApp } from '../../types'

interface DockProps {
  apps: MobileApp[]  // exactly 4 apps
  onAppTap: (appId: string) => void
}

// iOS design tokens
const IOS_DOCK_HEIGHT = 90
const IOS_ICON_SIZE = 54
const IOS_ICON_RADIUS = 12

export function Dock({ apps, onAppTap }: DockProps) {
  // Ensure exactly 4 apps are displayed
  const dockApps = apps.slice(0, 4)

  const handleTap = useCallback((appId: string) => {
    onAppTap(appId)
  }, [onAppTap])

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 px-4"
      style={{
        height: IOS_DOCK_HEIGHT,
        borderRadius: 28,
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
      data-testid="mobile-dock"
    >
      {dockApps.map(app => (
        <DockIcon
          key={app.id}
          app={app}
          onTap={() => handleTap(app.id)}
        />
      ))}
    </div>
  )
}

interface DockIconProps {
  app: MobileApp
  onTap: () => void
}

function DockIcon({ app, onTap }: DockIconProps) {
  // Determine if icon is an emoji or image URL
  const isImageUrl = app.icon.startsWith('http') || app.icon.startsWith('/')

  return (
    <div
      className="flex items-center justify-center cursor-pointer transition-transform duration-100 active:scale-90"
      style={{
        width: IOS_ICON_SIZE,
        height: IOS_ICON_SIZE,
        borderRadius: IOS_ICON_RADIUS,
        background: app.iconBackground || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
      onClick={onTap}
      onTouchEnd={(e) => {
        e.preventDefault()
        onTap()
      }}
      data-testid={`dock-icon-${app.id}`}
    >
      {isImageUrl ? (
        <img
          src={app.icon}
          alt={app.name}
          className="w-7 h-7 object-contain"
          draggable={false}
        />
      ) : (
        <span className="text-2xl" role="img" aria-label={app.name}>
          {app.icon}
        </span>
      )}
    </div>
  )
}
