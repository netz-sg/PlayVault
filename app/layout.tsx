import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { Toaster } from "@/components/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Game Library",
  description: "Verwalte deine Spielebibliothek",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900`}
      >
        <AuthProvider>
          <Header />
          <ErrorBoundary>
            <main className="container mx-auto px-4 py-8">{children}</main>
          </ErrorBoundary>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
