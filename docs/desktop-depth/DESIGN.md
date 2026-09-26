# DeepSeek Harness Desktop · Depth 设计方案（交接版）

> **2026-09-26 用户修订（优先于下文旧方案）**：开屏使用白色背景；取消顶部 Command Dock，模型、模式、Context 和 Token 等控制集中在输入框附近；移除 `/` 空菜单里的重复模型按钮；左下角仅保留头像与可用余额；去掉主页中间重复的“探索未至之境”。第 5 节玄色开屏与第 7 节顶部 Dock 方案已被本修订替代，不得恢复。

> 本文件是交给执行模型（DeepSeek / Kimi / Qwen 等）的**唯一设计依据**。
> 执行模型只负责“按图施工”，不负责重新设计。凡本文件写明的数值、行为、层级，一律照做；
> 本文件没写到的地方，按第 2 节“默认规则”处理；与官方功能冲突时，**保留官方**。

---

## 0. 执行模型必读（先读完再动手）

### 0.1 你的角色
- 你是施工方，不是设计师。不要“顺手美化”、不要加渐变/发光/卡片/大圆角来“显得高级”。
- 每次只做一个阶段（见第 12 节），做完跑检查、截图、停下汇报。
- 遇到本文件与官方代码冲突：保留官方行为，在汇报里写明冲突点，不要偷偷改。

### 0.2 仓库与技术栈
- 仓库：`D:\Desktop\claude\deepseek-harness`，当前分支 `desktop/depth`（已有未提交改动，**不要 reset / checkout 丢弃**）。
- pnpm + TypeScript + React 18 + Vite + vitest + oxlint；桌面壳 Electron（`apps/desktop`）。
- 客户端规则见 `packages/client/AGENTS.md`，**必须遵守**，重点：
  - 样式只用 CSS Modules，颜色只能用 `--dsw-*` / `--dsh-*` token，**组件 CSS 里禁止写字面量颜色**（唯一例外：`packages/client/web/src/boot-page.module.css`，启动页不能依赖主题加载，已有字面量兜底）。
  - 所有可见文字走 locale（中英两份），改完跑 `pnpm run verify-client-ui-i18n`。
  - 每个文件 100% 覆盖率；`/* v8 ignore */` 必须写原因。
  - 注释用英文；菜单用 `MenuSurface`；组件不直接拿 ctx；UI 插件只导出 apply/inject。
- 检查阶梯（每阶段结束必须跑）：
  1. `pnpm exec vitest run <改动的包路径>`
  2. `pnpm run test:gui`
  3. 涉及可见输出：`DSH_SNAPSHOT=replay pnpm run test:web`
  4. `pnpm run lint`、typecheck
  5. `pnpm run dev:desktop` 实际启动看效果
- 已知与本项目无关的 Windows 环境失败（不用修）：`present-open`（EPERM symlink）、`license-bundle`（npm_execpath）；dev 日志里的 `No handler registered for 'dsh-desktop:mandatory-status'` 是官方代码的 dev 噪音。

### 0.3 安全红线
- **禁止**读取或打开 `C:\Users\26713\.dsh\.credentials.yaml` 及任何含密钥文件。
- 不新增任何“DeepSeek 账号密码”输入框；API Key 只走官方已有的凭据存储。
- 不提交任何凭据；删除重要文件、推送远程、发布前必须问用户。
- dev 桌面版使用隔离目录 `apps/desktop/.desktop-build/development/`，不要动用户真实配置。

---

## 1. 当前进度（截至 2026-09-25）

| 模块 | 状态 | 位置 |
|---|---|---|
| Depth 动效 token、Animation Full/Reduced/Off、Interface Sounds 开关 | ✅ 已完成 | `packages/client/ui-theme/src/styles/depth.css`、`MotionSettings.tsx` |
| 启动签名逐笔书写 + 沉入空页深度标记（FLIP） | ✅ 旧版手写字已完成，**需换成“玄色”新版**（第 5 节） | `packages/client/web/src/{signature.ts,boot-page.ts,boot-page.module.css}` |
| 空会话深度标记 depth mark | ✅ | `ui-conversation/src/client/skeleton/{EmptyHero.tsx,HeroShell.module.css}` |
| Context 深浅指示器 | ✅ 初版，需接入 Dock（第 7 节） | `ui-conversation/src/client/skeleton/ContextMeter.*` |
| Sidebar 选中线、行样式 | ✅ | `ui-workspace/src/client/rows/Rows.module.css`、`ui-sidebar` |
| 账号区余额 | ✅ 初版 | `ui-settings-account/src/client/AccountMenu.*` |
| 模型滚筒 | ❌ 旧版体验差已删除，**需重做**（第 6 节） | `packages/client/ui-model-selection` |
| Command Dock | ❌ 旧版与会话头信息重复已删除，**需重做**（第 7 节） | 新建或放在 `ui-layout` |
| 桌面功能（快捷提问、通知角标、Ctrl+K、拖放、用量、Git 面板） | ❌ 待做（第 9、10 节） | `apps/desktop` + 相关 ui 包 |
| GitHub 发布、宣传视频 | ❌ 待做（第 13 节） | — |

启动动画的独立预览（已获用户认可）：`D:\Desktop\claude\logo-preview\index.html`，用浏览器打开即可看，按 R 重播，URL 加 `#t3000` 可冻结在 3000ms。

---

## 2. 设计原则与默认规则

1. **去色依然成立**：把所有颜色去掉只剩黑白灰，界面仍有层级、有辨识度。层级靠字号、字重、对比度、间距、位置，不靠颜色和装饰。
2. **Depth（深度）是抽象语言，不是海洋主题**：重要的浮到前面（更亮、更清晰、更大），次要的沉到后面（更暗、更小、略模糊）。不画鱼、潜艇、声呐、波浪。唯一例外是官方鲸鱼 logo，只出现在启动动画。
3. **安静优先**：默认只显示必需信息；高级信息靠 hover / click / focus 渐进展开。
4. **玻璃只给浮层**：Command Dock、模型滚筒、popover、命令面板、快捷提问窗、模态框可用玻璃；聊天正文、历史列表、代码块、长文本一律实色面。同屏最多 1–2 层 `backdrop-filter`。
5. **默认规则（用户明确要求）**：本文件没有专门设计的常规界面（设置页、菜单、列表、输入框、消息气泡、空状态、对话框等），**参考 ChatGPT Desktop 与 Claude / Claude Code 桌面端的成熟交互模式**：极简、低干扰、信息可读性高；但不抄它们的品牌视觉（不用它们的 logo、品牌色、专属插画、字体），全部用本文件的 Depth token 表达。
6. **核心交互不得替换**：启动动画、Command Dock、模型滚筒、Context 深浅，这四个必须按本文件实现，不能换成“普通下拉框/普通进度条”。
7. **不造假数据**：拿不到真实数据时显示占位（`—`）并留好数据接口，绝不写死演示数字。

