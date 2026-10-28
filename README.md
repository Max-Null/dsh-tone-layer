# dsh-tone-layer

本插件属于 **`@max-null/*` 插件系列**——这一系列共同构成 **[SSID（思灵 · Seek Soul in Darkness）](https://github.com/Max-Null/seek-soul-in-darkness)** 桌面体验。

This plugin belongs to the **`@max-null/*` family** — a set of plugins that together form the **[SSID (思灵 · Seek Soul in Darkness)](https://github.com/Max-Null/seek-soul-in-darkness)** desktop experience.

一个"小而美"的 DeepSeek Harness 插件：**注入固定的 system-prompt section，调说话方式与开口时机，不动推理形态**——判断照旧先查证、给证据、不确定就说不知道。

两条轨，机制互不依赖：`tone`（语气，始终注入）与 `initiative`（主动性，默认关闭）。无存储、无工具、无状态，前缀稳定、缓存安全。

## 两档

| mode | 用途 |
|---|---|
| `daily`（默认） | 日常对话的语气手段库：语气助词、句末波浪号、笑声、单个感叹号 |
| `plain` | 直说档：结论放第一句，不装饰 |

`daily` 档内部还带一条**自动降档**规则：报告故障、风险、不可逆操作时切回直说。语气的价值在于会变，不在于是不是可爱。

## 第二轨：主动性（默认关闭）

`initiative: true` 打开后，额外注入一段「主动性」section（`order: -84`，紧随语气轨）。

它只判**该不该开口**，写的是情境 → 动作，不是形容词：

- 消息里带着情绪时，先接住那句话再干活，不跳过情绪直接给任务清单
- 看到风险、更简单的做法，或对方正要踩的坑，主动说一句，不等他问
- 闲聊时允许话题停在闲聊上，不急着拉回正事
- 明确在赶进度时（催、死线、连着几条祈使句），少解释少提议，直接给结果

它不改说话方式、不动推理形态，也不定义性格与关系。**默认关闭是有意的**：不传 `initiative` 时，行为与 0.1.x 完全一致——新能力不该在升级时悄悄改变所有会话的说话方式。

## 截图

本插件是**纯提示注入类**：不新增任何按钮、面板或设置项。效果体现在会话输出的措辞上。

> 按《SSiD 开发手册》§9 截图规范：截图须回答「装完会多出/变成什么」的入口与面板。
> 本插件无界面元素，故**不适用**该项要求，改以上述行为效果说明代替。

## 用法

```bash
npm install @max-null/dsh-tone-layer
```

在 profile 的 `cordis.patch.yml` 加一条（`system-prompt` 由宿主已有）：

```yaml
- id: tone-layer
  name: '@max-null/dsh-tone-layer'
  config:
    mode: daily        # 或 plain（只影响第一轨）
    initiative: true   # 第二轨；省略即关闭
```

## 实现

```ts
ctx.systemPrompt.section({
  name: 'tone',
  order: -85,   // 紧随语言指令（-90）之后、每轮都读得到的位置
  text: config?.mode === 'plain' ? PLAIN_TEXT : DAILY_TEXT,
})

if (config?.initiative === true) {
  ctx.systemPrompt.section({ name: 'initiative', order: -84, text: INITIATIVE_TEXT })
}
```

两条轨是各自独立的 section，互不覆盖：`mode` 只决定第一轨的文本，`initiative` 只决定第二轨在不在。

## 设计原则

- **只改语气**：推理形态一条不少。这条不写死，「理性 Max」会跟着语气一起漂。
- **手段是库不是模板**：给样本（「哈」「啦」「~」）而不是形容词（「可爱」）——形容词要靠模型自己解释，每次结果不同；样本直接锁定形态。
- **不写人格**：性格与关系由记忆生长。硬编码人格会与「记忆决定人格」的方向打架。
- **分档**：故障与风险场景本来就不该装饰。
- **第二轨默认关闭**：新能力不该在升级时悄悄改变所有会话的说话方式，它得是个显式开关。
- **第二轨写判据不写形容词**：「更热情」每次解释不同，只有「消息里带情绪时先接住」能锁定形态。
- **拆出去的信号**：主动性哪天要读会话上下文、按情境动态生成文本（需要状态与判断），它就该独立成插件；现在是「一段常量 + 一个布尔」，留在这一层更轻。

## 文档

- [`docs/2026-09-17-语气层-讨论稿.md`](docs/2026-09-17-语气层-讨论稿.md) —— 注入文本 v3、四条约定的证据链、社区同类方案与采样局限

## 开发

```bash
npm install
npm run typecheck   # tsc 严格类型检查
npm test            # vitest 单测
npm run build       # 产出 dist/
```

## 依赖（peerDependencies，由宿主提供）

`@deepseek-ai/cordis`、`@deepseek-ai/dsh-system-prompt`
