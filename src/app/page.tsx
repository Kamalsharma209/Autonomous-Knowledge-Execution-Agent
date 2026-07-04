'use client'

import { useState } from 'react'
import Sidebar from '@/components/shared/Sidebar'
import ThemeToggle from '@/components/shared/ThemeToggle'
import ChatWindow from '@/components/chat/ChatWindow'
import AuditLogViewer from '@/components/audit/AuditLogViewer'
import KnowledgeManager from '@/components/knowledge/KnowledgeManager'
import MemoryViewer from '@/components/shared/MemoryViewer'
import SettingsPanel from '@/components/shared/SettingsPanel'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat')

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatWindow />
      case 'knowledge':
        return <KnowledgeManager />
      case 'audit':
        return <AuditLogViewer />
      case 'memory':
        return <MemoryViewer />
      case 'settings':
        return <SettingsPanel />
      default:
        return <ChatWindow />
    }
  }

  return (
    <div className="flex h-full bg-white dark:bg-zinc-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
          <h1 className="text-sm font-medium capitalize">
            {activeTab === 'chat' && 'AI Chat Assistant'}
            {activeTab === 'knowledge' && 'Knowledge Sources'}
            {activeTab === 'audit' && 'Audit Logs'}
            {activeTab === 'memory' && 'Memory & History'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