---

## 3. 颜色系统

### 3.1 两套色：应用色（中性）与品牌时刻色（玄）
- **应用内**：黑/白/灰 + 极少量临时强调色。深色版优先。
- **玄（xuan）**：带一丝红紫的近黑色，**只**用于启动动画与 logo 时刻、宣传视频、README 头图。应用主界面不使用玄色背景（避免整体发紫）。
- **虹彩（iridescent）**：只用于启动动画里的鲸鱼描边和 DeepSeek 字迹。应用内任何地方不使用虹彩渐变。

### 3.2 玄色板（启动页、视频专用，可写字面量）

| Token | 值 | 用途 |
|---|---|---|
| `--xuan-core` | `#251a24` | 背景径向渐变中心 |
| `--xuan` | `#150f16` | 背景主色 |
| `--xuan-edge` | `#0a070b` | 背景边缘暗角 |
| `--xuan-floor` | `#0d090e` | 地平线以下（视频用） |
| `--xuan-ink` | `#e9e1ef` | HARNESS 小字，opacity 0.5 |

启动背景：`radial-gradient(ellipse 70% 60% at 50% 40%, #251a24 0%, #150f16 48%, #0a070b 100%)`。

虹彩描边渐变（鲸鱼 `irisWhale`，userSpaceOnUse，沿对角线）：
`#ffffff 0 → #9fb4ff .18 → #f3eaff .36 → #ffb99a .52 → #c3a6ff .68 → #8fd8ff .84 → #ffffff 1`

虹彩字迹渐变（`irisText`，水平 0→620）：
`#e9e4f2 0 → #b8c6ff .2 → #ffffff .4 → #f6c2ab .58 → #cdb8ff .78 → #eef3ff 1`

鲸鱼玻璃体（`glassBody`，径向，偏左上受光）：`#2c2030 0 → #130d15 .55 → #060407 1`。

### 3.3 应用中性色（新增到 `ui-theme/src/styles/depth.css`，以 `--dsh-*` 命名）

> 优先复用已有 `--dsw-alias-*` token；只有缺的才新增 `--dsh-*`。下面数值是**深色版目标值**，新增 token 时深浅两套都要写。深色背景不要纯 `#000`，带极轻冷感。

| 语义 | 深色 | 浅色 | 说明 |
|---|---|---|---|
| 底层背景 `bg-base` | `#0f1012` | `#ffffff` | 窗口底色 |
| 侧栏背景 `bg-sidebar` | `#131416` | `#f7f7f8` | 比底色高一级 |
| 抬升面 `bg-raised` | `#18191c` | `#ffffff` | 输入框、代码块外框 |
| 悬停 `bg-hover` | `rgb(255 255 255 / 5%)` | `rgb(0 0 0 / 4%)` | 行 hover |
| 按下/选中 `bg-active` | `rgb(255 255 255 / 8%)` | `rgb(0 0 0 / 7%)` | 按下 |
| 一级文字 `label-primary` | `#ececef` | `#0f1115` | 正文、标题 |
| 二级文字 `label-secondary` | `#a4a7ad` | `#5d6168` | 辅助说明 |
| 三级文字 `label-tertiary` | `#6f737a` | `#8a8e95` | 时间戳、占位 |
| 分隔线 `border-l1` | `rgb(255 255 255 / 7%)` | `rgb(0 0 0 / 7%)` | 细分隔 |
| 描边 `border-l2` | `rgb(255 255 255 / 12%)` | `rgb(0 0 0 / 12%)` | 输入框、浮层描边 |
| 玻璃底 `glass-bg` | `rgb(28 29 33 / 72%)` | `rgb(255 255 255 / 72%)` | 浮层 |
| 玻璃高光 `glass-highlight` | `rgb(255 255 255 / 10%)` 上边 1px 内阴影 | `rgb(255 255 255 / 80%)` | 仅顶边 |
| 强调色 `accent`（临时） | `#8ea2ff` | `#4a5fd6` | 仅：焦点环、选中线、主按钮、链接。全界面出现面积 < 2% |

危险/警告色只在真实阈值出现（Context ≥ 90%、推送失败、危险命令审批）：

| 语义 | 深色 | 浅色 |
|---|---|---|
| `warn` | `#e0b25c` | `#a86b00` |
| `danger` | `#ef6b6b` | `#c93434` |
| `success`（只用于 Git 新增行/测试通过，小面积） | `#6cc28a` | `#1f8a4c` |

### 3.4 Context 深浅色阶（核心交互）
用 `--dsh-depth-opacity` 驱动：`opacity = 0.18 + 0.72 × ratio`（ratio = 已用/上限，0–1）。
- 0–60%：只变深浅，用 `label-primary` 色，不加任何颜色。
- 60–90%：继续加深，仍无彩色。
- ≥ 90%：指示条切换为 `warn`；≥ 98% 切换 `danger`，并在 hover 浮层里出现一句“接近上限，建议压缩对话”（走 locale，若官方有压缩命令则链接官方命令）。

---

## 4. 字体、间距、圆角、层级、动效 token

### 4.1 字体
- UI：`"Segoe UI Variable Text", "Segoe UI", "SF Pro Text", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif`
- 代码 / 数字：沿用官方 `--ds-font-family-code`（SF Mono / JetBrains Mono / Consolas …）
- 所有对齐数字：`font-variant-numeric: tabular-nums`

| 级别 | 字号/行高 | 字重 | 用途 |
|---|---|---|---|
| Display | 28/36 | 600 | 预留给非品牌性的空状态标题 |
| Title | 17/24 | 600 | 面板标题、设置页标题 |
| Body | 15/24 | 400 | 聊天正文（阅读优先，比 UI 大 1px） |
| UI | 14/20 | 400/500 | 按钮、侧栏行、输入框 |
| Small | 13/18 | 400 | 辅助说明、Dock 数值 |
| Caption | 12/16 | 500 | 分组标题（Today/Yesterday）、时间戳 |
| Micro | 11/14 | 600，字距 0.08em，大写 | HARNESS、状态标签 |

