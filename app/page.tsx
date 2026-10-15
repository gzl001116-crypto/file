import Link from "next/link"
import { Suspense } from "react"
import { CoinMark } from "@/components/shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { describeWork, loadCatalog, paidWorks } from "@/lib/exchange"
import { formatCoins, formatYuan } from "@/lib/money"

export default function HomePage() {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在打开货架…</main>}>
      <HomeBody />
    </Suspense>
  )
}

async function HomeBody() {
  const catalog = await loadCatalog()
  const works = paidWorks(catalog.works).slice(0, 4)
  return (
    <main className="desk py-12 sm:py-16">
      <p className="text-sm tracking-[0.18em] text-muted-foreground">青澜的硬币柜</p>
      <div className="mt-4 grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <h1 className="max-w-xl font-heading text-5xl leading-tight sm:text-6xl">
            用硬币，兑换喜欢的作品。
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/80">
            {catalog.source === "shelf"
              ? "货架上有小说、漫画和一分钟短片。使用已有硬币兑换，成功后即可打开全文。"
              : "登录用的是青澜邮箱。使用已有硬币兑换青澜上正在标价出售的小说、漫画和视频。"}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/wallet" className={buttonVariants({ className: "h-10 px-4" })}>
              查看硬币余额
            </Link>
            <Link href="/shop" className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}>
              看货架
            </Link>
          </div>
        </div>
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-heading text-2xl">
              <CoinMark className="size-14 text-2xl" />
              兑换规则
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-relaxed">
            <p>
              <strong>只使用已有硬币</strong>
            </p>
            <p>兑换时会核对青澜当前标价，并从账户余额扣除相应硬币。</p>
            <p className="text-muted-foreground">免费作品留在青澜阅读，不会出现在这只货架上。</p>
          </CardContent>
        </Card>
      </div>
      <ol className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          ["01", "同一个账号", catalog.source === "shelf" ? "用邮箱注册。验证码显示在页面上，填进去就能登录。" : "注册和登录都走青澜的邮箱验证码。这边没有另一套密码。"],
          ["02", "使用硬币", "硬币由授权系统或管理员入账；本网站不提供美元充值。"],
          ["03", "兑换后阅读", catalog.source === "shelf" ? "扣掉硬币之后，正文就在这部作品的页面里。" : "货架直接读取青澜目录。兑换成功后，回青澜打开全文。"],
        ].map(([index, title, copy]) => (
          <li key={index} className="rounded-2xl border border-border bg-card/80 p-5">
            <p className="text-xs tracking-[0.16em] text-muted-foreground">{index}</p>
            <h2 className="mt-2 font-heading text-2xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{copy}</p>
          </li>
        ))}
      </ol>
      {works.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-heading text-3xl">货架</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {works.map((work) => {
              const item = describeWork(work, catalog.creators)
              return (
                <li key={work.id}>
                  <Link href={`/shop/${work.id}`} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 hover:border-primary/40">
                    <p className="text-xs tracking-[0.14em] text-muted-foreground">{item.kindLabel}</p>
                    <h3 className="mt-2 font-heading text-2xl">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.synopsis}</p>
                    <p className="mt-auto pt-4 text-sm">
                      {item.author} · {formatYuan(item.price)} · {formatCoins(item.price)} 硬币
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
