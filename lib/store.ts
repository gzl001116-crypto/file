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

type LedgerKv = {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<unknown>
}

const file = path.join(process.cwd(), "data", "ledger.json")
const ledgerKey = "ledger"

function empty(): Database {
  return { sessions: {}, accounts: {} }
}

function normalize(parsed: Database): Database {
  return {
    sessions: parsed.sessions ?? {},
    accounts: parsed.accounts ?? {},
  }
}

function readFileDb(): Database {
  try {
    return normalize(JSON.parse(readFileSync(file, "utf8")) as Database)
  } catch {
    return empty()
  }
}

function writeFileDb(db: Database) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(db), "utf8")
}

async function ledgerKv(): Promise<LedgerKv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare")
    const { env } = await getCloudflareContext({ async: true })
    const kv = (env as { LEDGER?: LedgerKv }).LEDGER
    return kv ?? null
  } catch {
    return null
  }
}

async function load(): Promise<Database> {
  const kv = await ledgerKv()
  if (!kv) return readFileDb()
  const raw = await kv.get(ledgerKey)
  if (!raw) return empty()
  try {
    return normalize(JSON.parse(raw) as Database)
  } catch {
    return empty()
  }
}

async function save(db: Database) {
  const kv = await ledgerKv()
  if (kv) {
    await kv.put(ledgerKey, JSON.stringify(db))
    return
  }
  writeFileDb(db)
}

let chain: Promise<unknown> = Promise.resolve()

export function updateStore<T>(fn: (db: Database) => T): Promise<T> {
  const run = chain.then(async () => {
    const db = await load()
    const result = fn(db)
    await save(db)
    return result
  })
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export function readStore(): Promise<Database> {
  return load()
}

export function newId(prefix: string) {
  return `${prefix}_${randomUUID()}`
}