### 4.2 间距（4 的倍数，禁止随手写别的）
`--dsh-space-1..8` = `4 / 8 / 12 / 16 / 20 / 24 / 32 / 48` px。

### 4.3 圆角
| Token | 值 | 用途 |
|---|---|---|
| `--dsh-radius-s` | 6px | 行、小按钮、标签 |
| `--dsh-radius-m` | 10px | 输入框、代码块、菜单 |
| `--dsh-radius-l` | 14px | 浮层、Dock、命令面板、对话框 |
| `--dsh-radius-pill` | 999px | 仅 Dock 收起时的 handle、开关 |
禁止 >16px 的大圆角卡片。

### 4.4 层级（elevation）
| 层 | 阴影（深色） | 用途 |
|---|---|---|
| 0 | 无 | 页面、侧栏、消息 |
| 1 | `0 1px 2px rgb(0 0 0 / 30%)` | 输入框 |
| 2 | `0 8px 24px rgb(0 0 0 / 35%), 0 0 0 0.5px border-l2` | 菜单、popover |
| 3 | `0 16px 48px rgb(0 0 0 / 45%), 0 0 0 0.5px border-l2` | Dock、命令面板、滚筒、模态 |
浅色阴影不透明度减半。

### 4.5 模糊
- 玻璃：`backdrop-filter: blur(24px) saturate(140%)`，Windows 上若掉帧，降到 `blur(16px)`。
- 滚筒邻项：`filter: blur(0.6px)`（第 1 格）/ `blur(1.2px)`（第 2 格）。

### 4.6 动效（已存在于 `depth.css`，直接用）
- `--dsh-duration-fast` 120ms（hover、按下）
- `--dsh-duration-base` 200ms（展开、切换）
- `--dsh-duration-slow` 360ms（Dock 展开、面板进出）
- `--dsh-ease-standard` `cubic-bezier(0.2, 0, 0, 1)`
- `--dsh-ease-emphasized` `cubic-bezier(0.3, 0, 0, 1)`
- 所有动画必须遵守 `body[data-dsh-motion="full|reduced|off"]` 与系统 `prefers-reduced-motion`：reduced = 只保留 ≤200ms 的透明度过渡；off = 无过渡。
- 只动 `transform` / `opacity` / `filter`，不动 width/height/top/left。

---

## 5. 启动动画（“玄”版，替换旧手写版）

> **移植，不是重新设计。** `D:\Desktop\claude\logo-preview\index.html` 是用户认可的成品。颜色、渐变、字母与鲸鱼路径、线宽比例、光点、层次一律照搬；只允许压缩时间线（5.4）并接入 boot-page 的流程（5.6）。完成后必须把预览页 `#t<ms>` 截图与应用同一时刻截图并排对比。

### 5.1 目标观感
安静的玄色空间 → 一道虹彩的光沿官方鲸鱼轮廓描一圈 → 玄色玻璃鲸身浮现 → 一支看不见的笔带着一粒光点，一笔一画写出几何单线体 “DeepSeek” → HARNESS 小字淡入 → 停顿 → 字迹沉入空会话页的深度标记，玄色背景褪去露出应用。

### 5.2 几何单线字母（已定稿，直接复制）
坐标系 viewBox `0 0 620 136`，大写高度 16–100，x 高 40–100，p 下伸到 124。每条 path 是一次落笔，按书写顺序排列，已测长度（单位 viewBox）：

```ts
const STROKES = [
  { d: 'M10 100 L10 16 L36 16 C64 16 82 34 82 58 C82 82 64 100 36 100 Z', length: 276 }, // D
  { d: 'M98 70 L158 70 A30 30 0 1 0 152 88', length: 229 },                              // e
  { d: 'M172 70 L232 70 A30 30 0 1 0 226 88', length: 229 },                             // e
  { d: 'M250 40 L250 124', length: 84 },                                                 // p stem
  { d: 'M250 70 A30 30 0 1 1 310 70 A30 30 0 1 1 250 70', length: 189 },                 // p bowl
  { d: 'M384 30 C377 20 366 14 353 14 C337 14 326 23 326 36 C326 50 338 55 355 59 C373 63 386 69 386 82 C386 95 373 102 355 102 C339 102 328 96 321 86', length: 238 }, // S
  { d: 'M402 70 L462 70 A30 30 0 1 0 456 88', length: 229 },                             // e
  { d: 'M476 70 L536 70 A30 30 0 1 0 530 88', length: 229 },                             // e
  { d: 'M556 12 L556 100', length: 88 },                                                 // k stem
  { d: 'M600 42 L560 74', length: 51 },                                                  // k arm
  { d: 'M576 62 L604 100', length: 47 },                                                 // k leg
]
```
- `stroke-width: 8`，`stroke-linecap/linejoin: round`，`fill: none`。
- 签名 SVG 同时被空会话 depth mark 用作 mask（`--dsh-signature-mask`），所以 `signatureSvg()` 不带时间的版本用 `stroke="currentColor"`；启动页里的版本用 CSS `stroke: url(#dsh-iris-text)`（渐变 defs 放在启动页 DOM 中一个隐藏的 `<svg width=0 height=0>` 里）。

### 5.3 鲸鱼
- 路径：直接用官方鲸鱼 path（完整 d 见 `D:\Desktop\claude\logo-preview\index.html` 第 100 行 `#whalePath`，也可从 `ui-brand-official` 包里找官方 logo 资源），加 `pathLength="1"`。原始包围盒 x174 y276 w803 h591，viewBox 用 `170 272 811 599`。
- 显示宽度：`min(340px, 55vw)`（与预览页一致：鲸鱼宽 ≈ 字迹宽 × 0.78），放在字迹上方，间距 32px。
- 三层：
  1. 玻璃体 `fill: url(#dsh-glass-body)`，opacity 0 → 1；
  2. 光晕描边 `stroke: url(#dsh-iris-whale)`，屏幕宽 5px，`filter: blur(6px)`，opacity 0.5；
  3. 细描边同渐变，屏幕宽 1.6px。
  由于 path 被缩放约 0.25，viewBox 内 stroke-width 要除以缩放比（细描边 ≈ 6.4，光晕 ≈ 20），或用 `vector-effect: non-scaling-stroke`（推荐，更简单）。
