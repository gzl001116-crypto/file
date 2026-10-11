export const QINGLAN_ORIGIN = (
  process.env.QINGLAN_ORIGIN ?? "https://rapid-antimony-bxix9kp.vercel.app"
).replace(/\/$/, "")

export type QinglanUser = {
  id: string
  name?: string
  email?: string
  bio?: string
}

export type QinglanWork = {
  id: string
  kind: "novel" | "comic" | "video" | string
  title: string
  synopsis?: string
  price: number
  creatorId?: string
  status?: string
  tags?: string[]
  locked?: boolean
  unitCount?: number
  format?: string
  stats?: { views?: number; likes?: number; bookmarks?: number }
}

export type QinglanCreator = { id: string; name?: string }

export type QinglanOrder = {
  id: string
  amount: number
  status: string
  workId?: string
}

type QinglanResult<T> = {
  ok: boolean
  status: number
  data: T
  setCookies: string[]
}

export function cookieHeaderFromSetCookie(setCookies: string[]): string {
  return setCookies
    .map((line) => line.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ")
}

export async function qinglan<T = Record<string, unknown>>(
  path: string,
  init: { method?: string; body?: unknown; cookie?: string } = {},
): Promise<QinglanResult<T>> {
  const headers = new Headers({ accept: "application/json" })
  if (init.body !== undefined) headers.set("content-type", "application/json")
  if (init.cookie) headers.set("cookie", init.cookie)
  const response = await fetch(`${QINGLAN_ORIGIN}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    redirect: "manual",
  })
  const text = await response.text()
  let data: T
  if (!text) data = {} as T
  else {
    try {
      data = JSON.parse(text) as T
    } catch {
      data = { error: "青澜返回了无法阅读的内容。" } as T
    }
  }
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : []
  return { ok: response.ok, status: response.status, data, setCookies }
}

export function workHref(work: { id: string; kind: string }) {
  const section =
    work.kind === "comic" ? "comics" : work.kind === "video" ? "videos" : "novels"
  return `${QINGLAN_ORIGIN}/${section}/${work.id}`
}

export function kindLabel(kind: string) {
  if (kind === "comic") return "漫画"
  if (kind === "video") return "视频"
  return "小说"
}

export function purchaseIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (typeof item === "string") return item
      if (item && typeof item === "object" && "id" in item) {
        const id = (item as { id: unknown }).id
        return typeof id === "string" ? id : ""
      }
      return ""
    })
    .filter(Boolean)
}

export function paymentReady() {
  return Boolean(process.env.QINGLAN_PAYMENT_SECRET)
}

export async function notifyQinglanPaid(orderId: string, amount: number) {
  const secret = process.env.QINGLAN_PAYMENT_SECRET
  if (!secret) {
    return {
      ok: false,
      error: "硬币站还没配置支付密钥。兑换已取消，没有扣硬币。",
    }
  }
  const notified = await fetch(`${QINGLAN_ORIGIN}/api/payments/webhook`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-payment-secret": secret,
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      orderId,
      amount,
      status: "paid",
      event: "order.paid",
    }),
    cache: "no-store",
  })
  const text = await notified.text()
  let data: { error?: string } = {}
  if (text) {
    try {
      data = JSON.parse(text) as { error?: string }
    } catch {
      data = { error: "青澜没有确认这笔支付。" }
    }
  }
  if (!notified.ok) {
    return {
      ok: false,
      error: data.error || "青澜没有确认这笔支付。硬币没有扣除。",
    }
  }
  return { ok: true, error: "" }
}
