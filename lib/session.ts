import { cache } from "react"
import { cookies } from "next/headers"
import {
  cookieHeaderFromSetCookie,
  paymentReady,
  purchaseIds,
  qinglan,
  type QinglanUser,
} from "@/lib/qinglan"
import { newId, readStore, updateStore, type Account, type LedgerEntry } from "@/lib/store"

export const SESSION_COOKIE = "lanbi_session"

export type Viewer = {
  sessionId: string
  userId: string
  email: string
  name: string
  balanceCents: number
  entries: LedgerEntry[]
  purchases: string[]
  paymentReady: boolean
}

function accountOf(accounts: Record<string, Account>, userId: string, email: string, name: string) {
  return (
    accounts[userId] ?? {
      userId,
      email,
      name,
      balanceCents: 0,
      entries: [],
    }
  )
}

export const getViewer = cache(async function getViewer(): Promise<Viewer | null> {
  const jar = await cookies()
  const sessionId = jar.get(SESSION_COOKIE)?.value
  if (!sessionId) return null
  const db = readStore()
  const session = db.sessions[sessionId]
  if (!session) return null
  const remote = await qinglan<{
    user?: QinglanUser | null
    purchases?: unknown
    error?: string
  }>("/api/auth/session", { cookie: session.cookie })
  const user = remote.data.user
  if (!remote.ok || !user?.id) return null
  const account = accountOf(db.accounts, user.id, session.email, user.name || session.name)
  if (user.name && user.name !== account.name) account.name = user.name
  return {
    sessionId,
    userId: user.id,
    email: user.email || session.email,
    name: user.name || session.name || "青澜读者",
    balanceCents: account.balanceCents,
    entries: account.entries,
    purchases: purchaseIds(remote.data.purchases),
    paymentReady: paymentReady(),
  }
})

export async function openSession(input: {
  email: string
  name: string
  setCookies: string[]
}) {
  const cookie = cookieHeaderFromSetCookie(input.setCookies)
  if (!cookie) return { error: "青澜没有发回登录凭证。" as const }
  const remote = await qinglan<{ user?: QinglanUser | null; error?: string }>(
    "/api/auth/session",
    { cookie },
  )
  const user = remote.data.user
  if (!remote.ok || !user?.id) {
    return { error: remote.data.error || "登录凭证没有被青澜认下来。" }
  }
  const sessionId = newId("ses")
  const email = user.email || input.email.trim().toLowerCase()
  const name = (user.name || input.name || "青澜读者").slice(0, 16)
  await updateStore((db) => {
    for (const [id, session] of Object.entries(db.sessions)) {
      if (session.userId === user.id) delete db.sessions[id]
    }
    db.sessions[sessionId] = {
      id: sessionId,
      userId: user.id,
      email,
      name,
      cookie,
      createdAt: Date.now(),
    }
    const account = accountOf(db.accounts, user.id, email, name)
    account.email = email
    account.name = name
    db.accounts[user.id] = account
  })
  const jar = await cookies()
  jar.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  })
  return { error: null, name, email, userId: user.id }
}

export async function closeSession() {
  const jar = await cookies()
  const sessionId = jar.get(SESSION_COOKIE)?.value
  if (sessionId) {
    const db = readStore()
    const session = db.sessions[sessionId]
    if (session) {
      await qinglan("/api/auth/logout", { method: "POST", cookie: session.cookie })
    }
    await updateStore((draft) => {
      delete draft.sessions[sessionId]
    })
  }
  jar.delete(SESSION_COOKIE)
}
