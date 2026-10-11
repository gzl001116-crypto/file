import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { RedeemButton } from "@/components/redeem-button"
import { Badge } from "@/components/ui/badge"
import { describeWork, loadCatalog } from "@/lib/exchange"
import { formatCoins, formatUsd, formatYuan } from "@/lib/money"
import { getViewer } from "@/lib/session"

export default function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在打开这部作品…</main>}>
      <WorkBody params={params} />
    </Suspense>
  )
}

async function WorkBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [catalog, viewer] = await Promise.all([loadCatalog(), getViewer()])
  const work = catalog.works.find((item) => item.id === id)
  if (!work || !Number.isInteger(work.price) || work.price <= 0) notFound()
  const item = describeWork(work, catalog.creators)
  const owned = viewer?.purchases.includes(work.id) ?? false
  const short = (viewer?.balanceCents ?? 0) < work.price
  return (
    <main className="desk grid max-w-3xl gap-8 py-12">
      <p className="text-sm">
        <Link href="/shop" className="text-muted-foreground underline-offset-4 hover:underline">
          返回货架
        </Link>
      </p>
      <header>
        <Badge variant="secondary">{item.kindLabel}</Badge>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">{item.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {item.author}
          {item.status ? ` · ${item.status}` : ""}
        </p>
      </header>
      <p className="text-lg leading-relaxed">{item.synopsis || "这部作品在青澜没有简介。"}</p>
      <div className="grid gap-2 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
        <Price label="青澜标价" value={formatYuan(item.price)} />
        <Price label="硬币" value={formatCoins(item.price)} />
        <Price label="折合美元" value={formatUsd(item.price)} />
      </div>
      {owned ? (
        <p>这个青澜账号已经买过，可以回去接着看。</p>
      ) : !viewer ? (
        <Link href={`/login?next=/shop/${work.id}`} className="text-sm underline-offset-4 hover:underline">
          登录后用硬币兑换
        </Link>
      ) : short ? (
        <div className="grid gap-3">
          <p className="text-sm">余额 {formatCoins(viewer.balanceCents)} 硬币，还差 {formatCoins(work.price - viewer.balanceCents)}。</p>
          <Link href="/wallet" className="text-sm underline-offset-4 hover:underline">
            去把美元换成硬币
          </Link>
        </div>
      ) : (
        <RedeemButton workId={work.id} label={`用 ${formatCoins(work.price)} 硬币兑换`} />
      )}
      <a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href={item.href}>
        在青澜查看
      </a>
    </main>
  )
}

function Price({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="block text-xs text-muted-foreground">{label}</span>
      <strong className="font-heading text-2xl">{value}</strong>
    </p>
  )
}
