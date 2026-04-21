import * as vscode from "vscode";
import { analyzeText, compactPacketJson, createFixture, formatReport } from "./nano.js";
import { getActiveText, getMaxInputTokens, openJson, openMarkdown, writeWorkspaceFile } from "./workspace.js";

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("nanoAgent.analyzeSelection", async () => {
      const result = analyzeText(getActiveText(), { maxInputTokens: getMaxInputTokens() });
      await openMarkdown("Nano Agent Budget Report", formatReport(result));
    }),
    vscode.commands.registerCommand("nanoAgent.compactSelection", async () => {
      const result = analyzeText(getActiveText(), { maxInputTokens: getMaxInputTokens() });
      await openJson(compactPacketJson(result));
    }),
    vscode.commands.registerCommand("nanoAgent.createFixture", async () => {
      const maxInputTokens = getMaxInputTokens();
      const name = await vscode.window.showInputBox({
        prompt: "Fixture name",
        value: "prompt-budget",
      });
      if (!name) return;
      await openJson(createFixture(getActiveText(), maxInputTokens, name));
    }),
    vscode.commands.registerCommand("nanoAgent.addCiCheck", async () => {
      const workflow = `name: Prompt Budget

on:
  pull_request:
    paths:
      - "prompts/**"
      - "benchmarks/fixtures/**"

jobs:
  prompt-budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - uses: jacob-git/nano-agent/action@v0
        with:
          input: benchmarks/fixtures/support-ticket.json
          max-input-tokens: ${getMaxInputTokens()}
`;
      const uri = await writeWorkspaceFile(".github/workflows/prompt-budget.yml", workflow);
      vscode.window.showInformationMessage(`Nano Agent workflow written: ${vscode.workspace.asRelativePath(uri)}`);
    }),
  );
}
