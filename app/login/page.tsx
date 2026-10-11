import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { AuthForm } from "@/components/auth-form"
import { usingShelf } from "@/lib/mode"
import { getViewer } from "@/lib/session"

export const metadata = { title: "登录" }

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在打开登录…</main>}>
      <LoginBody searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginBody({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const viewer = await getViewer()
  const shelf = await usingShelf()
  const next = safeNext((await searchParams).next)
  if (viewer) redirect(next)
  return (
    <main className="desk grid max-w-md gap-6 py-14">
      <header>
        <p className="text-sm text-muted-foreground">登录</p>
        <h1 className="mt-2 font-heading text-4xl">{shelf ? "用邮箱回来" : "用青澜邮箱回来"}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {shelf
            ? "点获取验证码，6 位数字会显示在这页上。填进去就能登录。验证码 10 分钟内有效。"
            : "先获取 6 位验证码，再填进来。验证码 10 分钟内有效。这个账号在青澜那边同样能登录。"}
        </p>
      </header>
      <AuthForm mode="login" next={next} />
      <p className="text-sm text-muted-foreground">
        还没有账号？ <Link className="underline-offset-4 hover:underline" href={`/register?next=${encodeURIComponent(next)}`}>去注册</Link>
      </p>
    </main>
  )
}

function safeNext(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/wallet"
  return value
}
