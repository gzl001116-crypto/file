import { jsonError } from "@/lib/http"
import { usingShelf } from "@/lib/mode"
import { qinglan } from "@/lib/qinglan"
import { sendShelfCode } from "@/lib/session"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string
    purpose?: string
  } | null
  const email = body?.email?.trim() ?? ""
  const purpose = body?.purpose === "register" ? "register" : "login"
  if (!email.includes("@")) return jsonError("请填写有效的邮箱。", 400)
  if (await usingShelf()) {
    const previewCode = await sendShelfCode(email, purpose)
    return Response.json({ delivered: false, previewCode })
  }
  const result = await qinglan<{
    error?: string
    delivered?: boolean
    previewCode?: string
  }>("/api/auth/code", { method: "POST", body: { email, purpose } })
  if (!result.ok) return jsonError(result.data.error || "验证码没有发出去。", result.status)
  return Response.json({
    delivered: Boolean(result.data.delivered),
    previewCode: result.data.previewCode || "",
  })
}
