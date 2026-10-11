import Link from "next/link"
import { CoinMark } from "@/components/shell"
import { QINGLAN_ORIGIN } from "@/lib/qinglan"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="desk py-12 sm:py-16">
      <p className="text-sm tracking-[0.18em] text-muted-foreground">青澜的硬币柜</p>
      <div className="mt-4 grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <h1 className="max-w-xl font-heading text-5xl leading-tight sm:text-6xl">
            一美元，一枚硬币。
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/80">
            登录用的是青澜邮箱。硬币按 1 比 1 从美元记入，只能拿去兑换
            <a className="mx-1 underline-offset-4 hover:underline" href={QINGLAN_ORIGIN}>
              青澜
            </a>
            上正在标价出售的小说、漫画和视频。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/wallet" className={buttonVariants({ className: "h-10 px-4" })}>
              把美元换成硬币
            </Link>
            <Link href="/shop" className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}>
              看青澜货架
            </Link>
          </div>
        </div>
        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-heading text-2xl">
              <CoinMark className="size-14 text-2xl" />
              汇率
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-relaxed">
            <p>
              <strong>1.00 美元 = 1.00 硬币</strong>
            </p>
            <p>青澜标价以分为单位。100 分写成 1.00 元，在这里兑换 1.00 硬币。</p>
            <p className="text-muted-foreground">免费作品留在青澜阅读，不会出现在这只货架上。</p>
          </CardContent>
        </Card>
      </div>
      <ol className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          ["01", "同一个账号", "注册和登录都走青澜的邮箱验证码。这边没有另一套密码。"],
          ["02", "美元入账", "填写美元金额，按同样的数字记成硬币。单笔 1 到 500 美元。"],
          ["03", "只换青澜", "货架直接读取青澜目录。兑换成功后，回青澜打开全文。"],
        ].map(([index, title, copy]) => (
          <li key={index} className="rounded-2xl border border-border bg-card/80 p-5">
            <p className="text-xs tracking-[0.16em] text-muted-foreground">{index}</p>
            <h2 className="mt-2 font-heading text-2xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{copy}</p>
          </li>
        ))}
      </ol>
    </main>
  )
}
