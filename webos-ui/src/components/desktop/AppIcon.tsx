import { useState } from 'react'

interface AppIconProps {
  name: string
  fallbackEmoji: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-2xl',
  md: 'w-8 h-8 text-2xl',
  lg: 'w-10 h-10 text-4xl',
}

export function AppIcon({ name, fallbackEmoji, size = 'md' }: AppIconProps) {
  const [imgError, setImgError] = useState(false)
  const iconPath = `/icons/${name}.png`
  const sizeClass = SIZE_CLASSES[size]

  if (imgError) return <span className={sizeClass}>{fallbackEmoji}</span>

  return (
    <img
      src={iconPath}
      alt={name}
      className={`${sizeClass} object-contain drop-shadow-lg`}
      onError={() => setImgError(true)}
    />
  )
}
