import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: "AutoAgent - Autonomous Knowledge Execution Agent",
  description: "AI Agent that retrieves information, reasons, and executes actions automatically",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}
