/**
 * `dsh-tone-layer`: inject one stable system-prompt section that sets **how the
 * agent talks**, without touching how it reasons. It owns no storage, tools, or
 * state — one section, chosen from a fixed set by config.
 *
 * 语气与人格分开：这一层只配「说话方式」，性格与关系由记忆生长——硬编码人格会与
 * 「记忆决定人格」的方向打架。设计依据见 `docs/2026-09-17-语气层-讨论稿.md`。
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

/** 档位。`daily` = 日常语气层；`plain` = 直说档。 */
export type ToneMode = 'daily' | 'plain'

export interface Config {
  /** 默认档位；省略即 `daily`。 */
  mode?: ToneMode
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
}
