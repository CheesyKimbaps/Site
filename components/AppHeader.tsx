"use client"

import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function AppHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Avoid SSR flash by rendering nothing until mounted
  if (!mounted) return null

  const isAuthRoute = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")
  if (isAuthRoute) return null

  return (
    <header className="w-full p-4 flex items-center justify-between bg-gray-900 text-gray-100 shadow-sm">
      <h1 className="text-lg font-semibold">Profit Tracker</h1>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}
