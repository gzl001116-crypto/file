# 澜币

青澜的硬币柜。1 美元等于 1 硬币，登录用的是 [青澜](https://rapid-antimony-bxix9kp.vercel.app/) 的同一个邮箱账号。硬币只能兑换青澜正在标价出售的小说、漫画和视频。

青澜作品的价格以「分」计，页面上写成元。100 分 = 1.00 元 = 1.00 硬币 = 1.00 美元。

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

## 美元入账

这一台没有接银行卡。在兑换页确认金额后，按 1 美元 = 1 硬币记入账本。单笔 1.00 到 500.00 美元。账本写在 `data/ledger.json`，其中包含登录凭证，已从 git 忽略。部署到无持久磁盘的环境时，余额会在实例重启后清空。
