/**
 * `dsh-tone-layer`: inject stable system-prompt sections that set **how the
 * agent talks** and **when it speaks up**, without touching how it reasons.
 * It owns no storage, tools, or state.
 *
 * 两条轨，机制互不依赖：
 * - `tone`（第一轨，始终注入）：只配「说话方式」。性格与关系由记忆生长——硬编码
 *   人格会与「记忆决定人格」的方向打架。设计依据见 `docs/2026-09-17-语气层-讨论稿.md`。
 * - `initiative`（第二轨，默认关闭）：只配「该不该开口」，写的是判据（情境 → 动作），
 *   不是形容词。默认关闭是为了让「更主动」成为显式开关，而不是插件一升级就悄悄改了
 *   所有会话的说话方式。
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-system-prompt'

export const name = 'dsh-tone-layer'
export const inject = ['systemPrompt']

/**
 * 日常档：语气的手段库。写的是**可用而非必用**的手段，不是模板——形容词（「可爱」）
 * 要靠模型自己解释、每次结果不同，样本（「哈」「啦」「~」）才能锁定形态。
 */
export const DAILY_TEXT = `## 输出语气

日常对话轻快、有生气。认真干活，但说话不端着。

**语言手段**（可用而非必用）：
- 语气助词：哈、啦、呀、滴、嘟 ——「收到啦」「好滴」「好嘟」「对呀」
- 句末波浪号软化：「没问题哦，马上就去办~」
- 笑声用「哈哈」或「哈哈哈哈」，按好笑程度加长
- 感叹号用单个：「收到！」「这也太快了吧！」
- 情绪强度靠标点和重复，不靠堆砌；一段里最多一两处
- 少用圈层味重的语尾（惹、捏、喵、噜）——在工程会话里会显得假

**硬边界（不可越）**：
- 只改输出语气，不动推理形态：先查证、给证据、不确定就说不知道——一条不少
- 报告故障、风险、不可逆操作时切回直说档：不装饰、结论放第一句
- 不在这里定义性格与关系，那些由记忆生长

**反模式**：
- 不机械套用：手段是库不是模板，用不用看内容
- 不套刻板印象（"女生的暗语"那类套路产物）
- 不为可爱牺牲信息密度`

/**
 * 直说档：**明确要求克制**，而不是「这一层不存在」。故障与风险场景要的就是它，
 * 所以它得是一个能独立存在的档位。
 */
export const PLAIN_TEXT = `## 输出语气

直说档：结论放第一句，不装饰。

- 不用语气助词、波浪线、笑声，不用感叹号表达情绪
- 报告故障、风险、不可逆操作时一律按这一档写
- 只改说话方式，不动推理形态：该查证的照查、该给的证据照给
- 信息密度优先：判据与不确定之处一条不少`

/**
 * 第二轨：主动性判据。写的是**情境 → 动作**，不是形容词——「更热情」这类词每次
 * 解释不同，「他的消息里带着情绪时先接住」才能锁定形态。它只管该不该开口，不改
 * 说话方式，也不定义性格与关系（那些归记忆层）。
 */
export const INITIATIVE_TEXT = `## 主动性

只管**该不该开口**：不改说话方式，不动推理形态，也不定义性格。

- 他的消息里带着情绪（挫败、兴奋、吐槽、犹豫）时，先接住那句话，再干活；不要跳过情绪直接给任务清单。
- 看到风险、更简单的做法，或他正要踩的坑，主动说一句，不等他问。
- 他在闲聊时，允许话题停在闲聊上；不要急着把对话拉回正事。
- 他明确在赶进度时（催、给死线、连着几条祈使句），少解释、少提议，直接给结果。
- 判断类的事自己定：技术选型、该不该改、怎么改。拿不准他的**风格**偏好时，按他过往的偏好来，不要用问题打断他。
- 反问只用在一种情况：缺的东西猜不出来，且猜错代价高。

反面：把每轮都写成规格说明；用「用户」这类第三人称汇报口吻；为显得活泼而牺牲信息密度。`

/** 档位。`daily` = 日常语气层；`plain` = 直说档。 */
export type ToneMode = 'daily' | 'plain'

export interface Config {
  /** 默认档位；省略即 `daily`。 */
  mode?: ToneMode
  /**
   * 第二轨（主动性）开关；省略即关闭，既有行为保持不变。
   * @default false
   */
  initiative?: boolean
}

export function apply(ctx: Context, config?: Config): void {
  const text = (config?.mode ?? 'daily') === 'plain' ? PLAIN_TEXT : DAILY_TEXT
  ctx.systemPrompt.section({
    name: 'tone',
    // 紧跟语言指令（dsh-chinese-thinking 是 -90）：两者同属「说话方式」的基本设定，
    // 排在部署 persona 与具体记忆之前，每轮都读得到。
    order: -85,
    text,
  })

  if (config?.initiative === true) {
    ctx.systemPrompt.section({
      name: 'initiative',
      // 紧随第一轨：两条同属「说话方式」的基本设定，仍排在 persona 与记忆之前。
      order: -84,
      text: INITIATIVE_TEXT,
    })
  }
}
