import { jsonError } from "@/lib/http"
import { parseUsdToCents } from "@/lib/money"
import { topUp } from "@/lib/exchange"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { usd?: string } | null
  const cents = parseUsdToCents(body?.usd ?? "")
  if (cents == null) return jsonError("美元金额从 1.00 到 500.00，最多两位小数。", 400)
  const result = await topUp(cents)
  if (!result.ok) return jsonError(result.error, 400)
  return Response.json({ balanceCents: result.balanceCents, coinsCents: cents })
}