- 描边动画：`stroke-dasharray: 1; stroke-dashoffset: 1 → 0`。

### 5.4 时间线（压缩到 ~2.7s，满足 brief“2–2.5s 左右”的节奏）
| 时间 (ms) | 事件 | 缓动 |
|---|---|---|
| 0 | 玄色背景已在（无黑幕，避免闪） | — |
| 0–1000 | 鲸鱼轮廓描边（两层同步） | `cubic-bezier(0.65,0,0.35,1)` |
| 500–1200 | 玻璃鲸身淡入 | `cubic-bezier(0.2,0,0,1)` |
| 700 起 | 开始书写字迹；总墨迹时间 1500ms 按长度分配给 11 笔，每笔之间抬笔 45ms | 每笔 `cubic-bezier(0.45,0,0.25,1)`（起笔加速、收笔减速） |
| ≈2650 | 书写结束（= `SIGNATURE_DRAW_MS`） | — |
| 书写结束 +150 → +700 | HARNESS 淡入到 0.5 | ease-out |
| 书写结束 +200 → +1000 | 一道高光从左到右扫过字迹（可选：用 `mask` 线性渐变移动实现，做不好就不做） | linear |
| 之后 HOLD 350ms | 停顿 | — |
| 离开 600ms | 字迹 FLIP 飞入空会话 depth mark（缩小、变暗、blur 4px）；鲸鱼与 HARNESS 同时 opacity→0 并 scale 0.96；玄色背景 opacity→0 | emphasized |

`SIGNATURE_DRAW_MS = 700 + 1500 + 45 × 10 = 2650`（导出给测试使用）。

### 5.5 笔尖光点（可选增强）
- 一个 10px 径向光点（白 → `#e6ddff` → 透明），沿当前笔画移动。
- 实现优先级：CSS `offset-path: path('<该笔 d>')` + `offset-distance 0→100%`，与该笔相同 delay/duration/缓动；放在同一个 SVG 内（Chromium 支持 SVG 元素的 offset-path，先写 demo 用 Electron 验证）。验证不通过就**不做**，不要用 JS rAF 硬凑。

### 5.6 必须保留的现有行为（已有测试覆盖，勿破坏）
- `boot-page.ts` 流程：`whenShown`（load + 可见 + 两帧 + 120ms）→ `draw` → `markDrawn` → `advance`（HOLD 350ms）→ `leave`（FLIP 到 `[data-dsh-depth-mark]`）→ `dispose`。
- 点击或按键跳过；3s 内窗口未显示则直接跳过。
- `data-dsh-motion`：reduced → 直接显示完成态、200ms 淡出；off → 立即移除。
- 失败时保留页面并显示报告（`Failed to load plugins`）。
- 测试：`packages/client/web/tests/boot-handoff.client.spec.ts`（11 个）与 `boot-page.client.spec.ts` 必须全部通过；FLIP 期望值只依赖 mock 的矩形尺寸，与 viewBox 无关。
- `HeroShell.module.css` 的 `.depthMark` 高度从 168px 改为按新比例：`aspect-ratio: 620 / 136; height: auto;` 宽度保持 `min(440px, 70%)`。

### 5.7 验收
- 1280×800 和 1920×1080（125% 缩放）下截图：鲸鱼居中偏上，字迹宽约 440px，无裁切；动画 60fps（DevTools Performance 无长帧）。
- 浅色主题下启动页仍为玄色，离开后露出浅色应用，无白闪。

---

## 6. 模型滚筒（Wheel Picker）· 重做

### 6.1 为什么重做
上一版自写物理惯性，手感不对。**这一版必须用浏览器原生滚动 + scroll-snap**，手感接近 iOS 时间选择器。

### 6.2 入口
- Dock 中“模型”胶囊（第 7 节）点击 → 在胶囊正下方弹出滚筒浮层（玻璃，层级 3，圆角 14px，宽 280px，高 5 行 × 40px = 200px + 上下内边距 8px）。
- 仍保留官方模型选择的全部能力（按供应商分组、不可用模型置灰、设置入口等）：滚筒只替换“选模型”这一步的呈现；官方有的附加选项（如 reasoning effort）放在滚筒下方一条分隔线后，按官方原样呈现。
- 数据与提交逻辑全部复用 `packages/client/ui-model-selection` 现有的 store/action，不另起一套。

### 6.3 结构
```
┌──────────────────────────────┐
│        deepseek-v3.2          │  ← 第 2 格：scale .82, opacity .28, blur 1.2px, rotateX 40°
│      deepseek-reasoner        │  ← 第 1 格：scale .91, opacity .55, blur .6px, rotateX 22°
│ ━━━━  DeepSeek V4  ━━━━━━━━━  │  ← 中心：scale 1, opacity 1, 15px/600, 上下各 0.5px 分隔线
│        kimi-k2                │
│        qwen-max               │
└──────────────────────────────┘
```
- 滚动容器：`overflow-y: auto; scroll-snap-type: y mandatory; overscroll-behavior: contain; scrollbar-width: none;`
- 上下各留 2 行高度的 padding，使首尾项也能滚到中心。
- 每行：高 40px，`scroll-snap-align: center`，文字 14px/500 居中，单行省略号。
- 中心选中带：两条 0.5px `border-l2` 横线，位于容器中线 ±20px，`pointer-events: none`。
- 容器上下边缘加 mask 渐隐：`mask-image: linear-gradient(transparent, #000 25%, #000 75%, transparent)`。
- 透视：容器 `perspective: 600px`；每行 `transform-origin: center center -60px`。

### 6.4 行为
1. 滚动时用一个 rAF（每帧最多一次）根据每行中心到容器中心的距离 `d`（以行高为单位，带正负）计算：
   - `rotateX = clamp(d × 20°, -60°, 60°)`
   - `scale = 1 - min(|d|, 3) × 0.09`
   - `opacity = max(0.12, 1 - |d| × 0.45)`
   - `blur = min(|d|, 2) × 0.6px`
   只改 inline `transform/opacity/filter`，不触发布局。
