import Link from "next/link"

export default function NotFound() {
  return (
    <main className="desk max-w-lg py-20">
      <h1 className="font-heading text-4xl">这里没有这部作品</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        货架只放青澜正在标价出售的作品。免费或已经下架的内容不会出现。
      </p>
      <Link href="/shop" className="mt-6 inline-block underline-offset-4 hover:underline">
        回货架
      </Link>
    </main>
  )
}
