"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { WishlistView } from "@/components/wishlist-view"
import { useAuth } from "@/components/auth-provider"

export default function WishlistPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div>
      <Link href="/" className="inline-flex items-center text-white hover:text-emerald-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Bibliothek
      </Link>

      <WishlistView />
    </div>
  )
}
