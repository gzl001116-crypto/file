import type { QinglanCreator, QinglanWork } from "@/lib/qinglan"

export type ShelfPanel = { caption: string; line: string }
export type ShelfShot = { time: string; picture: string; sound: string }
export type ShelfChapter = {
  title: string
  paragraphs: string[]
  panels?: ShelfPanel[]
  shots?: ShelfShot[]
}

export type ShelfStory = {
  work: QinglanWork
  chapters: ShelfChapter[]
}

const lin: QinglanCreator = { id: "lin-wan", name: "林晚" }
const he: QinglanCreator = { id: "a-he", name: "阿禾" }
const nan: QinglanCreator = { id: "nan-feng", name: "南风" }

export const shelfCreators: QinglanCreator[] = [lin, he, nan]

const stories: ShelfStory[] = [
  {
    work: {
      id: "shelf-tide",
      kind: "novel",
      title: "潮声码头",
      synopsis: "退潮以后，码头只剩一根缆绳和一封没有地址的信。林晚把信读完，决定在下一班船来之前把话说清楚。",
      price: 200,
      creatorId: lin.id,
      status: "连载两章",
      unitCount: 2,
    },
    chapters: [
      {
        title: "退潮",
        paragraphs: [
          "码头的灯比海面先灭。林晚把自行车靠在木桩上，听见缆绳一下一下敲着桩子，像有人在很远处扣门。",
          "信压在她的车筐里，信封被潮气浸软了。没有寄件人，只有一行铅笔字：涨潮前，把灯留在第三根桩。",
          "她认识这支铅笔。去年冬天，阿禾在船上用它记潮汐，字迹总是往右下角滑。",
        ],
      },
      {
        title: "第三根桩",
        paragraphs: [
          "第三根桩上原来挂着一盏煤油灯，现在只剩铁钩。林晚把随身的手电倒挂上去，光照进水里，鱼鳞似的碎了一地。",
          "阿禾是坐最后一班驳船回来的。他跳上码头时鞋是干的，说明他在船上等了很久，等潮水自己退开。",
          "“信不是让你还灯。”他说，“是让你决定还要不要留在这儿。”林晚把信折好，放回他的上衣口袋。“灯先留着。下一班船的时刻，你自己说。”",
        ],
      },
    ],
  },
  {
    work: {
      id: "shelf-lamp",
      kind: "novel",
      title: "纸上的灯",
      synopsis: "旧书店的阁楼只在雨天营业。一本没有封面的册子里，每读完一页，对面楼就会多亮一扇窗。",
      price: 680,
      creatorId: nan.id,
      status: "完结",
      unitCount: 2,
    },
    chapters: [
      {
        title: "雨天营业",
        paragraphs: [
          "南风把“雨天营业”的牌子挂出去时，雨还停在云里。客人却已经到了：一个抱着空相框的中学生，说自己的窗是黑的。",
          "阁楼的册子没有封面，第一页只画着一盏灯。南风让她从第二页读起。她读出声的时候，对面楼的二层真的亮了。",
        ],
      },
      {
        title: "最后一页",
        paragraphs: [
          "册子的最后一页是空白。中学生问还能不能再亮一扇。南风说空白不是没写完，是留给还没点亮的人自己写。",
          "她把相框放在窗台上。雨终于落下来，玻璃上的灯影被拉长，像一句还没寄出的话。南风关灯之前，在空白页的角落画了很小的一笔。",
        ],
      },
    ],
  },
  {
    work: {
      id: "shelf-cat",
      kind: "comic",
      title: "巷口那只猫",
      synopsis: "四格漫画。一只不肯进门的猫，和每天给它留鱼的人，把一条巷子走成了固定的路线。",
      price: 350,
      creatorId: he.id,
      status: "四格",
      unitCount: 1,
    },
    chapters: [
      {
        title: "巷口",
        paragraphs: [],
        panels: [
          { caption: "第一格", line: "黄昏。巷口的砖墙上晒着一件灰衬衫。猫坐在影子里，只露出一根尾巴。" },
          { caption: "第二格", line: "阿禾蹲下来，把鱼放在离猫三步远的地方。他不看猫，猫也不看他。" },
          { caption: "第三格", line: "夜深了。鱼骨被排成一条直线，从墙根指向阿禾家那扇没关严的门。" },
          { caption: "第四格", line: "早晨。衬衫还在墙上。猫已经在门槛里面，背对着人，好像这条巷子是它先来的。" },
        ],
      },
    ],
  },
  {
    work: {
      id: "shelf-night",
      kind: "video",
      title: "夜航一分钟",
      synopsis: "一分钟的夜航短片。船灯、雾和一句没有说完的广播，按镜头顺序放完。",
      price: 1200,
      creatorId: lin.id,
      status: "一分钟",
      unitCount: 1,
    },
    chapters: [
      {
        title: "夜航",
        paragraphs: ["从船头灯亮起开始，到广播被雾切断为止。一共四镜。"],
        shots: [
          { time: "0:00", picture: "黑画面里先出现一盏暖黄的船头灯，光晕慢慢变大。", sound: "水贴着船舷，很轻。" },
          { time: "0:15", picture: "雾从画面左边走进来，灯变成一粒将要灭掉的火星。", sound: "远处有第二艘船的汽笛，只响半声。" },
          { time: "0:35", picture: "甲板的广播喇叭结着水珠。字幕：下一站，第三根桩。", sound: "电流声盖过说话的人。" },
          { time: "0:50", picture: "灯重新稳住。雾退到画面外，只留下被照亮的缆绳。", sound: "广播停了。有人在画外轻轻答应了一声。" },
        ],
      },
    ],
  },
]

export const shelfWorks: QinglanWork[] = stories.map((story) => story.work)

export function shelfStory(id: string) {
  return stories.find((story) => story.work.id === id) ?? null
}

export function isShelfId(id: string) {
  return id.startsWith("shelf-")
}
