'use client'

import { Bot, MessageSquare, Database, ClipboardList, Brain, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'knowledge', label: 'Knowledge', icon: Database },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300`}
    >
      <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Bot className="text-indigo-500" size={24} />
            <span className="font-bold text-sm">AutoAgent</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title={collapsed ? tab.label : undefined}
          >
            <tab.icon size={18} />
            {!collapsed && <span>{tab.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        {!collapsed && (
          <div className="text-xs text-zinc-400">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              System Online
            </div>
            <p>Internal Knowledge Only</p>
          </div>
        )}
      </div>
    </aside>
  )
}
