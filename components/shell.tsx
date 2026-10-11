import Link from "next/link"
import { QINGLAN_ORIGIN, paymentReady } from "@/lib/qinglan"
import { formatCoins } from "@/lib/money"
import { getViewer } from "@/lib/session"
import { LogoutButton } from "@/components/logout-button"
import { cn } from "cn"

export function CoinMark({ className, children = "澜" }: { className?: string; children?: string }) {
  return (
    <span className={cn("coin-mark size-10 text-lg", className)} aria-hidden>
      {children}
    </span>
  )
}

export function HeaderFallback() {
  return (
    <header className="border-b border-border/80 bg-card/70">
      <div className="desk flex h-16 items-center gap-3">
        <CoinMark />
        <span className="font-heading text-lg">澜币</span>
      </div>
    </header>
  )
}

export async function SiteHeader() {
  const viewer = await getViewer()
  const ready = paymentReady()
  return (
    <header className="border-b border-border/80 bg-card/80 backdrop-blur">
      {!ready ? (
        <p className="bg-accent px-4 py-2 text-center text-sm text-accent-foreground">
          青澜的支付密钥还没配好。登录、换硬币、看货架都可以。兑换会在通知青澜时停住，硬币不会被扣。
        </p>
      ) : null}
      <div className="desk flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <Link href="/" className="flex items-center gap-2.5" aria-label="澜币首页">
          <CoinMark />
          <span className="leading-tight">
            <strong className="block font-heading text-lg">澜币</strong>
            <small className="text-[11px] tracking-[0.18em] text-muted-foreground">LANBI</small>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm" aria-label="主导航">
          <NavLink href="/wallet">兑换</NavLink>
          <NavLink href="/shop">货架</NavLink>
          <NavLink href="/ledger">账本</NavLink>
          <NavLink href="/pay">支付</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {viewer ? (
            <>
              <Link href="/wallet" className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium">
                {formatCoins(viewer.balanceCents)} 硬币
              </Link>
              <span className="hidden text-sm text-muted-foreground sm:inline">{viewer.name}</span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="rounded-lg px-3 py-2 text-foreground/80 hover:bg-accent hover:text-foreground">
      {children}
    </Link>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/80">
      <div className="desk flex flex-col gap-2 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>澜币和青澜共用邮箱账号。1 美元记 1 硬币，只兑换青澜标价出售的作品。</p>
        <a className="underline-offset-4 hover:underline" href={QINGLAN_ORIGIN}>
          打开青澜
        </a>
      </div>
    </footer>
  )
}
