import Link from "next/link"
import { Suspense } from "react"
import { formatCoins } from "@/lib/money"
import { usingShelf } from "@/lib/mode"
import { getViewer } from "@/lib/session"

export const metadata = { title: "兑换" }

export default function WalletPage() {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在打开钱包…</main>}>
      <WalletBody />
    </Suspense>
  )
}

async function WalletBody() {
  const viewer = await getViewer()
  const shelf = await usingShelf()
  if (!viewer) {
    return (
      <main className="desk max-w-lg py-14">
        <h1 className="font-heading text-4xl">{shelf ? "先登录" : "先登录青澜账号"}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {shelf
            ? "验证码会显示在登录页上。登录后可以查看余额并用已有硬币兑换作品。"
            : "硬币记在青澜账号上。用同一个邮箱登录之后，可以查看余额并兑换作品。"}
        </p>
        <Link href="/login?next=/wallet" className="mt-6 inline-block underline-offset-4 hover:underline">
          去登录
        </Link>
      </main>
    )
  }
  return (
    <main className="desk grid max-w-xl gap-8 py-12">
      <header>
        <p className="text-sm text-muted-foreground">{viewer.name}</p>
        <h1 className="mt-2 font-heading text-5xl">{formatCoins(viewer.balanceCents)}</h1>
        <p className="mt-2 text-sm text-muted-foreground">可用硬币余额</p>
      </header>
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-2xl">仅使用硬币</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          本站不提供美元充值或银行卡支付。硬币余额只会由授权的系统或管理员入账；兑换作品时，系统会在服务器核验余额后扣除硬币。
        </p>
      </section>
    </main>
  )
}
