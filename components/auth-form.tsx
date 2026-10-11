"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [preview, setPreview] = useState("")
  const [wait, setWait] = useState(0)
  const [sending, setSending] = useState(false)
  const [pending, setPending] = useState(false)

  async function sendCode() {
    setError("")
    setPreview("")
    setSending(true)
    try {
      const response = await fetch("/api/auth/code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, purpose: mode }),
      })
      const data = (await response.json().catch(() => null)) as {
        error?: string
        delivered?: boolean
        previewCode?: string
      } | null
      if (!response.ok) {
        setError(data?.error || "验证码没有发出去。")
        return
      }
      if (data?.delivered) {
        setNote(`验证码已发到 ${email.trim()}，10 分钟内有效。`)
      } else if (data?.previewCode) {
        setPreview(data.previewCode)
        setNote("发信还没接上，验证码直接显示在下面，填进去即可。")
      } else {
        setNote("验证码已发出，10 分钟内有效。")
      }
      setWait(60)
      const timer = window.setInterval(() => {
        setWait((value) => {
          if (value <= 1) {
            window.clearInterval(timer)
            return 0
          }
          return value - 1
        })
      }, 1000)
    } finally {
      setSending(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      const response = await fetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code, name }),
      })
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        setError(data?.error || "没有登录成功。")
        return
      }
      router.push(next.startsWith("/") ? next : "/")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {mode === "register" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="name">昵称</Label>
          <Input
            id="name"
            value={name}
            maxLength={16}
            placeholder="别人会看到这个名字"
            onChange={(event) => setName(event.target.value)}
            className="h-10"
          />
        </div>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          placeholder="和青澜同一个邮箱"
          onChange={(event) => setEmail(event.target.value)}
          className="h-10"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="code">验证码</Label>
        <div className="flex gap-2">
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            placeholder="6 位数字"
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-10"
          />
          <Button type="button" variant="secondary" disabled={sending || wait > 0} onClick={() => void sendCode()}>
            {wait > 0 ? `${wait} 秒` : sending ? "发送中" : "获取验证码"}
          </Button>
        </div>
      </div>
      {preview ? (
        <p className="rounded-lg bg-accent px-3 py-2 text-sm">
          验证码 <strong className="tracking-[0.3em]">{preview}</strong>
        </p>
      ) : null}
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? "提交中" : mode === "register" ? "注册并登录" : "登录"}
      </Button>
    </form>
  )
}
