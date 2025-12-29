import type { MobileApp } from '../../types'
import { MobileAppIcon } from './MobileAppIcon'

interface AppGridProps {
  apps: MobileApp[]
  onAppTap: (appId: string) => void
  onAppLongPress: (appId: string) => void
  wigglingAppId?: string | null
}

// iOS design tokens
const IOS_GRID_GAP = 20
const IOS_GRID_COLUMNS = 4

export function AppGrid({ apps, onAppTap, onAppLongPress, wigglingAppId = null }: AppGridProps) {
  return (
    <div
      className="w-full px-4 py-6"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${IOS_GRID_COLUMNS}, 1fr)`,
        gap: IOS_GRID_GAP,
        justifyItems: 'center'
      }}
      data-testid="app-grid"
    >
      {apps.map((app) => (
        <MobileAppIcon
          key={app.id}
          app={app}
          onTap={() => onAppTap(app.id)}
          onLongPress={() => onAppLongPress(app.id)}
          isWiggling={wigglingAppId === app.id}
        />
      ))}
    </div>
  )
}
