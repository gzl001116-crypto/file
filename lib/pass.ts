import { createHmac, randomInt, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import type { LedgerEntry } from "@/lib/store"

const secret = process.env.LANBI_SECRET || "lanbi-shelf-key"
const PASS = "lanbi_pass"
const OTP = "lanbi_otp"

export type Pass = {
  userId: string
  email: string
  name: string
  balanceCents: number
  entries: LedgerEntry[]
  purchases: string[]
}

type Otp = {
  email: string
  purpose: "login" | "register"
  code: string
  exp: number
}

function sign(payload: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

function seal(data: unknown) {
  const payload = Buffer.from(JSON.stringify(data), "utf8").toString("base64url")
  return `${payload}.${sign(payload)}`
}

function open<T>(token: string | undefined): T | null {
  if (!token) return null
  const dot = token.lastIndexOf(".")
  if (dot <= 0) return null
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  const expected = sign(payload)
  const left = Buffer.from(mac)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T
  } catch {
    return null
  }
}

function options(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  }
}

export async function readPass(): Promise<Pass | null> {
  const jar = await cookies()
  const pass = open<Pass>(jar.get(PASS)?.value)
  if (!pass?.userId || !pass.email) return null
  return {
    userId: pass.userId,
    email: pass.email,
    name: pass.name || "读者",
    balanceCents: Number.isInteger(pass.balanceCents) ? pass.balanceCents : 0,
    entries: Array.isArray(pass.entries) ? pass.entries.slice(0, 20) : [],
    purchases: Array.isArray(pass.purchases)
      ? pass.purchases.filter((id) => typeof id === "string")
      : [],
  }
}

export async function writePass(pass: Pass) {
  const jar = await cookies()
  jar.set(PASS, seal({ ...pass, entries: pass.entries.slice(0, 20) }), options(60 * 60 * 24 * 30))
}

export async function clearPass() {
  const jar = await cookies()
  jar.delete(PASS)
  jar.delete(OTP)
}

export async function issueOtp(email: string, purpose: "login" | "register") {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
  const otp: Otp = {
    email: email.trim().toLowerCase(),
    purpose,
    code,
    exp: Date.now() + 10 * 60 * 1000,
  }
  const jar = await cookies()
  jar.set(OTP, seal(otp), options(10 * 60))
  return code
}

export async function consumeOtp(email: string, purpose: "login" | "register", code: string) {
  const jar = await cookies()
  const otp = open<Otp>(jar.get(OTP)?.value)
  const ok = Boolean(
    otp &&
      otp.email === email.trim().toLowerCase() &&
      otp.purpose === purpose &&
      otp.code === code &&
      otp.exp > Date.now(),
  )
  if (!ok) return false
  jar.delete(OTP)
  return true
}
