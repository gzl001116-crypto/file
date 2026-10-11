import { payOrder } from "@/lib/exchange"
import { jsonError } from "@/lib/http"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { orderId?: string } | null
  const orderId = body?.orderId?.trim() ?? ""
  const result = await payOrder(orderId)
  if (!result.ok) return jsonError(result.error, 400)
  return Response.json(result)
}
