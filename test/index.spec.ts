import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt, { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import * as plugin from '../src/index.ts'

async function assemble(config?: { mode?: 'daily' | 'plain' }) {
  const ctx = new Context()
  await ctx.plugin(SystemPrompt)
  const fiber = await ctx.plugin(plugin, config)
  return { ctx, fiber, assembly: await ctx.systemPrompt.assemble() }
}

const sectionOf = (assembly: { sections: readonly { name: string, text: string }[] }) =>
  assembly.sections.find(entry => entry.name === 'tone')

describe('dsh-tone-layer plugin', () => {
  it('默认注入日常档，含手段库与硬边界', async () => {
    const { assembly } = await assemble()
    const section = sectionOf(assembly)
    expect(section?.text).toBe(plugin.DAILY_TEXT)
    expect(renderPrompt(assembly)).toContain('语气助词')
    expect(renderPrompt(assembly)).toContain('切回直说档')
  })

  it('mode: plain 换成直说档', async () => {
    const { assembly } = await assemble({ mode: 'plain' })
    const section = sectionOf(assembly)
    expect(section?.text).toBe(plugin.PLAIN_TEXT)
    expect(section?.text).not.toBe(plugin.DAILY_TEXT)
    expect(section?.text).toContain('结论放第一句')
  })

  // 这一层只配说话方式。两档都必须写明「不动推理形态」——否则「理性 Max」会跟着语气一起漂；
  // 也都不得定义性格与关系，那是记忆生长的结果（见 docs/2026-09-17-语气层-讨论稿.md §二）。
  it('两档都守住同一条边界：不动推理形态', async () => {
    for (const text of [plugin.DAILY_TEXT, plugin.PLAIN_TEXT]) {
      expect(text).toContain('推理形态')
      expect(text).not.toMatch(/你是|你的性格|你的人格/)
    }
  })

  it('dispose 后 section 随之移除', async () => {
    const { ctx, fiber } = await assemble()
    await fiber.dispose()
    const after = await ctx.systemPrompt.assemble()
    expect(sectionOf(after)).toBeUndefined()
  })
})
