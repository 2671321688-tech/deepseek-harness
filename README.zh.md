# DeepSeek Harness Desktop (0.1)

[English](README.md) | 中文

**DeepSeek Harness（`dsh`）** 是由开源社区与 DeepSeek 深度生态共同打造的新一代 AI 智能体工作桌面与运行环境。

在 **0.1** 版本中，项目正式引入 **Depth 极简设计美学规范**，从底层交互到视觉体验全面重构，专注于打造一个沉静、克制、高信息密度且无干扰的生产力桌面。

---

## 🚀 0.1 核心特性（真实产品实现）

本项目遵循严格的真实代码实现标准，所有功能均已就绪，拒绝虚幻概念：

- 🌊 **完整连贯的纯白开屏序列**：
  - 346 帧无间断、纯白高质感手写体 "DeepSeek" 与深海蓝鲸徽标绽放；
  - 启动阶段零弹窗扰动，动画完成顺滑无缝渐入主工作区。
- 🎯 **聚焦输入框的集中式交互（Composer-Centric）**：
  - 移除冗余的顶部 Dock 栏与多层浮动窗；
  - 模型切换（如 `DeepSeek-V41-Flash High`）、上下文模式、执行权限（`+` 菜单）紧凑收纳于输入框核心聚焦区，符合开发者手指热区习惯。
- 🧊 **克制沉静的侧边栏与真实余额**：
  - 2px 发丝级活跃指示条，去除非必要的装饰图标与噪音；
  - 左下角原生直接呈现当前账号真实可用额度（例如 `¥5.41`），点击即可管理配置，拒绝虚构假数据。
- 🌓 **纯浅 / 深黑双 Depth 极简主题**：
  - 0.5px 极细边框分割线，彻底告别花哨高光与廉价多色渐变；
  - 深色模式采用微冷深灰底色，浅色模式采用无反射纸性质感，带来长时间编码与写作的视觉舒适度。
- ⚡ **三档动效引擎与空间声学反馈**：
  - 支持 **Full（完整呼吸过渡）**、**Reduced（微动效过渡）** 与 **Off（瞬时零延迟）** 三档性能调节；
  - 搭载物理空间声学音效系统，提供精准、轻盈的交互触觉回馈。
- 🛡️ **严格的隐私与安全凭据体系**：
  - 所有 API Key 与凭据仅存储于本地官方受管安全凭证库；
  - 代码库与发布流程经过严格安全审计，杜绝任何密钥硬编码或隐私泄露风险。

---

## 📦 跨平台应用下载 (v0.1)

我们为所有主流桌面操作系统提供了独立打包的可执行应用：

| 操作系统 | 格式与下载链接 | 文件名 | 架构与体积 |
| :--- | :--- | :--- | :--- |
| **Windows** | [📥 便携绿色免安装版 (.zip)](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/DeepSeek-Harness-0.1.0-win-x64.zip) | `DeepSeek-Harness-0.1.0-win-x64.zip` | Windows x64 (162 MB) |
| **macOS** | [📥 完整应用归档 (.zip)](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/DeepSeek-Harness-0.1.0-mac-arm64.zip) | `DeepSeek-Harness-0.1.0-mac-arm64.zip` | Apple Silicon M1-M4 (132 MB) |
| **Linux** | [📥 免安装包 (.tar.gz)](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/DeepSeek-Harness-0.1.0-linux-x64.tar.gz) / [📥 Zip包](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/DeepSeek-Harness-0.1.0-linux-x64.zip) | `DeepSeek-Harness-0.1.0-linux-x64.tar.gz` | Linux x64 (124 MB) |

> 💡 **提示**：您可以在 [GitHub Releases 页面](https://github.com/2671321688-tech/deepseek-harness/releases) 查看完整变更日志与校验哈希值。

---

## 🛠️ 从源码构建与开发

### 环境要求
- **Node.js**: `>= 22.19.0`
- **pnpm**: `11.7.0`
- **Python**: `>= 3.10`（仅在使用本地 Python 运行扩展时需要）

### 快速启动

1. **克隆代码库**：
   ```bash
   git clone git@github.com:2671321688-tech/deepseek-harness.git
   cd deepseek-harness
   ```

2. **安装依赖**：
   ```bash
   pnpm install
   ```

3. **构建基础产物**：
   ```bash
   pnpm run build
   pnpm run build:desktop
   ```

4. **启动桌面端开发调试**：
   ```bash
   pnpm run dev:desktop
   ```

### 独立打包应用

在项目根目录下或进入 `apps/desktop`，执行下列命令即可生成对应平台的发布二进制：

```bash
# 构建 Windows 安装包与便携包
pnpm --filter @deepseek-ai/dsh-desktop run dist:win

# 构建 macOS DMG 镜像
pnpm --filter @deepseek-ai/dsh-desktop run dist:mac

# 构建 Linux AppImage 与 deb
pnpm --filter @deepseek-ai/dsh-desktop run dist:linux
```

打包产物将自动输出到 `apps/desktop/dist-release/` 目录下。

---

## 🤝 参与贡献与社区

- **Issue 与反馈**：欢迎通过 [GitHub Issues](https://github.com/2671321688-tech/deepseek-harness/issues) 提交改进建议；
- **安全说明**：请参阅 [SAFETY.zh.md](SAFETY.zh.md)；
- **代码规范**：请遵循 [CONTRIBUTING.zh.md](CONTRIBUTING.zh.md)。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。
