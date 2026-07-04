'use client'

import { Settings, Key, Database, Cpu, Bell, Shield } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPanel() {
  const [llmProvider, setLlmProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4')

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-indigo-500" />
          <h2 className="font-semibold">Settings</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={16} className="text-indigo-500" />
            <h3 className="text-sm font-medium">LLM Configuration</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Provider</label>
              <select
                value={llmProvider}
                onChange={e => setLlmProvider(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
              >
                <option value="openai">OpenAI</option>
                <option value="google">Google Gemini</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Model</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                placeholder="gpt-4"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-indigo-500" />
            <h3 className="text-sm font-medium">Data Sources</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>PostgreSQL</span>
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Vector Database</span>
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>JSON/CSV</span>
              <span className="text-xs bg-zinc-100 text-zinc-500 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Ready</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-indigo-500" />
            <h3 className="text-sm font-medium">Safety Controls</h3>
          </div>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-zinc-300" />
              <span>Require confirmation for destructive actions</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-zinc-300" />
              <span>Log all executed actions</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-zinc-300" />
              <span>Store conversation history</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Note:</strong> For production use, set your API keys in the .env file.
            The system currently operates in mock mode with simulated AI responses.
          </p>
        </div>
      </div>
    </div>
  )
}
