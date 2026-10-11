import { cache } from "react"
import { redeemDecision } from "@/lib/money"
import {
  kindLabel,
  notifyQinglanPaid,
  paymentReady,
  purchaseIds,
  qinglan,
  workHref,
  type QinglanOrder,
  type QinglanWork,
} from "@/lib/qinglan"
import { getViewer } from "@/lib/session"
import { newId, readStore, updateStore } from "@/lib/store"

type Catalog = {
  works: QinglanWork[]
  creators: { id: string; name?: string }[]
  error?: string
}

export const loadCatalog = cache(async function loadCatalog(): Promise<Catalog> {
  const result = await qinglan<{
    works?: QinglanWork[]
    creators?: { id: string; name?: string }[]
    error?: string
  }>("/api/catalog")
  if (!result.ok) {
    return {
      works: [],
      creators: [],
      error: result.data.error || "青澜货架暂时打不开。",
    }
  }
  const works = (result.data.works ?? []).filter(
    (work) => work && typeof work.id === "string" && typeof work.title === "string",
  )
  return { works, creators: result.data.creators ?? [] }
})

export function paidWorks(works: QinglanWork[]) {
  return works
    .filter((work) => Number.isInteger(work.price) && work.price > 0)
    .sort((a, b) => a.price - b.price || a.title.localeCompare(b.title, "zh"))
}

function creatorName(creators: { id: string; name?: string }[], id?: string) {
  if (!id) return "青澜作者"
  return creators.find((creator) => creator.id === id)?.name || "青澜作者"
}

export function describeWork(work: QinglanWork, creators: { id: string; name?: string }[]) {
  return {
    ...work,
    author: creatorName(creators, work.creatorId),
    kindLabel: kindLabel(work.kind),
    href: workHref(work),
  }
}

async function sessionCookie() {
  const viewer = await getViewer()
  if (!viewer) return { viewer: null, cookie: "" }
  const session = readStore().sessions[viewer.sessionId]
  return { viewer, cookie: session?.cookie ?? "" }
}

export async function redeemWork(workId: string) {
  const { viewer, cookie } = await sessionCookie()
  if (!viewer || !cookie) return { ok: false as const, error: "先用青澜账号登录。" }
  const catalog = await loadCatalog()
  if (catalog.error) return { ok: false as const, error: catalog.error }
  const work = catalog.works.find((item) => item.id === workId) ?? null
  const decision = redeemDecision({
    work,
    balanceCents: viewer.balanceCents,
    owned: viewer.purchases.includes(workId),
    paymentReady: paymentReady(),
  })
  if (!decision.ok) return { ok: false as const, error: decision.error }
  if (!work) return { ok: false as const, error: "这部作品不在青澜货架上。" }

  const created = await qinglan<{
    error?: string
    purchased?: boolean
    order?: QinglanOrder
    payUrl?: string | null
  }>("/api/orders", { method: "POST", cookie, body: { workId } })
  if (!created.ok || !created.data.order?.id) {
    return { ok: false as const, error: created.data.error || "青澜没有生成订单。" }
  }
  if (created.data.purchased || created.data.order.status === "已支付") {
    return { ok: false as const, error: "这个青澜账号已经买过，可以回去接着看。" }
  }
  if (created.data.order.amount !== work.price) {
    return { ok: false as const, error: "青澜订单金额和标价不一致，没有扣硬币。" }
  }
  const notified = await notifyQinglanPaid(created.data.order.id, created.data.order.amount)
  if (!notified.ok) return { ok: false as const, error: notified.error }

  const href = workHref(work)
  const charged = await charge(viewer.userId, decision.costCents, {
    workId: work.id,
    title: work.title,
    orderId: created.data.order.id,
    href,
  })
  if (!charged) return { ok: false as const, error: "硬币不够。先把美元换成硬币。" }
  return {
    ok: true as const,
    href,
    title: work.title,
    orderId: created.data.order.id,
  }
}

