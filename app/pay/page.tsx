import Link from "next/link"
import { Suspense } from "react"
import { PayForm } from "@/components/pay-form"
import { formatCoins, formatYuan } from "@/lib/money"
import { getViewer } from "@/lib/session"
import { readStore } from "@/lib/store"
import { qinglan, type QinglanOrder } from "@/lib/qinglan"

export const metadata = { title: "支付" }

export default function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; order?: string }>
}) {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在打开订单…</main>}>
      <PayBody searchParams={searchParams} />
    </Suspense>
  )
}

async function PayBody({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; order?: string }>
}) {
  const query = await searchParams
  const orderId = (query.orderId || query.order || "").trim()
  const viewer = await getViewer()
  return (
    <main className="desk grid max-w-xl gap-6 py-12">
      <header>
        <p className="text-sm text-muted-foreground">支付站</p>
        <h1 className="mt-2 font-heading text-4xl">用硬币付青澜的订单</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          青澜把待支付订单送到这里。金额按标价的分数换成硬币，1 硬币等于 1 美元。订单必须对得上青澜货架上的付费作品。
        </p>
      </header>
      {!orderId ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/70 p-6 text-sm leading-relaxed">
          从青澜点「前往支付站」之后会带上订单号。也可以在货架里直接兑换，不必先在青澜下单。
        </p>
      ) : !viewer ? (
        <Link href={`/login?next=${encodeURIComponent(`/pay?orderId=${orderId}`)}`} className="underline-offset-4 hover:underline">
          登录后支付这笔订单
        </Link>
      ) : (
        <OrderCard orderId={orderId} cookieSessionId={viewer.sessionId} balance={viewer.balanceCents} />
      )}
    </main>
  )
}

async function OrderCard({
  orderId,
  cookieSessionId,
  balance,
}: {
  orderId: string
  cookieSessionId: string
  balance: number
}) {
  const cookie = readStore().sessions[cookieSessionId]?.cookie ?? ""
  const loaded = await qinglan<{
    error?: string
    title?: string
    order?: QinglanOrder
  }>(`/api/orders/${encodeURIComponent(orderId)}`, { cookie })
  if (!loaded.ok || !loaded.data.order) {
    return <p className="text-sm">{loaded.data.error || "没有找到这笔订单。"}</p>
  }
  const order = loaded.data.order
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-heading text-2xl">{loaded.data.title || "青澜作品"}</h2>
      <p className="text-sm">订单号 {order.id}</p>
      <p className="text-sm">金额 {formatYuan(order.amount)} · {formatCoins(order.amount)} 硬币</p>
      <p className="text-sm">状态 {order.status} · 余额 {formatCoins(balance)} 硬币</p>
      {order.status === "待支付" ? (
        <PayForm orderId={order.id} label={`支付 ${formatCoins(order.amount)} 硬币`} />
      ) : (
        <p className="text-sm">{order.status === "已支付" ? "付款已经确认，可以回青澜看全文。" : "这笔订单现在不能再用硬币支付。"}</p>
      )}
    </section>
  )
}
