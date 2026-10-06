# dsh-tone-layer

本插件属于 **`@max-null/*` 插件系列**——这一系列共同构成 **[SSID（思灵 · Seek Soul in Darkness）](https://github.com/Max-Null/seek-soul-in-darkness)** 桌面体验。

This plugin belongs to the **`@max-null/*` family** — a set of plugins that together form the **[SSID (思灵 · Seek Soul in Darkness)](https://github.com/Max-Null/seek-soul-in-darkness)** desktop experience.

一个"小而美"的 DeepSeek Harness 插件，只做一件事：**注入一段固定的 system-prompt section，调整说话方式，不动推理形态**——判断照旧先查证、给证据、不确定就说不知道。

无存储、无工具、无状态。一段固定文本，前缀稳定、缓存安全。

## 两档

| mode | 用途 |
|---|---|
| `daily`（默认） | 日常对话的语气手段库：语气助词、句末波浪号、笑声、单个感叹号 |
| `plain` | 直说档：结论放第一句，不装饰 |

`daily` 档内部还带一条**自动降档**规则：报告故障、风险、不可逆操作时切回直说。语气的价值在于会变，不在于是不是可爱。

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
    mode: daily        # 或 plain
```

## 实现

```ts
ctx.systemPrompt.section({
  name: 'tone',
  order: -85,   // 紧随语言指令（-90）之后、每轮都读得到的位置
  text: config?.mode === 'plain' ? PLAIN_TEXT : DAILY_TEXT,
})
```

## 设计原则

- **只改语气**：推理形态一条不少。这条不写死，「理性 Max」会跟着语气一起漂。
- **手段是库不是模板**：给样本（「哈」「啦」「~」）而不是形容词（「可爱」）——形容词要靠模型自己解释，每次结果不同；样本直接锁定形态。
- **不写人格**：性格与关系由记忆生长。硬编码人格会与「记忆决定人格」的方向打架。
- **分档**：故障与风险场景本来就不该装饰。

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
