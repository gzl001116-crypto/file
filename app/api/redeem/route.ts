import { redeemWork } from "@/lib/exchange"
import { jsonError } from "@/lib/http"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { workId?: string } | null
  const workId = body?.workId?.trim() ?? ""
  if (!workId || workId.length > 120) return jsonError("没有指定青澜作品。", 400)
  const result = await redeemWork(workId)
  if (!result.ok) return jsonError(result.error, 400)
  return Response.json(result)
}
