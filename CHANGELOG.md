# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-01-12

### Added
- **云端同步**: 接入腾讯云开发 (CloudBase)，支持语料库多端同步。
- **持久化**: 聊天会话现在自动保存至 IndexedDB，防止刷新丢失。
- **双模架构**: 语料库支持“本地私享”与“云端同步”自由切换。
- **UI 优化**: 自定义 `BaseSelect` 组件，移动端采用 Bottom Sheet 交互。
- **模型驱动**: 建立统一的数据库 Schema 模型层 (`src/types/database.ts`)。
- **视觉重构**: 引入全新极简几何风格 Logo (`logo.svg`)。

### Fixed
- **导出白屏**: 弃用 `html2canvas`，迁移至 `html-to-image` 方案。
- **资源管理**: 抽离所有系统预设（昵称、头像、文案）至 `src/config/presets.ts`。
- **交互细节**: 系统消息支持富文本渲染（如“撤销”按钮）并拦截粘贴富文本。

## [1.0.0] - 2026-01-12

### Added
- 新增全局 Toast 提示系统，优化交互体验。
- 重构导出功能，使用 html-to-image 解决白屏问题。
- 新增快捷导出 PNG 和批量 ZIP 下载功能。