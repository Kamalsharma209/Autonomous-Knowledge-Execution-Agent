'use client'

import { useState, useEffect } from 'react'
import { Database, Upload, FileText, Trash2, Loader2, BookOpen, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface KnowledgeDoc {
  id: string
  title: string
  content: string
  source: string
  category: string
  createdAt: string
}

interface Policy {
  id: string
  title: string
  category: string
  content: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

type TabType = 'documents' | 'policies' | 'faqs' | 'upload'

export default function KnowledgeManager() {
  const [tab, setTab] = useState<TabType>('documents')
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [faqs, setFAQ] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'documents') {
        const res = await fetch('/api/knowledge')
        const data = await res.json()
        setDocuments(data.documents || [])
      } else if (tab === 'policies') {
        const res = await fetch('/api/policies')
        const data = await res.json()
        setPolicies(data.policies || [])
      } else if (tab === 'faqs') {
        const res = await fetch('/api/policies')
        const data = await res.json()
        const faqRes = await fetch('/api/knowledge?category=FAQ')
        const faqData = await faqRes.json()
        setFAQ(faqData.documents || [])
      }
    } catch {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tab])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success(`${data.count || 1} document(s) uploaded successfully`)
        form.reset()
        setTab('documents')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id))
        toast.success('Document deleted')
      }
    } catch {
      toast.error('Delete failed')
    }
  }

  const tabs = [
    { id: 'documents' as TabType, label: 'Documents', icon: FileText },
    { id: 'policies' as TabType, label: 'Policies', icon: BookOpen },
    { id: 'faqs' as TabType, label: 'FAQs', icon: HelpCircle },
    { id: 'upload' as TabType, label: 'Upload', icon: Upload },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-3">
          <Database size={20} className="text-indigo-500" />
          <h2 className="font-semibold">Knowledge Sources</h2>
        </div>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                tab === t.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        ) : tab === 'upload' ? (
          <form onSubmit={handleUpload} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Title</label>
              <input
                type="text"
                name="title"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Document title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Category</label>
              <input
                type="text"
                name="category"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. HR, IT, Finance"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Content</label>
              <textarea
                name="content"
                rows={8}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="Paste document content here..."
              />
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <p className="text-xs text-zinc-400 mb-2">Or upload a file (JSON, CSV, TXT)</p>
              <input
                type="file"
                name="file"
                accept=".json,.csv,.txt"
                className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload to Knowledge Base'}
            </button>
          </form>
        ) : tab === 'policies' ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {policies.map(policy => (
              <div
                key={policy.id}
                className="p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                onClick={() => setExpandedDoc(expandedDoc === policy.id ? null : policy.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{policy.title}</span>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                    {policy.category}
                  </span>
                </div>
                {expandedDoc === policy.id && (
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                    {policy.content}
                  </div>
                )}
              </div>
            ))}
            {policies.length === 0 && (
              <p className="text-center text-zinc-400 py-10 text-sm">No policies found</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="p-4 group"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-zinc-400" />
                      <span className="text-sm font-medium">{doc.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                        {doc.category || 'Uncategorized'}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {expandedDoc === doc.id && (
                  <div className="mt-2 ml-6 text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                    {doc.content}
                  </div>
                )}
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-center text-zinc-400 py-10 text-sm">No documents found</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