2. 行跨过中线（四舍五入后的中心索引变化）时：播放一次 tick 音（第 11 节），`data-dsh-sounds="off"` 时不播。
3. **提交**：`scrollend` 事件触发后再等 **180ms**（总体落在 150–250ms 区间）仍无滚动 → 调用官方切换模型 action。不支持 `scrollend` 时用“最后一次 scroll 后 200ms”兜底。
4. 点击某行 → `scrollIntoView({ block: 'center', behavior: 'smooth' })`，滚完同样走第 3 条提交。
5. 键盘：↑/↓ 移动一格（带 smooth），Enter 立即提交并关闭，Esc 关闭不提交，Home/End 跳首尾。容器 `role="listbox"`，行 `role="option"`，`aria-selected`。
6. 提交后的 Depth 过渡：旧模型名在 Dock 胶囊里 `translateZ` 模拟后沉（scale .92 + opacity 0 + blur 2px，200ms），新模型名从 scale 1.06 / opacity 0 前浮到 1（200ms，延后 60ms）。
7. 打开时：直接把当前模型定位到中心（`scrollTop` 瞬间设置，不做动画）。
8. `reduced` / `off` 或系统减少动效：退化为**平铺列表**（无 rotateX/blur/scale，仅高亮中心行），滚动仍 snap，提交逻辑不变。
9. 不可用模型：仍可滚过，但置 opacity × 0.5，停在其上时不提交，并在下方显示一行原因（沿用官方文案）。

### 6.5 测试要点（100% 覆盖）
- jsdom 下 mock `scrollTop`、`getBoundingClientRect`、`scrollend`、定时器（`vi.useFakeTimers()`），验证：距离→样式映射、跨行 tick 次数、debounce 180ms 提交恰好一次、点击提交、键盘、reduced 平铺、不可用模型不提交。

---

## 7. Command Dock · 重做

### 7.1 定位与原则
- 顶部中央的**隐藏式控制层**。它显示的是“控制与状态”，**绝不重复**会话标题栏已有的信息（会话标题、项目名、工作目录、分享按钮等保持在官方原位置，Dock 不再显示）。
- 旧版问题：Dock 展开后与会话头重复 → 本版严格只放下面列出的 6 项。

### 7.2 收起态（默认）
- 顶部中央一条 handle：宽 44px、高 4px、圆角 pill，颜色 `label-tertiary`，opacity 0.35，距窗口顶部 6px（在 Electron 自定义标题栏区域内的话，放在标题栏下沿以下 4px，不能盖住系统窗口按钮，且必须是 `-webkit-app-region: no-drag`）。
- 窗口宽 < 720px 时 handle 仍显示，Dock 展开后内容可横向省略。

### 7.3 触发
- 鼠标进入顶部感应区（宽 560px 居中，高 28px）**停留 120ms** 后展开（防误触）；离开 Dock 与感应区 **400ms** 后收起。
- 键盘：`Ctrl+.`（Mac `⌘.`）切换展开并聚焦第一项；Esc 收起。
- 任一子浮层（滚筒、Token 面板等）打开期间 Dock 保持展开。
- 可在设置里固定显示（“Command Dock: 自动 / 始终显示”），默认自动。

### 7.4 展开态
- 尺寸：高 40px，宽随内容（最大 640px），居中，距顶部 8px。
- 材质：玻璃（`glass-bg` + blur 24px + 顶边 1px 高光 + 层级 3 阴影），圆角 14px。
- 动画：从 handle 位置“浮出”——`transform: translateY(-12px) scale(.96)` → `none`，opacity 0 → 1，`--dsh-duration-slow` + emphasized；handle 同时淡出。reduced：仅 opacity 200ms。
- 内部布局（左 → 右，间距 4px，分组之间 1px×16px 竖分隔线 `border-l1`）：

```
[ ◐ DeepSeek V4  ▾ ] │ [ Agent ▾ ] │ [ ▁▁▁▁▁▁ 64% ] [ 24.8k tok ] │ [ 🔧 ] [ ⚙ ]
   模型胶囊            模式           Context 深浅     Token 摘要       工具   设置
```

| 项 | 默认显示 | 点击 | 数据来源 |
|---|---|---|---|
| 模型 | 模型名 13px/500 + ▾ | 打开滚筒（第 6 节） | ui-model-selection |
| 模式 | 官方模式名（Chat/Agent/Plan 等，按官方实际列表） | MenuSurface 菜单，选项与官方一致 | 官方模式状态 |
| Context | 64px×3px 深浅条 + 百分比（Small, tabular） | hover 显示详情浮层（7.5） | ContextMeter 现有数据接口 |
| Token | `24.8k tok`，流式输出时换成 `↓ 112 t/s` | 打开 Token 面板（第 8 节） | 官方 stats（StatsPills 数据） |
| 工具 | 图标按钮 | 打开官方工具/插件/技能入口菜单（只放官方已有项） | 官方 |
| 设置 | 图标按钮 | 打开设置 | 官方 |

- 胶囊按钮：高 28px，内边距 0 10px，圆角 6px，hover `bg-hover`，按下 `bg-active`，焦点环 2px `accent`（offset 2px）。
- 没有数据时显示 `—`，不显示 0。

### 7.5 Context 详情浮层（hover 200ms 后出现，离开 150ms 后消失）
```
Context
82,431 / 128,000            64.4%
▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  (全宽深浅条)

Conversation              38.2k
Files                     21.7k
Tools                     14.1k
System                     8.4k
```
- 宽 260px，玻璃，层级 2，内边距 12px 16px。
- 分项如果官方拿不到，就整块显示“分项统计暂不可用”（locale），**不要编数**。数据接口定义：
```ts
interface ContextUsage {
  used: number | undefined
  limit: number | undefined
  breakdown?: { conversation?: number; files?: number; tools?: number; system?: number }
}
```

### 7.6 与会话页的关系
- 旧的会话内顶部重复信息条保持删除状态。
- ContextMeter 若在输入框附近已有官方的上下文显示：保留官方的，Dock 里的是**同一数据的另一呈现**；如果两者视觉上同时出现在一屏且显得重复，则隐藏 Dock 收起态下的任何数值（收起态本来就只有 handle），不删官方。

---

## 8. Token 与速度面板

