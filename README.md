# 澜币

青澜的硬币柜。登录用的是 [青澜](https://rapid-antimony-bxix9kp.vercel.app/) 的同一个邮箱账号。只使用已有硬币兑换青澜正在标价出售的小说、漫画和视频；本站不提供美元充值或银行卡支付。

青澜作品的价格以「分」计，页面上写成元。100 分 = 1.00 元 = 1.00 硬币。

## 本地运行

```bash
npm install
npm run dev
```

开发服务器在 [http://127.0.0.1:47231](http://127.0.0.1:47231)。

```bash
npm test
npm run lint
```

## 账号

注册和登录都转发到青澜的邮箱验证码。验证码由青澜发送。这边保存的是青澜发回的登录凭证，用来代你下单，不会另建一套密码。

## 兑换

货架读取青澜的 `/api/catalog`，只列出价格大于 0 的作品。兑换时用当前账号在青澜创建订单，再通知青澜的 `/api/payments/webhook`。通知成功之后才扣硬币。

把和青澜相同的支付密钥写进环境变量：

```bash
QINGLAN_PAYMENT_SECRET=和青澜一致的密钥
QINGLAN_ORIGIN=https://rapid-antimony-bxix9kp.vercel.app
```

通知使用请求头 `x-payment-secret` 和 `Authorization: Bearer`。青澜若还没配置支付密钥，会返回「支付密钥还没配置」，这次兑换会取消，硬币不会扣除。

从青澜跳到支付站时，把地址指到本站的 `/pay?orderId=订单号`。订单金额必须对得上青澜货架里的标价。

## 发布到 Cloudflare

项目用 OpenNext 部署到 Cloudflare Workers。Workers Builds 的构建命令用 `npm run build`，部署命令用 `npx wrangler deploy`。在 Cloudflare 上，`npm run build` 会先编译 OpenNext，再把结果交给 `wrangler deploy`。只跑 `next build` 时，部署会报找不到 OpenNext 配置。

能创建 KV 时，账本存在名为 `lanbi-ledger` 的 KV 里。创建不了时，这次部署会去掉无效的 KV 绑定，硬币改记在浏览器里。

在已经登录 Cloudflare 的电脑上：

```bash
npx wrangler login
npm run deploy
```

远程环境访问不到本机 `localhost:8976` 回调时，改用设备码：

```bash
npx wrangler login --browser false --device
```

也可以不登录，改用 API 令牌。令牌需要账号的 Workers 脚本编辑权限和 Workers KV 存储编辑权限。

```bash
export CLOUDFLARE_API_TOKEN=你的令牌
export CLOUDFLARE_ACCOUNT_ID=你的账号ID
npm run deploy
```

`npm run deploy` 会创建 KV（如果还没有），再构建并发布。Workers Builds 里的项目名是 `file`，线上地址是账号子域名下的 `file.<账号>.workers.dev`。

支付密钥不要写进仓库。发布后执行：

```bash
npx wrangler secret put QINGLAN_PAYMENT_SECRET
```

## 硬币入账

美元充值已关闭，`/api/topup` 会拒绝入账请求，防止用户自行增加余额。硬币必须由授权的系统或管理员入账。兑换操作仍需先验证余额，再通知青澜确认订单，成功后才扣除硬币。账本存储方式见上文。
