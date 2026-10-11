"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const presets = ["1", "5", "10", "20", "50"]

export function TopupForm() {
  const router = useRouter()
  const [usd, setUsd] = useState("10")
  const [error, setError] = useState("")
  const [done, setDone] = useState("")
  const [pending, setPending] = useState(false)
  const coins = /^\d+(\.\d{1,2})?$/.test(usd.trim()) ? Number(usd).toFixed(2) : "—"

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setDone("")
    setPending(true)
    try {
      const response = await fetch("/api/topup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ usd }),
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
        balanceCents?: number
      } | null
      if (!response.ok) {
        setError(data?.error || "没有换成硬币。")
        return
      }
      setDone(`已记入 ${coins} 硬币。`)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant={usd === amount ? "default" : "secondary"}
            onClick={() => setUsd(amount)}
          >
            ${amount}
          </Button>
        ))}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="usd">美元金额</Label>
        <Input
          id="usd"
          inputMode="decimal"
          value={usd}
          onChange={(event) => setUsd(event.target.value)}
          className="h-11 text-lg"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {coins} 美元会记成 {coins} 硬币。这一台没有接银行卡，确认后按填写的金额入账。
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {done ? <p className="text-sm">{done}</p> : null}
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "入账中" : "换成硬币"}
      </Button>
    </form>
  )
}