- 从 Dock 的 Token 项点击展开，锚定在其下方，宽 300px，玻璃层级 3。
```
Current Session
Input              84,291
Output             12,483
Cached             61,202
─────────────────────────
Input speed     4.8k t/s
Output speed     112 t/s
─────────────────────────
Context              76%
Estimated cost     ¥0.84
```
- 标签 `label-secondary` 13px，数值 `label-primary` 13px tabular，右对齐。
- 费用：只有在官方提供单价/余额接口时计算，否则显示 `—` 并在底部小字说明“费用估算需要模型单价”。
- 数据接口：
```ts
interface SessionTokenStats {
  input?: number; output?: number; cached?: number
  inputSpeed?: number; outputSpeed?: number   // tokens/s
  contextRatio?: number                       // 0..1
  estimatedCost?: { amount: number; currency: 'CNY' | 'USD' }
}
```

---

## 9. 其他界面（按 ChatGPT / Claude 桌面模式 + Depth token）

### 9.1 整体布局
```
┌────────────┬───────────────────────────────────────────┬──────────────┐
│  Sidebar   │           ═ (Dock handle)                 │ 右侧面板       │
│  260px     │                                           │ (官方：文件/   │
│  可拖 220–  │       对话列 max-width 768px，居中          │  终端/浏览器/  │
│  360，可收起 │                                           │  Git，默认收起) │
│            │                                           │              │
│ 账号+余额   │   ┌───────────── 输入框 ─────────────┐     │              │
└────────────┴───┴──────────────────────────────────┴─────┴──────────────┘
```
- 窗口最小 900×600。对话列两侧至少 24px 留白。
- 侧栏收起快捷键 `Ctrl+B`（若官方已有其他绑定，用官方的）。

### 9.2 Sidebar
- 顶部：“新建会话”行（图标 + 文字，14px/500，高 36px，快捷键提示 `Ctrl+N` 用 tertiary 12px 右对齐，hover 才显示）。其下一个搜索入口（点击打开命令面板并预置“搜索会话”）。
- 历史分组标题：Caption 12px/500 `label-tertiary`，上间距 16px，下 4px；分组 Today / Yesterday / Previous 7 days / Earlier（走 locale，中文：今天/昨天/7 天内/更早）。
- 会话行：高 34px，左右内边距 10px，圆角 6px，标题单行省略 14px `label-secondary`；
  - hover：`bg-hover`，右侧淡入“⋯”更多按钮；
  - 选中：左侧 2px `accent` 竖线（高 16px 居中，已实现）+ 文字 `label-primary` 500，背景用官方规定的 `bg-hover`（官方 spec 要求，勿改成 active）；
  - 运行中会话：标题左侧 6px 圆点，`label-secondary`，1.6s 呼吸（reduced 静止）；完成未读：圆点 `accent` 静止。
- 底部账号区：高 52px，头像 28px 圆 + 名称 14px + 余额 12px tabular `label-tertiary`（例 `¥ 38.42`）；点击展开 MenuSurface：Account / API Usage / Billing / Settings / Sign out（只放官方有的，没有的不加）。余额拿不到就不显示那一行。

### 9.3 空会话页（EmptyHero）
- 深度标记（签名 mask，`--dsh-depth-opacity` 很低）位于上方 8%，这是启动字迹“沉入”的落点。
- 左上角侧栏已有“探索未至之境”品牌标识，空会话中央不再重复显示鲸鱼、标题或“预览版”标识。输入框保持居中；输入框下方最多 3 个官方已有的快捷建议 chip（高 30px，圆角 pill 例外允许，边框 `border-l2`，无填充）。

### 9.4 消息
- 用户消息：右对齐气泡，`bg-raised`，圆角 14px（右上 6px），最大宽 80%，内边距 10px 14px，Body 15/24。
- 助手消息：**无气泡**，左对齐全宽正文（ChatGPT/Claude 模式），Body 15/24，段距 12px；标题 h1–h3 = 20/18/16px 600。
- 代码块：`bg-raised` + `border-l1`，圆角 10px，顶部 32px 工具条（语言名 12px tertiary 左，复制按钮右，hover 显示），代码 13/20。
- 消息操作（复制、重试、反馈）：hover 消息时在其下方淡入一排 28px 图标按钮，默认隐藏；最后一条助手消息常驻显示。
- 思考 / 推理内容：折叠块，标题“思考了 12s”（官方文案优先）12px tertiary，点击展开，内容 `label-secondary` 14px 左侧 2px `border-l2` 竖线。

### 9.5 输入框（Composer）
- 宽同对话列，最小高 52px，最大高 40vh 自适应；`bg-raised`，`border-l2`，圆角 14px（输入框属于“卡片例外”），层级 1；focus 时描边变 `label-tertiary`，不加彩色光晕。
- 左下：附件、官方已有的输入工具；右下：发送按钮 32px 圆形，空输入时 `bg-active` 置灰，有内容时 `label-primary` 底 + `bg-base` 箭头；生成中变“停止”方块。
- 提示文字 `label-tertiary`。拖文件到窗口任意位置时，输入框出现 1px 虚线 `accent` 描边 + “松开以添加附件”。

### 9.6 Agent Timeline（Task Trace）
- 放在助手消息内，工具调用区的上方，默认折叠为一行：`● 正在运行测试 · 第 5/7 步 · 00:42`（Small，secondary；圆点呼吸）。
- 点击展开为竖向时间线：每步一行 28px，左侧 8px 节点 + 1px 连线（`border-l2`），右侧文字；状态：进行中（节点呼吸）、完成（实心 `label-secondary`）、失败（`danger` 节点 + 文字）、危险操作待批（`warn` 节点，行尾“审批”按钮，走官方审批流程 ui-approval）。
- 点某一步再展开明细：tool call 参数、终端输出（等宽 12px，最多 12 行，可“展开全部”）、diff（复用官方 diff 组件）、错误。
- 数据全部来自官方 trajectory / tool 事件（`ui-trajectory`、`ui-tool`），不自造步骤名。
- 完成后折叠为：`✓ 已完成 7 步 · 1m 32s`。

### 9.7 设置页
- 左侧分类列表（官方已有分类），右侧内容最大宽 640px。
- 每项：左标签（14px primary）+ 说明（13px secondary），右控件；项间 1px `border-l1` 分隔，行高 ≥ 56px。
- 新增的本项目设置集中在“外观”分类：主题（官方）、Animation Full/Reduced/Off（已做）、Interface Sounds（已做）、Command Dock 自动/始终显示、全局快捷提问热键、完成通知开关。

