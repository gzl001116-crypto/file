import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { AuthForm } from "@/components/auth-form"
import { getViewer } from "@/lib/session"

export const metadata = { title: "注册" }

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在打开注册…</main>}>
      <RegisterBody searchParams={searchParams} />
    </Suspense>
  )
}

async function RegisterBody({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const viewer = await getViewer()
  const next = safeNext((await searchParams).next)
  if (viewer) redirect(next)
  return (
    <main className="desk grid max-w-md gap-6 py-14">
      <header>
        <p className="text-sm text-muted-foreground">注册</p>
        <h1 className="mt-2 font-heading text-4xl">用青澜邮箱加入</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          昵称、邮箱和验证码都交给青澜。注册完成后，这个账号可以在两边使用。
        </p>
      </header>
      <AuthForm mode="register" next={next} />
      <p className="text-sm text-muted-foreground">
        已经有账号？ <Link className="underline-offset-4 hover:underline" href={`/login?next=${encodeURIComponent(next)}`}>去登录</Link>
      </p>
    </main>
  )
}

function safeNext(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/wallet"
  return value
}
