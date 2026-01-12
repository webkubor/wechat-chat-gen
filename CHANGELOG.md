## [1.1.3] - 2026-01-12\n\n### Fixed\n- **逻辑丢失修复**: 恢复了 ConfigFooter 中的随机文案逻辑。\n- **UI 重复修复**: 移除 GeneratorView 中的硬编码页脚，回归组件化。\n\n### Improved\n- **移动端可见度**: 增加底部内边距，确保 Build 版本号在各种屏幕下清晰可见。\n
## [1.1.2] - 2026-01-12\n\n### Added\n- **智能主题联动**: 状态栏配色与聊天预览主题全自动同步。\n\n### Fixed\n- **深色模式视觉**: 修复系统提示消息背景及姓名颜色在深色下不可见的问题。\n- **TS 编译错误**: 修复了 App.vue 和 GeneratorView.vue 中的类型检查及死代码警告。\n
## [1.1.1] - 2026-01-12\n\n### Fixed\n- **版本弹窗死循环**: 通过注销 Service Worker 和 URL 时间戳强制破甲刷新解决。\n- **移动端 UI 优化**: 引入玻璃拟态 FAB，实现预览 100% 全屏填充，重构底部抽屉圆角。\n- **手势冲突**: 禁用全局双击缩放，提升移动端操作流畅度。\n
## [1.1.0] - 2026-01-12

### Added
- **移动端全屏预览**: 针对真机优化，自动隐藏设备外壳装饰。
- **底部抽屉编辑器**: 在移动端通过浮动按钮唤起 85vh 高度的配置抽屉。
- **AI 技能管理员**: 在 AI_Common 中同步建立全套 AI 扩展协议。

### Improved
- 优化了 PWA Master 技能的工作流逻辑。
- 增强了 juejin-writer 的 SVG 逻辑图生成能力。

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