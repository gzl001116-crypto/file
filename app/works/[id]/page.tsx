import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { RedeemButton } from "@/components/redeem-button"
import { Badge } from "@/components/ui/badge"
import { describeWork, loadCatalog } from "@/lib/exchange"
import { formatCoins, formatYuan } from "@/lib/money"
import { kindLabel } from "@/lib/qinglan"
import { getViewer } from "@/lib/session"
import { shelfStory } from "@/lib/shelf"

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="desk py-16 text-sm text-muted-foreground">正在打开作品…</main>}>
      <Reader params={params} />
    </Suspense>
  )
}

async function Reader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = shelfStory(id)
  if (!story) notFound()
  const [catalog, viewer] = await Promise.all([loadCatalog(), getViewer()])
  const work = catalog.works.find((item) => item.id === id) ?? story.work
  const item = describeWork(work, catalog.creators)
  const owned = viewer?.purchases.includes(id) ?? false
  const preview = story.chapters[0]?.paragraphs[0] || story.chapters[0]?.panels?.[0]?.line || ""
  return (
    <main className="desk grid max-w-3xl gap-8 py-12">
      <p className="text-sm">
        <Link href={`/shop/${id}`} className="text-muted-foreground underline-offset-4 hover:underline">
          返回这部作品
        </Link>
      </p>
      <header>
        <Badge variant="secondary">{kindLabel(work.kind)}</Badge>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">{work.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{item.author}</p>
      </header>
      {owned ? (
        story.chapters.map((chapter) => (
          <article key={chapter.title} className="grid gap-4">
            <h2 className="font-heading text-3xl">{chapter.title}</h2>
            {chapter.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-8">
                {paragraph}
              </p>
            ))}
            {chapter.panels?.map((panel) => (
              <figure key={panel.caption} className="rounded-2xl border border-border bg-card p-5">
                <figcaption className="text-xs tracking-[0.14em] text-muted-foreground">{panel.caption}</figcaption>
                <p className="mt-3 text-lg leading-8">{panel.line}</p>
              </figure>
            ))}
            {chapter.shots ? (
              <ol className="grid gap-3">
                {chapter.shots.map((shot) => (
                  <li key={shot.time} className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-xs tracking-[0.14em] text-muted-foreground">{shot.time}</p>
                    <p className="mt-2 font-heading text-2xl leading-snug">{shot.picture}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{shot.sound}</p>
                  </li>
                ))}
              </ol>
            ) : null}
          </article>
        ))
      ) : (
        <section className="grid gap-4 rounded-2xl border border-dashed border-border bg-card/80 p-6">
          <p className="text-lg leading-8">{preview}</p>
          <p className="text-sm text-muted-foreground">
            后面的章节要用 {formatCoins(work.price)} 硬币兑换。标价 {formatYuan(work.price)}。
          </p>
          {!viewer ? (
            <Link href={`/login?next=/works/${id}`} className="text-sm underline-offset-4 hover:underline">
              登录后兑换
            </Link>
          ) : (viewer.balanceCents < work.price) ? (
            <Link href="/wallet" className="text-sm underline-offset-4 hover:underline">
              余额不够，去把美元换成硬币
            </Link>
          ) : (
            <RedeemButton workId={id} label={`用 ${formatCoins(work.price)} 硬币兑换并阅读`} />
          )}
        </section>
      )}
    </main>
  )
}
