import type { FileNode } from '../../types'

interface DesktopIconProps {
  node: FileNode
  onClick: (node: FileNode) => void
  isSelected: boolean
  onSelect: (node: FileNode) => void
}

function getIconEmoji(node: FileNode): string {
  if (node.type === 'DIRECTORY') return '📁'
  if (node.type === 'SHORTCUT') {
    if (node.content?.startsWith('app:terminal')) return '💻'
    if (node.content?.startsWith('app:taskmanager')) return '📊'
    if (node.content?.includes('github')) return '🐙'
    return '🔗'
  }
  if (node.name.endsWith('.pdf')) return '📄'
  if (node.name.endsWith('.txt')) return '📝'
  return '📄'
}

export function DesktopIcon({ node, onClick, isSelected, onSelect }: DesktopIconProps) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    onSelect(node)
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    onClick(node)
  }

  return (
    <div
      className={`
        flex flex-col items-center justify-center w-20 p-2 rounded-lg cursor-pointer
        transition-all duration-150 select-none
        ${isSelected 
          ? 'bg-white/20 ring-1 ring-white/40' 
          : 'hover:bg-white/10'
        }
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="text-4xl mb-1">
        {getIconEmoji(node)}
      </div>
      <span className="text-white text-xs text-center leading-tight drop-shadow-lg line-clamp-2">
        {node.name}
      </span>
    </div>
  )
}
