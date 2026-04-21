# Nano Agent for VS Code

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Pallattu.nano-agent-vscode?label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=Pallattu.nano-agent-vscode)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/Pallattu.nano-agent-vscode)](https://marketplace.visualstudio.com/items?itemName=Pallattu.nano-agent-vscode)

Inspect and compact AI prompt context before it reaches GitHub Copilot.

Nano Agent is for teams that want Copilot help without throwing entire noisy files, logs, and prompt drafts into the model by default.

> Lint AI context before it hits the model.

## Why Use It

Copilot is useful, but long context gets expensive and noisy. Nano Agent gives you a local context-budget check inside VS Code so you can see what would be kept, what would be dropped, and how many estimated tokens you can save.

It is intentionally small:

- No MCP required.
- No backend service.
- No account with Nano Agent.
- No source upload to a third-party server by this extension.

## Features

- Analyze the active editor selection or file for token waste.
- Open a compact context packet as JSON.
- Create Nano Agent benchmark fixtures from selected text.
- Add a GitHub Actions prompt-budget workflow.
- Show local diagnostics and extension logs when Copilot Chat integration needs debugging.
- Expose `@nano-agent` as a Copilot Chat participant when the VS Code Chat API is available.

## Install

Install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Pallattu.nano-agent-vscode), or search for `Nano Agent` in VS Code Extensions.

You can also install directly from VS Code:

```text
ext install Pallattu.nano-agent-vscode
```

## Commands

```text
Nano Agent: Analyze Selection
Nano Agent: Compact Selection
Nano Agent: Create Benchmark Fixture
Nano Agent: Add GitHub Action Budget Check
Nano Agent: Show Diagnostics
Nano Agent: Show Output
```

## Copilot Chat

Use the chat participant with the active editor open:

```text
@nano-agent inspect this prompt
@nano-agent compact this context
@nano-agent create a fixture
```

If Copilot Chat appears to hang, run `Nano Agent: Show Diagnostics` and check the `Nano Agent` output channel.

## Typical Workflow

1. Open a prompt, code file, log, or context draft.
2. Select the part you planned to send to Copilot.
3. Run `Nano Agent: Analyze Selection`.
4. Use `Nano Agent: Compact Selection` when you want a smaller context packet.
5. Paste the compact packet into Copilot, or use `@nano-agent inspect this prompt` for an inline report.

## Settings

```json
{
  "nanoAgent.maxInputTokens": 1200,
  "nanoAgent.maxRecentMessages": 6
}
```

## Development

```sh
npm install
npm test
npm run package
```

Run the extension from VS Code with the `Run Extension` launch config.

Marketplace publishing is automated from version tags after `VSCE_PAT` is configured in GitHub Actions. See [docs/release.md](docs/release.md).

## Privacy

Nano Agent analysis runs locally in the VS Code extension host. This extension does not call a Nano Agent server. When you paste compacted output into Copilot or use Copilot Chat, GitHub Copilot's own terms and organization policies apply.

## No MCP Required

This extension uses VS Code commands and chat participant APIs directly. It does not require MCP, a backend service, a GitHub App Copilot Extension, or a VS Code language model tool.
