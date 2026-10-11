import { randomUUID } from "crypto"
import { mkdirSync, readFileSync, writeFileSync } from "fs"
import path from "path"

export type LedgerEntry = {
  id: string
  at: number
  kind: "topup" | "redeem"
  deltaCents: number
  usdCents?: number
  workId?: string
  title?: string
  orderId?: string
  href?: string
}

export type Account = {
  userId: string
  email: string
  name: string
  balanceCents: number
  entries: LedgerEntry[]
}

export type SessionRecord = {
  id: string
  userId: string
  email: string
  name: string
  cookie: string
  createdAt: number
}

type Database = {
  sessions: Record<string, SessionRecord>
  accounts: Record<string, Account>
}

const file = path.join(process.cwd(), "data", "ledger.json")

function empty(): Database {
  return { sessions: {}, accounts: {} }
}

function read(): Database {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Database
    return {
      sessions: parsed.sessions ?? {},
      accounts: parsed.accounts ?? {},
    }
  } catch {
    return empty()
  }
}

function write(db: Database) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(db), "utf8")
}

let chain: Promise<unknown> = Promise.resolve()

export function updateStore<T>(fn: (db: Database) => T): Promise<T> {
  const run = chain.then(() => {
    const db = read()
    const result = fn(db)
    write(db)
    return result
  })
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export function readStore(): Database {
  return read()
}

export function newId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}
