import { readFileSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"

const configPath = new URL("../wrangler.jsonc", import.meta.url)
const title = "lanbi-ledger"

function wrangler(args) {
  const result = spawnSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`
  if (result.status !== 0) {
    const error = new Error(output.trim() || `wrangler ${args.join(" ")} failed`)
    error.status = result.status
    throw error
  }
  return result.stdout ?? ""
}

function readConfig() {
  return readFileSync(configPath, "utf8")
}

let id = ""
try {
  const listed = wrangler(["kv", "namespace", "list"])
  const namespaces = JSON.parse(listed)
  const existing = namespaces.find((item) => item.title === title)
  id = existing?.id ?? ""
} catch (error) {
  console.error(error.message)
  process.exit(error.status || 1)
}

if (!id) {
  const created = wrangler(["kv", "namespace", "create", title])
  const match = created.match(/id = "([a-f0-9]+)"/)
  if (!match) {
    console.error(created)
    console.error("没有从 wrangler 输出里读到 KV id。")
    process.exit(1)
  }
  id = match[1]
  console.log(`已创建 KV ${title} ${id}`)
} else {
  console.log(`沿用 KV ${title} ${id}`)
}

const config = readConfig()
if (!config.includes("REPLACE_WITH_KV_ID") && config.includes(id)) {
  process.exit(0)
}
if (!config.includes("REPLACE_WITH_KV_ID") && !config.includes(id)) {
  console.error("wrangler.jsonc 里没有 REPLACE_WITH_KV_ID，也没有当前 KV id。")
  process.exit(1)
}
writeFileSync(configPath, config.replace("REPLACE_WITH_KV_ID", id))
console.log("已写入 wrangler.jsonc")