export async function payOrder(orderId: string) {
  const { viewer, cookie } = await sessionCookie()
  if (!viewer || !cookie) return { ok: false as const, error: "先用青澜账号登录。" }
  if (!/^[A-Za-z0-9_-]{4,80}$/.test(orderId)) {
    return { ok: false as const, error: "订单号不对。" }
  }
  const loaded = await qinglan<{
    error?: string
    title?: string
    payUrl?: string | null
    order?: QinglanOrder
  }>(`/api/orders/${orderId}`, { cookie })
  if (!loaded.ok || !loaded.data.order) {
    return { ok: false as const, error: loaded.data.error || "没有找到这笔青澜订单。" }
  }
  const order = loaded.data.order
  if (order.status === "已支付") {
    return { ok: false as const, error: "这笔订单已经付过了。" }
  }
  if (order.status === "已退款") {
    return { ok: false as const, error: "这笔订单已退款，不能再用硬币付。" }
  }
  const catalog = await loadCatalog()
  if (catalog.error) return { ok: false as const, error: catalog.error }
  const work = matchOrderWork(catalog.works, order, loaded.data.title)
  const fresh = await qinglan<{ purchases?: unknown }>("/api/auth/session", { cookie })
  const owned = purchaseIds(fresh.data.purchases).includes(work?.id ?? "")
  const decision = redeemDecision({
    work,
    balanceCents: viewer.balanceCents,
    owned,
    paymentReady: paymentReady(),
  })
  if (!decision.ok) return { ok: false as const, error: decision.error }
  if (!work) return { ok: false as const, error: "这部作品不在青澜货架上。" }
  if (order.amount !== work.price) {
    return { ok: false as const, error: "订单金额和青澜标价不一致，没有扣硬币。" }
  }
  const notified = await notifyQinglanPaid(order.id, order.amount)
  if (!notified.ok) return { ok: false as const, error: notified.error }
  const href = workHref(work)
  const charged = await charge(viewer.userId, decision.costCents, {
    workId: work.id,
    title: work.title,
    orderId: order.id,
    href,
  })
  if (!charged) return { ok: false as const, error: "硬币不够。先把美元换成硬币。" }
  return { ok: true as const, href, title: work.title, orderId: order.id }
}

function matchOrderWork(works: QinglanWork[], order: QinglanOrder, title?: string) {
  if (order.workId) {
    return works.find((work) => work.id === order.workId) ?? null
  }
  const titled = works.filter((work) => work.title === title && work.price === order.amount)
  if (titled.length === 1) return titled[0]
  const priced = works.filter((work) => work.price === order.amount && work.price > 0)
  if (!title && priced.length === 1) return priced[0]
  return null
}

export async function topUp(usdCents: number) {
  const viewer = await getViewer()
  if (!viewer) return { ok: false as const, error: "先用青澜账号登录。" }
  const balanceCents = await updateStore((db) => {
    const account = db.accounts[viewer.userId]
    if (!account) return null
    account.balanceCents += usdCents
    account.entries.unshift({
      id: newId("led"),
      at: Date.now(),
      kind: "topup",
      deltaCents: usdCents,
      usdCents,
    })
    return account.balanceCents
  })
  if (balanceCents == null) return { ok: false as const, error: "账号不在账本里。" }
  return { ok: true as const, balanceCents }
}

async function charge(
  userId: string,
  costCents: number,
  meta: { workId: string; title: string; orderId: string; href: string },
) {
  return updateStore((db) => {
    const account = db.accounts[userId]
    if (!account || account.balanceCents < costCents) return false
    if (account.entries.some((entry) => entry.orderId === meta.orderId)) return true
    account.balanceCents -= costCents
    account.entries.unshift({
      id: newId("led"),
      at: Date.now(),
      kind: "redeem",
      deltaCents: -costCents,
      workId: meta.workId,
      title: meta.title,
      orderId: meta.orderId,
      href: meta.href,
    })
    return true
  })
}
