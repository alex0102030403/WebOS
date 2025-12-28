import { useDeviceType } from '../../hooks/useDeviceType'
import { Scene3D } from './Scene3D'
import { Desktop } from '../desktop/Desktop'

export function ResponsiveDesktop() {
  const deviceType = useDeviceType()

  if (deviceType === 'mobile') {
    return (
      <div className="w-screen h-screen">
        <Desktop />
      </div>
    )
  }

  return (
    <div className="w-screen h-screen">
      <Scene3D>
        <Desktop />
      </Scene3D>
    </div>
  )
}