### 9.8 菜单 / Popover / 对话框
- 菜单用 MenuSurface：玻璃、层级 2、圆角 10px、项高 32px、内边距 4px、项圆角 6px、快捷键右对齐 tertiary。
- 对话框：宽 440px，实色 `bg-raised`（不是玻璃，因为要读字），层级 3，圆角 14px，标题 17px，按钮右下，主按钮 `label-primary` 底反色文字，危险按钮 `danger` 文字 + `border-l2` 边。

---

## 10. 新增桌面功能

所有文案走 locale；所有功能在设置里可关闭；实现优先放 `apps/desktop/src`（主进程）+ 对应 preload + 客户端 UI 插件。

### 10.1 全局快捷提问（Quick Ask）
- 默认热键 `Alt+Space`（可在设置改；注册失败时提示冲突，不强占）。主进程 `globalShortcut`。
- 弹出一个独立无边框小窗：宽 640px，初始高 64px，屏幕水平居中、距顶 22%，玻璃（Windows 用 `backgroundMaterial: 'acrylic'`，不支持时用实色 `bg-raised`），圆角 14px，层级 3。
- 内容：左侧当前模型小字（点击可切换，用精简版滚筒），中间单行输入框 17px，右侧 `Enter` 提示。
- Enter：在主窗口新建会话并发送（复用官方新建/发送 API），主窗口前置并聚焦该会话；小窗关闭。`Shift+Enter` 换行，Esc / 失焦关闭。
- 进出动画：opacity + translateY(-6px)，150ms。

### 10.2 完成通知 + 任务栏角标
- 条件：一次运行（回复或 agent 任务）结束，且主窗口不在前台或该会话不是当前会话。
- 系统通知：标题 = 会话标题，正文 = “已完成”/“需要你的审批”/“运行失败” + 第一行摘要（≤ 80 字）。点击通知 → 前置窗口并打开该会话。
- 任务栏：Windows `setOverlayIcon`（小圆点 + 数字 ≤ 9，>9 显示 9+）、`flashFrame` 一次；macOS `app.dock.setBadge`。打开对应会话后计数减少。
- 需要审批时通知优先级最高。设置项：完成通知 开/关，仅在后台时通知 开/关。

### 10.3 Ctrl+K 命令面板
- 先检查 `packages/client/ui-commands` 与 `ui-shortcuts`、`packages/client/shortcuts`：**如官方已有命令面板，只做样式与条目补充，不另造**。
- 面板：宽 600px，距顶 18%，玻璃层级 3，圆角 14px；顶部输入框 48px 高 16px 字；下方分组列表（Caption 分组标题），项高 36px：图标 16px + 名称 14px + 右侧快捷键；选中项 `bg-active`。最多显示 8 项，其余滚动。
- 分组：会话（搜索历史会话，模糊匹配标题）、操作（新建会话、切换模型、切换模式、打开设置、切换主题、Animation 档位、打开 Git 面板、打开终端…只列官方已有能力 + 本方案新增能力）、最近。
- 键盘：↑↓ 选择、Enter 执行、Esc 关闭、`Ctrl+K` 再按关闭；输入 `>` 只看操作，`#` 只看会话。
- 进出：opacity + scale(.98→1)，150ms。

### 10.4 拖放打开
- 拖入**文件夹** → 以该目录为工作区新建会话（复用官方项目/目录选择逻辑 `ui-directory-picker-*`、`project-manager.ts`）。
- 拖入**文件** → 作为附件加入当前输入框（复用 `ui-attachment` / `file-upload`）。
- 拖入 dsh 会话导出文件（若官方有导出格式）→ 打开该会话；没有就不做。
- 拖动中：窗口覆盖一层 `rgb(0 0 0 / 35%)` + 中央 1px 虚线框圆角 14px + 文案“松开以打开文件夹 / 添加附件”（依据拖入类型切换）。

### 10.5 用量与余额
- 侧栏底部账号区显示余额（已做初版）；账号菜单中“API Usage”打开一个面板：本月 token 与费用按天柱状（高 120px，柱宽随天数，颜色 `label-secondary`，今天 `label-primary`，轴标签 11px tertiary），下方表格：模型 / 输入 / 输出 / 费用。
- 数据只来自官方账号/用量接口（`account-backend.ts`、`ui-settings-account`）。拿不到就显示“用量数据不可用”+ 跳转官方控制台链接（若官方有），不造数据。

### 10.6 Git 面板
- 位置：右侧面板新增一个 “Git” 标签（与官方文件/终端/浏览器并列，参照 `ui-sidebar-right`、`ui-sidebar-files` 的插件写法）；若 `ui-workspace` 已有 workspace-changes（改动列表），**在其基础上扩展**。
- 布局（宽跟随右侧面板）：
```
main ▾   ↑2 ↓0                      ⟳
──────────────────────────────────────
Changes (3)
  M  src/app.ts                +12 −3
  A  src/new.ts                +40
  D  old.md                        −8
──────────────────────────────────────
[ 提交信息…                         ]
[ ✨ 生成 ]              [ 提交 ▾ ]
──────────────────────────────────────
Recent
  a1b2c3d  fix: boot hand-off   2h
```
- 状态字母 M/A/D/R/? 用等宽 12px：M `warn`、A `success`、D `danger`、其余 tertiary（Git 是少数允许语义色的地方，面积很小）。
- 点击文件 → 在主区域或右侧打开 diff（复用官方 diff 渲染），行级 +/− 用 `success`/`danger` 10% 背景。
- 每个文件 hover 显示：暂存 / 取消暂存 / 丢弃（丢弃需二次确认对话框）。
- “生成”提交信息：把 staged diff 发给当前模型生成一行 conventional commit（用户可改），走官方模型调用。
- 提交按钮下拉：提交、提交并推送。推送前若没有 upstream，提示设置。**推送、force 操作一律二次确认**；不提供 force push 按钮。
- Git 操作在主进程/host 端用 `git` CLI 执行（`execFile`，不用 shell 拼字符串），工作目录限定为当前会话工作区。凭据交给系统 git credential manager / `gh auth`，界面不出现任何密码/令牌输入框。
- 非 git 目录：显示“此工作区不是 Git 仓库”+“初始化”按钮（确认后执行 `git init`）。

