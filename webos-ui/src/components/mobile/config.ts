import type { MobileApp } from '../../types'

export const MOBILE_APP_CONFIG: Record<string, MobileApp> = {
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    iconBackground: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    iconBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  fileexplorer: {
    id: 'fileexplorer',
    name: 'Files',
    icon: '📂',
    iconBackground: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  chrome: {
    id: 'chrome',
    name: 'Browser',
    icon: '🌐',
    iconBackground: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  notepad: {
    id: 'notepad',
    name: 'Notes',
    icon: '📝',
    iconBackground: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  minesweeper: {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: '💣',
    iconBackground: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  paint: {
    id: 'paint',
    name: 'Paint',
    icon: '🎨',
    iconBackground: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  },
  jshellstudio: {
    id: 'jshellstudio',
    name: 'JShell',
    icon: '☕',
    iconBackground: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  cvviewer: {
    id: 'cvviewer',
    name: 'My CV',
    icon: '📄',
    iconBackground: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  taskmanager: {
    id: 'taskmanager',
    name: 'Tasks',
    icon: '📊',
    iconBackground: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
}

// Default dock apps (4 apps as per requirements)
export const DEFAULT_DOCK_APPS = ['terminal', 'fileexplorer', 'settings', 'chrome']

// Get all apps for the grid (excluding dock apps if needed)
export function getGridApps(): MobileApp[] {
  return Object.values(MOBILE_APP_CONFIG)
}

// Get dock apps
export function getDockApps(): MobileApp[] {
  return DEFAULT_DOCK_APPS.map(id => MOBILE_APP_CONFIG[id])
}
