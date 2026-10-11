"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function RedeemButton({
  workId,
  label,
}: {
  workId: string
  label: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [href, setHref] = useState("")

  return (
    <div className="grid gap-2">
      <Button
        className="h-10"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          setError("")
          try {
            const response = await fetch("/api/redeem", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ workId }),
            })
            const data = (await response.json().catch(() => null)) as {
              error?: string
              href?: string
            } | null
            if (!response.ok) {
              setError(data?.error || "没有兑换成功。")
              return
            }
            setHref(data?.href || "")
            router.refresh()
          } finally {
            setPending(false)
          }
        }}
      >
        {pending ? "兑换中" : label}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {href ? (
        <a className="text-sm underline-offset-4 hover:underline" href={href}>
          去青澜阅读
        </a>
      ) : null}
    </div>
  )
}
