# RunBuddy 项目规范化改造说明（2026-05-09）

## 目标
在不改变项目内容与功能逻辑的前提下，完成命名语义化、结构统一化、代码风格整理和历史冗余归档。

## 1. 页面命名语义化（HTML）
将原先不规范或难理解的页面名统一为按功能命名的文件名，核心映射如下：
- `shouye.html` -> `home.html`
- `running.html` -> `run-tracker.html`
- `running_watch.html` -> `run-tracker-watch.html`
- `settling.html` -> `run-summary.html`
- `share.html` -> `run-share.html`
- `report_preview.html` -> `run-report-preview.html`
- `customize.html` -> `character-customization.html`
- `fashion shop.html` -> `academy-shop.html`
- `iphone17-31.html` -> `wardrobe-overview.html`
- `iphone17-35-1.html` -> `outfit-cart.html`
- `iphone17-36.html` -> `running-guidance.html`
- `iphone17-37.html` -> `community-post-editor.html`
- `iphone17-58.html` -> `academy-outfit-preview.html`
- `iphone17-59.html` -> `jacket-red-shop.html`
- `iphone17-60.html` -> `jacket-red-preview.html`
- `iphone17-62.html` -> `run-history.html`
- `iphone17-8.html` -> `community-feed.html`
- `iphone17-search.html` -> `community-search.html`
- `post-detail.html` -> `community-post-detail.html`
- `item-detail.html` -> `jacket-blue-detail.html`
- `jacket.html` -> `jacket-shop.html`
- `pants.html` -> `pants-shop.html`
- `page-bg.html` -> `cap-shop.html`

## 2. 页面资源目录统一（CSS/JS）
将页面级样式和脚本统一收敛到：
- `frontend/css/pages/`
- `frontend/js/pages/`

核心迁移包括：
- `frontend/css/home.css` -> `frontend/css/pages/home.css`
- `frontend/css/run-tracker.css` -> `frontend/css/pages/run-tracker.css`
- `frontend/css/run-tracker-watch.css` -> `frontend/css/pages/run-tracker-watch.css`
- `frontend/css/run-summary.css` -> `frontend/css/pages/run-summary.css`
- `frontend/css/run-report-preview.css` -> `frontend/css/pages/run-report-preview.css`
- `frontend/js/home.js` -> `frontend/js/pages/home.js`
- `frontend/js/run-tracker.js` -> `frontend/js/pages/run-tracker.js`
- `frontend/js/run-report-exporter.js` -> `frontend/js/pages/run-report-exporter.js`

同时新增首页引导页资源（原 `index.html` 内联抽离）：
- `frontend/css/pages/onboarding.css`
- `frontend/js/pages/onboarding.js`

## 3. 内联代码抽离与结构统一
对 `frontend/*.html` 页面进行了统一处理：
- 抽离内联 `<style>` 到对应 `css/pages/<page>.css`
- 抽离内联 `<script>` 到对应 `js/pages/<page>.js`
- 更新所有 `href` / `src` / `location.href` 引用到新命名路径

入口页 `index.html` 同步规范化：
- 内联 CSS/JS 抽离为 `onboarding.css` 与 `onboarding.js`
- 移除内联 `onclick`，改为脚本事件绑定（功能不变）
- 跳转目标统一为 `frontend/home.html`

## 4. 代码质量与风格整理
主要整理项：
- 清理多处乱码注释与损坏字符串（HTML/CSS/JS）
- 修复少量受损标记片段（如 `run-history` 记录项结构）
- 移除页面脚本中的调试输出和冗余日志链路
- 保持命名风格一致（kebab-case 页面文件名，page-level 资源同名）

## 5. 历史文件与冗余资源归档
新增归档目录并迁移历史文件，减少主目录噪音：
- `frontend/archive/legacy-backups/`（`.bak` 等历史备份）
- `frontend/archive/legacy-assets/images copy/`（旧资源目录整体迁移）

## 6. 文档同步
已更新：
- `README.md` 的 Project Structure，改为当前真实目录结构（含 `css/pages`、`js/pages`）
- `ai_logs/README.md` 中部分脚本命名描述，和当前文件名保持一致

## 7. 功能不变性说明
本次改造不引入业务逻辑变更，主要是结构/命名/风格层面统一：
- `storage.js` 数据结构和存取逻辑保持不变
- 跑步、结算、分享、社区、装扮等页面功能保持原有行为
- 所有本地资源引用已做路径一致性检查

## 8. 验证建议
建议验证以下主流程：
- `index.html` -> `home.html` -> `run-tracker.html` -> `run-summary.html` -> `run-share.html`
- 首页 -> 社区列表 -> 帖子详情/发帖
- 首页 -> 装扮总览 -> 商品页 -> 购物车
- 首页 -> 跑步历史 -> 月度签到
