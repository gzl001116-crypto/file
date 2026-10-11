import Link from "next/link"
import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { describeWork, loadCatalog, paidWorks } from "@/lib/exchange"
import { formatCoins, formatYuan } from "@/lib/money"
import { getViewer } from "@/lib/session"

export const metadata = { title: "货架" }

export default function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在读取青澜货架…</main>}>
      <ShopBody searchParams={searchParams} />
    </Suspense>
  )
}

async function ShopBody({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const kind = (await searchParams).kind
  const [catalog, viewer] = await Promise.all([loadCatalog(), getViewer()])
  const works = paidWorks(catalog.works).filter((work) => !kind || work.kind === kind)
  return (
    <main className="desk py-12">
      <header className="max-w-2xl">
        <p className="text-sm text-muted-foreground">货架</p>
        <h1 className="mt-2 font-heading text-4xl">
          {catalog.source === "shelf" ? "正在卖的作品" : "只卖青澜的作品"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {catalog.source === "shelf"
            ? "小说、漫画和短片都在这只货架上。100 分等于 1 硬币，也等于 1 美元。兑换之后在这里打开全文。"
            : "目录来自青澜当前公开的作品。标价 0 分的不在这里。100 分等于 1 硬币，也等于 1 美元。"}
        </p>
      </header>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {[
          ["", "全部"],
          ["novel", "小说"],
          ["comic", "漫画"],
          ["video", "视频"],
        ].map(([id, label]) => (
          <Link
            key={label}
            href={id ? `/shop?kind=${id}` : "/shop"}
            className={`rounded-full px-3 py-1.5 ${kind === id || (!kind && !id) ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      {catalog.error ? (
        <p className="mt-10 rounded-xl border border-destructive/30 bg-card p-6 text-sm">{catalog.error}</p>
      ) : works.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/70 p-10">
          <h2 className="font-heading text-3xl">青澜还没有标价作品</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            创作者在青澜把价格写成大于 0 的整数分之后，作品会出现在这只货架上。免费作品继续留在青澜。
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => {
            const item = describeWork(work, catalog.creators)
            const owned = viewer?.purchases.includes(work.id)
            return (
              <li key={work.id}>
                <Link href={`/shop/${work.id}`} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 hover:border-primary/40">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{item.kindLabel}</Badge>
                    {owned ? <span className="text-xs text-muted-foreground">已拥有</span> : null}
                  </div>
                  <h2 className="mt-4 font-heading text-2xl leading-snug">{item.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {item.synopsis || "青澜没有写简介。"}
                  </p>
                  <p className="mt-auto pt-5 text-sm">
                    {item.author} · {formatYuan(item.price)} · {formatCoins(item.price)} 硬币
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
