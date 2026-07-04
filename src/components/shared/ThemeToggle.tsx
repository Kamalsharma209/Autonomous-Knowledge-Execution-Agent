'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const stored = localStorage.getItem('theme')
    const shouldBeDark = stored === 'dark' || (!stored && isDark)
    setDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggle = () => {
    const newDark = !dark
    setDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
