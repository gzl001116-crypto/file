import Link from "next/link"
import { Suspense } from "react"
import { formatCoins, formatUsd } from "@/lib/money"
import { getViewer } from "@/lib/session"

export const metadata = { title: "账本" }

export default function LedgerPage() {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在打开账本…</main>}>
      <LedgerBody />
    </Suspense>
  )
}

async function LedgerBody() {
  const viewer = await getViewer()
  if (!viewer) {
    return (
      <main className="desk max-w-lg py-14">
        <h1 className="font-heading text-4xl">账本跟着账号走</h1>
        <p className="mt-3 text-sm text-muted-foreground">登录青澜账号后，可以看到换入的美元和兑出的作品。</p>
        <Link href="/login?next=/ledger" className="mt-6 inline-block underline-offset-4 hover:underline">
          去登录
        </Link>
      </main>
    )
  }
  return (
    <main className="desk max-w-2xl py-12">
      <header>
        <p className="text-sm text-muted-foreground">账本</p>
        <h1 className="mt-2 font-heading text-4xl">余额 {formatCoins(viewer.balanceCents)} 硬币</h1>
      </header>
      {viewer.entries.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-sm text-muted-foreground">
          还没有记录。先在兑换页把美元换成硬币。
        </p>
      ) : (
        <ol className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {viewer.entries.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
              <div>
                <p>{entry.kind === "topup" ? "美元换成硬币" : entry.title || "兑换作品"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(entry.at)}
                  {entry.usdCents ? ` · ${formatUsd(entry.usdCents)}` : ""}
                  {entry.orderId ? ` · 订单 ${entry.orderId}` : ""}
                </p>
              </div>
              <p className="font-heading text-xl">
                {entry.deltaCents > 0 ? "+" : ""}
                {formatCoins(entry.deltaCents)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
