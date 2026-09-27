# DeepSeek Harness (0.1)

English | [中文](README.zh.md)

**DeepSeek Harness (`dsh`)** is an open-source, plugin-based AI agent harness with a Web app and an Electron desktop app.

Version **0.1** is a developer preview. Model tasks require a configured provider and API key; the app's APIs may change.

## Watch the project tour

[![DeepSeek Harness project tour preview](.github/media/deepseek-harness-preview.gif)](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/deepseek-harness-project-tour.mp4)

[Watch the 31-second project tour (MP4, 0.7 MB)](https://github.com/2671321688-tech/deepseek-harness/releases/download/v0.1.0/deepseek-harness-project-tour.mp4)

The video records the local Web app, whose application UI is shared with the Electron desktop app. It shows configuration and navigation without simulating an AI response or an account balance.

---

## What the 0.1 app shows

- **Workspaces and sessions:** Choose a workspace, create or revisit a session, and select a mode and permission setting near the composer.
- **Model configuration:** Choose a model and effort level, configure a DeepSeek API key, or add a custom provider in Settings.
- **Plugin management:** Browse available plugins and configure tools such as the terminal in the app.
- **Agent presets:** Choose from Standard, PTC, Minimal, and Creator compositions.
- **Appearance and controls:** Switch between light and dark themes and adjust general interaction settings.

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

<a id="run"></a>

## 🛠️ Building & Development

### Prerequisites
- **Node.js**: `>= 22.19.0`
- **pnpm**: `11.7.0`
- **Python**: `>= 3.10` (only required when executing Python runtime extensions)

<a id="run-from-source"></a>

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
pnpm --filter @deepseek-ai/dsh-desktop run dist:win

pnpm --filter @deepseek-ai/dsh-desktop run dist:mac

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