### 10.7 其他小润色（可选，做完上面再做）
- 窗口失焦时，侧栏与 Dock handle 文字 opacity × 0.7（像原生应用）。
- 生成中窗口标题前加 `● `。
- 会话标题自动生成后以 200ms 淡入替换。
- `Ctrl+Shift+C` 复制最后一条回复；`Ctrl+/` 显示快捷键表（官方有则复用）。

---

## 11. 界面声音（Interface Sounds）
- 仅三种：滚筒 tick、Dock 展开（可不做）、完成提示（仅窗口在前台且开启时）。
- 用 Web Audio 现场合成，不引入音频文件：
  - tick：方波/三角波 2400Hz 起、4ms 指数衰减到 0，经 1800Hz 低通，增益 0.035；连续两次 tick 间隔 < 30ms 时跳过（防快速滚动时连成噪音）。
  - done：正弦 880Hz → 1320Hz 两个 60ms 音，增益 0.04。
- `body[data-dsh-sounds="off"]` 时全部静音。AudioContext 首次用户交互后才创建。

---

## 12. 实施阶段（每阶段独立完成、验收、停下汇报）

| 阶段 | 内容 | 主要文件 | 验收 |
|---|---|---|---|
| P1 | 玄版启动动画（第 5 节） | `web/src/signature.ts`、`boot-page.ts`、`boot-page.module.css`、`HeroShell.module.css`、`web/tests/*` | web 包测试全绿，100% 覆盖；dev:desktop 录屏看完整动画与沉入 |
| P2 | 新增 token（第 3、4 节）并替换已改动 CSS 里的临时值 | `ui-theme/src/styles/depth.css` 及已改的 css | test:gui 除两项环境失败外全绿；深浅色截图 |
| P3 | 模型滚筒（第 6 节） | `ui-model-selection` | 包内测试 100% 覆盖；实机滚动手感、tick、180ms 提交 |
| P4 | Command Dock + Context 浮层 + Token 面板（第 7、8 节） | 新 `ui-command-dock` 包或 `ui-layout` 内 | 不与会话头重复；键盘可达；reduced/off 正确 |
| P5 | 常规界面润色（第 9 节） | ui-sidebar / ui-workspace / ui-chat / ui-conversation / ui-settings | `DSH_SNAPSHOT=replay pnpm run test:web` 更新快照并人工核对 |
| P6 | 命令面板 + 拖放 + 通知角标（10.2–10.4） | `apps/desktop/src` + ui-commands | 实机测试 |
| P7 | 快捷提问 + 用量面板（10.1、10.5） | `apps/desktop/src` + ui-settings-account | 实机测试 |
| P8 | Git 面板（10.6） | 新 `ui-sidebar-git` 包 + host 端 git 执行 | 在测试仓库里完成 查看→暂存→提交→推送（推送前确认） |
| P9 | 发布与视频（第 13 节） | README、docs | 用户确认后再推送 |

每阶段汇报格式：改了哪些文件 / 跑了哪些检查及结果（失败要贴输出）/ 截图路径 / 与官方冲突点 / 未完成项。

---

## 13. GitHub 发布与宣传视频

### 13.1 发布（全部需要用户确认后执行）
1. 用户在终端运行 `gh auth login`。
2. 设置作者：`git config user.name "<GitHub 用户名>"`、`git config user.email "<id>+<user>@users.noreply.github.com"`。
3. 在 `desktop/depth` 分支提交。
4. 新建**公开**仓库（建议名 `dsh-desktop-depth`），推送。
5. README 顶部必须写：
   > **非官方社区概念项目**。基于 DeepSeek Harness（MIT，© DeepSeek）修改，与 DeepSeek 官方无关联、未获其背书。
   保留原 LICENSE 与版权声明。附启动动画 GIF、主界面截图、功能列表、构建方法。

### 13.2 宣传视频（30–45s，1920×1080，60fps）
- 工具：`winget install Gyan.FFmpeg`；画面用 Electron 应用实录（OBS 或 `ffmpeg -f gdigrab`），启动动画可用 logo-preview 页面 `#t<ms>` 冻结逐帧截图再合成（每 16.67ms 一帧）。
- 分镜：
  1. 0–4s 玄色启动动画完整一遍（鲸鱼描边 → 书写 DeepSeek → HARNESS）。
  2. 4–6s 字迹沉入，露出主界面。
  3. 6–12s 鼠标靠近顶部，Dock 浮出；点模型，滚筒滚动，停下切换（配 tick 声）。
  4. 12–17s hover Context，深浅浮层；点 Token 面板。
  5. 17–24s 发起一个 agent 任务，Timeline 一步步推进，展开一步看 diff。
  6. 24–30s `Alt+Space` 快捷提问；`Ctrl+K` 命令面板。
  7. 30–36s Git 面板：查看改动 → 生成提交信息 → 提交。
  8. 36–42s 回到玄色背景，鲸鱼 + DeepSeek Harness + “Unofficial community concept” 小字，结束。
- 音乐：无版权环境音或静音 + 界面音效；字幕中英双语，字体同 UI 字体，白字 opacity 0.85，左下角。

---

## 14. 禁止清单（出现即返工）
- 大面积渐变、发光、霓虹、蓝紫科技风背景（启动动画除外）。
- 所有东西都套圆角卡片 + 阴影；圆角 > 16px。
- 满屏毛玻璃；聊天正文/代码区用玻璃。
- 红黄绿交通灯式 Context。
- 编造的 token、费用、余额、用量、Context 分项数字。
- 删除或改变官方功能、快捷键、文案含义。
- 组件 CSS 写字面量颜色；硬编码中文/英文文案。
- 为了一个动画引入 Three.js / Lottie / 大型 UI 库。

---

## 15. 交给执行模型时的开场提示词（直接复制）

```
你在仓库 D:\Desktop\claude\deepseek-harness（分支 desktop/depth，有未提交改动，禁止丢弃）里工作。
先完整阅读 docs/desktop-depth/DESIGN.md 和 packages/client/AGENTS.md。
你是施工方，不是设计师：严格按 DESIGN.md 的数值和行为实现，不自行美化。
本次只做【阶段 P?：……】，不要做其他阶段。
遵守第 0 节的规则与安全红线；与官方冲突时保留官方并在汇报中说明。
完成后按第 12 节检查阶梯运行测试，贴出真实结果（失败就贴失败输出），给出截图路径，然后停下等我确认。
```
