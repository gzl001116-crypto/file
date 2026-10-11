import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function onCloudflare() {
  return process.env.WORKERS_CI === "1" || process.env.WORKERS_CI === "true" || process.env.CF_PAGES === "1"
}

// OpenNext 会再执行一次 `npm run build`。内层只跑 next build，避免套娃。
if (process.env.LANBI_OPENNEXT_INNER === "1" || !onCloudflare()) {
  run("npx", ["next", "build"])
  process.exit(0)
}

console.log("Cloudflare Workers 构建：编译 OpenNext，供接下来的 wrangler deploy 使用。")

for (const script of ["esbuild/install.js", "workerd/install.js"]) {
  const file = new URL(`../node_modules/${script}`, import.meta.url)
  if (!existsSync(file)) continue
  const installed = spawnSync(process.execPath, [file.pathname], { stdio: "inherit" })
  if (installed.status !== 0) console.warn(`${script} 没有装上，继续构建。`)
}

const kv = spawnSync(process.execPath, ["scripts/ensure-kv.mjs"], { stdio: "inherit" })
if (kv.status !== 0) {
  const configPath = new URL("../wrangler.jsonc", import.meta.url)
  const config = readFileSync(configPath, "utf8")
  if (config.includes("REPLACE_WITH_KV_ID")) {
    writeFileSync(configPath, config.replace(/,?\s*"kv_namespaces"\s*:\s*\[[\s\S]*?\]/, ""))
    console.warn("这次没有创建 KV，已去掉无效的 LEDGER 绑定。硬币记在浏览器里。")
  }
}

process.env.LANBI_OPENNEXT_INNER = "1"
run("npx", ["opennextjs-cloudflare", "build"])
