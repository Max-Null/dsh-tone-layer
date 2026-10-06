# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与[语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2026-09-17

### Added

- 首个版本：往 system prompt 注入一个固定的「输出语气」section（`order: -85`，紧跟 `dsh-chinese-thinking` 的语言指令），只改说话方式、不动推理形态。
- 两档：`daily`（默认，语气手段库）与 `plain`（直说档），由 config 的 `mode` 选择。故障、风险、不可逆操作在日常档里也会切回直说——这条写进了注入文本本身。
- 这一层**不定义性格与关系**：硬编码人格会与「记忆决定人格」的方向打架。设计依据、四个约定与证据来源见 `docs/2026-09-17-语气层-讨论稿.md`。
