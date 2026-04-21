# Nano Agent for VS Code

VS Code Copilot tools for inspecting, compacting, and enforcing AI prompt context budgets.

Nano Agent does not add another AI chatbot. It gives Copilot and VS Code a focused tool for this job:

> Lint AI context before it hits the model.

## Features

- Analyze the active editor selection or file for token waste.
- Open a compact context packet as JSON.
- Create Nano Agent benchmark fixtures from selected text.
- Add a GitHub Actions prompt-budget workflow.
- Expose `@nano-agent` as a Copilot Chat participant when the VS Code Chat API is available.
- Expose `nanoAgentAnalyzeSelection` as a Copilot language model tool when the VS Code Language Model Tool API is available.

## Commands

```text
Nano Agent: Analyze Selection
Nano Agent: Compact Selection
Nano Agent: Create Benchmark Fixture
Nano Agent: Add GitHub Action Budget Check
```

## Copilot Chat

Use the chat participant with the active editor open:

```text
@nano-agent inspect this prompt
@nano-agent compact this context
@nano-agent create a fixture
```

In Copilot Agent Mode, the extension contributes a tool:

```text
nanoAgentAnalyzeSelection
```

This lets Copilot ask Nano Agent for a structured budget report while working on prompts, RAG fixtures, and agent context files.

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

This extension uses VS Code extension APIs directly. It does not require MCP, a backend service, or a GitHub App Copilot Extension.
