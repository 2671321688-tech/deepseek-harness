# DeepSeek Harness Desktop (0.1)

English | [中文](README.zh.md)

**DeepSeek Harness (`dsh`)** is an open-source, next-generation AI agent harness and productivity desktop workspace.

In version **0.1**, the project introduces the **Depth Aesthetic Specification**, delivering an interface that is quiet, disciplined, distraction-free, and crafted for deep cognitive focus.

---

## 🚀 Key Highlights in 0.1 (Production-Ready)

All features are strictly implemented in code with zero fake proposal mockups:

- 🌊 **Seamless White-Background Startup Sequence**:
  - Full, uninterrupted 346-frame handwriting animation of "DeepSeek" and the deep-sea blue whale emblem.
  - Zero modal disruptions during startup; smoothly transitions directly to the main workspace.
- 🎯 **Composer-Centric Control Hierarchy**:
  - Replaces cluttered top docks and floating overlays.
  - Model switching (e.g. `DeepSeek-V41-Flash High`), mode selection, and permissions (`+` menu) are consolidated directly around the composer input area.
- 🧊 **Quiet Sidebar with Native Real Balance**:
  - 2px hairline active indicator, eliminating gratuitous icons and noisy visual accents.
  - Bottom-left account widget displays your actual available API balance (e.g., `¥5.41`) natively in real-time.
- 🌓 **Pure Light & Deep Dark Monochrome Themes**:
  - 0.5px hairline dividers; completely avoids harsh rainbow gradients or flashy glow effects.
  - The dark theme provides a subtle cool undertone, while the light theme provides a paper-like, glare-free finish for long programming sessions.
- ⚡ **Three-Tier Motion Engine & Spatial Acoustic Haptics**:
  - Switchable motion profiles: **Full** (smooth fluid easing), **Reduced** (minimal transitions), and **Off** (instant response).
  - High-fidelity acoustic sound feedback mapped to interface actions.
- 🛡️ **Zero-Credential Security Architecture**:
  - All API keys and secrets are securely stored using the platform's native credentials manager.
  - Strictly audited to prevent any hardcoded credentials or data leakage.

---

## 📦 Downloadable Applications (v0.1)

Pre-built standalone desktop binaries are available for all major platforms:

| Operating System | Package & Direct Download | Filename | Target Architecture & Size |
| :--- | :--- | :--- | :--- |
| **Windows** | [📥 Portable Archive (.zip)](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/DeepSeek-Harness-0.1.0-win-x64.zip) | `DeepSeek-Harness-0.1.0-win-x64.zip` | Windows x64 (162 MB) |
| **macOS** | [📥 Application Bundle (.zip)](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/DeepSeek-Harness-0.1.0-mac-arm64.zip) | `DeepSeek-Harness-0.1.0-mac-arm64.zip` | Apple Silicon M1-M4 (132 MB) |
| **Linux** | [📥 Standalone Package (.tar.gz)](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/DeepSeek-Harness-0.1.0-linux-x64.tar.gz) / [📥 Zip](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/DeepSeek-Harness-0.1.0-linux-x64.zip) | `DeepSeek-Harness-0.1.0-linux-x64.tar.gz` | Linux x64 (124 MB) |

> 💡 **Note**: Visit the [GitHub Releases Page](https://github.com/2671321688-tech/deepseek-harness/releases) to view release notes, checksums, and previous versions.

---

## 🛠️ Building & Development

### Prerequisites
- **Node.js**: `>= 22.19.0`
- **pnpm**: `11.7.0`
- **Python**: `>= 3.10` (only required when executing Python runtime extensions)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone git@github.com:2671321688-tech/deepseek-harness.git
   cd deepseek-harness
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Build packages**:
   ```bash
   pnpm run build
   pnpm run build:desktop
   ```

4. **Launch Desktop in Development Mode**:
   ```bash
   pnpm run dev:desktop
   ```

### Standalone Application Packaging

From the root directory or inside `apps/desktop`, run:

```bash
# Package Windows Installer & Portable Zip
pnpm --filter @deepseek-ai/dsh-desktop run dist:win

# Package macOS DMG
pnpm --filter @deepseek-ai/dsh-desktop run dist:mac

# Package Linux AppImage & Debian package
pnpm --filter @deepseek-ai/dsh-desktop run dist:linux
```

Packaged artifacts are output to `apps/desktop/dist-release/`.

---

## 🤝 Community & Contributing

- **Issues & Discussions**: Submit bugs or feature proposals via [GitHub Issues](https://github.com/2671321688-tech/deepseek-harness/issues).
- **Safety Policy**: Review our [Safety Guidelines](SAFETY.md).
- **Contribution Guide**: Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
