'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Search, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  userQuery: string
  retrievedKnowledge: string
  reasoning: string
  selectedTool: string
  actionExecuted: string
  executionStatus: string
  finalResponse: string
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/audit-logs?page=${page}&limit=20`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch {
      console.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page])

  const filteredLogs = logs.filter(log =>
    log.userQuery?.toLowerCase().includes(search.toLowerCase()) ||
    log.selectedTool?.toLowerCase().includes(search.toLowerCase()) ||
    log.executionStatus?.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-indigo-500" />
            <h2 className="font-semibold">Audit Logs</h2>
            <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {totalPages} pages
            </span>
          </div>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <ClipboardList size={40} className="mb-2" />
            <p className="text-sm">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                      statusColors[log.executionStatus] || 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {log.executionStatus}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{log.userQuery}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                    {log.selectedTool || 'N/A'}
                  </span>
                  {log.actionExecuted && (
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                      {log.actionExecuted}
                    </span>
                  )}
                </div>

                {selectedLog?.id === log.id && (
                  <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-2 text-xs">
                    <div>
                      <span className="font-medium text-zinc-500">Reasoning:</span>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{log.reasoning || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-zinc-500">Final Response:</span>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{log.finalResponse || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-zinc-500">Tool Used:</span>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{log.selectedTool}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
