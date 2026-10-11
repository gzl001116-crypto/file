import assert from "node:assert/strict"
import test from "node:test"
import { formatCoins, parseUsdToCents, redeemDecision } from "../lib/money.ts"

test("1 dollar is 1 coin, and 100 fen is 1 coin", () => {
  assert.equal(parseUsdToCents("1"), 100)
  assert.equal(parseUsdToCents("1.5"), 150)
  assert.equal(parseUsdToCents("12.34"), 1234)
  assert.equal(parseUsdToCents("0.50"), null)
  assert.equal(parseUsdToCents("501"), null)
  assert.equal(formatCoins(100), "1.00")
  assert.equal(formatCoins(-250), "-2.50")
})

test("only a priced Qinglan work can be redeemed", () => {
  assert.equal(
    redeemDecision({
      work: null,
      balanceCents: 500,
      owned: false,
      paymentReady: true,
    }).ok,
    false,
  )
  const free = redeemDecision({
    work: { id: "a", price: 0 },
    balanceCents: 500,
    owned: false,
    paymentReady: true,
  })
  assert.equal(free.ok, false)
  const ready = redeemDecision({
    work: { id: "a", price: 250 },
    balanceCents: 250,
    owned: false,
    paymentReady: true,
  })
  assert.deepEqual(ready, { ok: true, costCents: 250 })
  const short = redeemDecision({
    work: { id: "a", price: 250 },
    balanceCents: 100,
    owned: false,
    paymentReady: true,
  })
  assert.equal(short.ok, false)
})
