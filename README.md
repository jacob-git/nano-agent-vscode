# Nano Agent for VS Code

VS Code Copilot tools for inspecting, compacting, and enforcing AI prompt context budgets.

Nano Agent does not add another AI chatbot. It gives Copilot and VS Code a focused tool for this job:

> Lint AI context before it hits the model.

## Features

- Analyze the active editor selection or file for token waste.
- Open a compact context packet as JSON.
- Create Nano Agent benchmark fixtures from selected text.
- Add a GitHub Actions prompt-budget workflow.
- Show local diagnostics and extension logs when Copilot Chat integration needs debugging.
- Expose `@nano-agent` as a Copilot Chat participant when the VS Code Chat API is available.

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

## No MCP Required

This extension uses VS Code commands and chat participant APIs directly. It does not require MCP, a backend service, a GitHub App Copilot Extension, or a VS Code language model tool.
