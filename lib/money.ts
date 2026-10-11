/** 青澜标价单位是分。100 分 = 1.00 元 = 1.00 硬币 = 1.00 美元。 */
export const FEN_PER_COIN = 100
export const MIN_TOPUP_CENTS = 100
export const MAX_TOPUP_CENTS = 50_000
export const MAX_WORK_FEN = 10_000_000

export function formatCoins(cents: number): string {
  const sign = cents < 0 ? "-" : ""
  return `${sign}${(Math.abs(cents) / 100).toFixed(2)}`
}

export function formatYuan(fen: number): string {
  return `${(Math.max(0, Math.round(fen)) / 100).toFixed(2)} 元`
}

export function formatUsd(cents: number): string {
  const sign = cents < 0 ? "-" : ""
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`
}

export function parseUsdToCents(input: string): number | null {
  const trimmed = input.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const [whole, fraction = ""] = trimmed.split(".")
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"))
  if (!Number.isInteger(cents)) return null
  if (cents < MIN_TOPUP_CENTS || cents > MAX_TOPUP_CENTS) return null
  return cents
}

export type PricedWork = { id: string; price: number }

export function redeemDecision(input: {
  work: PricedWork | null
  balanceCents: number
  owned: boolean
  paymentReady: boolean
}): { ok: true; costCents: number } | { ok: false; error: string } {
  if (!input.work) return { ok: false, error: "这部作品不在青澜货架上。" }
  const price = input.work.price
  if (!Number.isInteger(price) || price <= 0) {
    return { ok: false, error: "这部作品没有标价，不能用硬币兑换。" }
  }
  if (price > MAX_WORK_FEN) {
    return { ok: false, error: "标价超出青澜允许的范围。" }
  }
  if (input.owned) {
    return { ok: false, error: "这个青澜账号已经买过，可以回去接着看。" }
  }
  if (!input.paymentReady) {
    return {
      ok: false,
      error:
        "支付密钥还没在硬币站和青澜两边配成同一个值。兑换已取消，没有扣硬币。",
    }
  }
  if (input.balanceCents < price) {
    return { ok: false, error: "硬币不够。先把美元换成硬币。" }
  }
  return { ok: true, costCents: price }
}
