import { closeSession } from "@/lib/session"

export async function POST() {
  await closeSession()
  return Response.json({ ok: true })
}
