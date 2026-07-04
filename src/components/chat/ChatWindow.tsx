'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import ActionTimeline from './ActionTimeline'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  steps?: { step: string; status: string; result?: string; timestamp: string }[]
  requiresConfirmation?: boolean
  selectedTool?: string
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '# Welcome to AutoAgent\n\nI am your autonomous knowledge execution agent. I can:\n\n- **Approve/Reject** leave requests\n- **Manage** employees, products, inventory\n- **Search** internal knowledge base\n- **Generate** reports\n- **View** audit logs\n\nTry asking: _"Approve leave for Rahul if he has more than 15 leave balance"_ or _"Show me the company leave policy"_',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string, confirmedAction?: { tool: string; params: Record<string, unknown> }) => {
    setLoading(true)
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content, timestamp: new Date() }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId,
          confirmedAction,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setMessages(prev => [
          ...prev,
          { role: 'system', content: `Error: ${data.error}`, timestamp: new Date() },
        ])
        return
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.explanation,
          timestamp: new Date(),
          steps: data.steps,
          requiresConfirmation: data.requiresConfirmation,
          selectedTool: data.selectedTool,
        },
      ])

      if (data.sessionId) setSessionId(data.sessionId)
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'system', content: 'Failed to send message. Please try again.', timestamp: new Date() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim())
  }

  const handleConfirm = (message: Message) => {
    sendMessage(`Confirmed: ${message.content}`, {
      tool: message.selectedTool || '',
      params: {},
    })
  }

  const handleReject = () => {
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: 'Action cancelled. No changes were made. Is there anything else I can help you with?',
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm">
              {msg.role === 'user' ? (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              ) : msg.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs text-zinc-400 mb-1" suppressHydrationWarning>
                {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AutoAgent' : 'System'}
                {' · '}
                {msg.timestamp.toLocaleTimeString()}
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-zinc-900 prose-pre:text-zinc-100">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {msg.steps && msg.steps.length > 0 && (
                <ActionTimeline steps={msg.steps} />
              )}

              {msg.requiresConfirmation && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle size={18} className="text-amber-500" />
                  <span className="text-sm text-amber-700 dark:text-amber-300 flex-1">
                    This action requires your confirmation. Do you want to proceed?
                  </span>
                  <button
                    onClick={() => handleConfirm(msg)}
                    className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-sm rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask me anything about your internal data..."
            className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
