import { cache } from "react"
import { headers } from "next/headers"
import { QINGLAN_ORIGIN, qinglan } from "@/lib/qinglan"

function originHost() {
  try {
    return new URL(QINGLAN_ORIGIN).host.toLowerCase()
  } catch {
    return ""
  }
}

export function hostIsQinglan(hostHeader: string | null) {
  const host = (hostHeader || "").split(",")[0].trim().toLowerCase()
  const target = originHost()
  return Boolean(host && target && host === target)
}

export const usingShelf = cache(async function usingShelf() {
  const headerList = await headers()
  if (hostIsQinglan(headerList.get("x-forwarded-host") || headerList.get("host"))) return true
  const result = await qinglan<{ works?: unknown }>("/api/catalog")
  return !(result.ok && Array.isArray(result.data.works))
})
