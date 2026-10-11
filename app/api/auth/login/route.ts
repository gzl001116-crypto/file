import { jsonError } from "@/lib/http"
import { usingShelf } from "@/lib/mode"
import { qinglan } from "@/lib/qinglan"
import { acceptShelfCode, openSession } from "@/lib/session"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string
    code?: string
  } | null
  const email = body?.email?.trim() ?? ""
  const code = body?.code?.trim() ?? ""
  if (!email.includes("@") || !/^\d{6}$/.test(code)) {
    return jsonError("请填写邮箱和 6 位验证码。", 400)
  }
  if (await usingShelf()) {
    const opened = await acceptShelfCode({ email, code, purpose: "login" })
    if (opened.error) return jsonError(opened.error, 400)
    return Response.json({ name: opened.name, email: opened.email })
  }
  const result = await qinglan<{ error?: string }>("/api/auth/login", {
    method: "POST",
    body: { email, code },
  })
  if (!result.ok) return jsonError(result.data.error || "没有登录成功。", result.status)
  const opened = await openSession({ email, name: "", setCookies: result.setCookies })
  if (opened.error) return jsonError(opened.error, 502)
  return Response.json({ name: opened.name, email: opened.email })
}
