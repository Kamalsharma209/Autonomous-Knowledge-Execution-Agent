'use client'

import { useState, useEffect } from 'react'
import { Brain, MessageSquare, Star, Clock, Loader2 } from 'lucide-react'

interface Memory {
  id: string
  key: string
  value: string
  type: string
  updatedAt: string
}

interface Conversation {
  id: string
  role: string
  content: string
  createdAt: string
}

type ViewType = 'memories' | 'conversations'

export default function MemoryViewer() {
  const [view, setView] = useState<ViewType>('memories')
  const [memories, setMemories] = useState<Memory[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`)
  }, [])

  useEffect(() => {
    fetchData()
  }, [view])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (view === 'memories') {
        const res = await fetch(`/api/memory?sessionId=${sessionId}`)
        const data = await res.json()
        setMemories(data.memories || [])
      } else {
        const res = await fetch(`/api/conversations?sessionId=${sessionId}`)
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={20} className="text-indigo-500" />
          <h2 className="font-semibold">Long-Term Memory</h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setView('memories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
              view === 'memories'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Star size={14} />
            Memories
          </button>
          <button
            onClick={() => setView('conversations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
              view === 'conversations'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <MessageSquare size={14} />
            Conversations
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        ) : view === 'memories' ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {memories.map(memory => (
              <div key={memory.id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                    {memory.type}
                  </span>
                  <span className="text-xs text-zinc-400">
                    <Clock size={12} className="inline mr-1" />
                    {new Date(memory.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium">{memory.key}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{memory.value}</p>
              </div>
            ))}
            {memories.length === 0 && (
              <p className="text-center text-zinc-400 py-10 text-sm">
                No memories stored yet. Start chatting to build memory.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {conversations.map(conv => (
              <div key={conv.id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    conv.role === 'user'
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : conv.role === 'assistant'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {conv.role}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(conv.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {conv.content}
                </p>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-center text-zinc-400 py-10 text-sm">
                No conversations yet. Start chatting to see history.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
