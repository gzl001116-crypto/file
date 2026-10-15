import { jsonError } from "@/lib/http"

export async function POST() {
  return jsonError("美元入账已关闭。硬币只能由授权的系统或管理员入账。", 410)
}
