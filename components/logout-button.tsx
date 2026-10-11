"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/")
        router.refresh()
      }}
    >
      退出
    </Button>
  )
}
