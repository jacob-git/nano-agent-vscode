import * as vscode from "vscode";
import { logError, logInfo, showOutputChannel } from "./log.js";
import { analyzeText, compactPacketJson, createFixture, formatReport } from "./nano.js";
import { getActiveText, getMaxInputTokens, openJson, openMarkdown, writeWorkspaceFile } from "./workspace.js";

function command(name: string, action: () => Promise<void>): () => Promise<void> {
  return async () => {
    try {
      logInfo(`Command started: ${name}.`);
      await action();
      logInfo(`Command completed: ${name}.`);
    } catch (error) {
      logError(`Command ${name}`, error);
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Nano Agent: ${message}`);
      showOutputChannel();
    }
  };
}

function diagnosticsReport(context: vscode.ExtensionContext): string {
  const editor = vscode.window.activeTextEditor;
  const selection = editor?.selection;
  const selectedCharacters = editor && selection && !selection.isEmpty ? editor.document.getText(selection).length : 0;
  const documentCharacters = editor?.document.getText().length ?? 0;
  const chatApi = vscode.chat as unknown as { createChatParticipant?: unknown } | undefined;
  const lmApi = vscode.lm as unknown as { registerTool?: unknown } | undefined;

  return [
    "# Nano Agent Diagnostics",
    "",
    `- Extension version: ${context.extension.packageJSON.version}`,
    `- VS Code version: ${vscode.version}`,
    `- App: ${vscode.env.appName}`,
    `- Workspace folders: ${vscode.workspace.workspaceFolders?.length ?? 0}`,
    `- Active editor: ${editor ? "yes" : "no"}`,
    `- Active language: ${editor?.document.languageId ?? "none"}`,
    `- Selected characters: ${selectedCharacters}`,
    `- Document characters: ${documentCharacters}`,
    `- Max input tokens: ${getMaxInputTokens()}`,
    `- Chat participant API: ${typeof chatApi?.createChatParticipant === "function" ? "available" : "unavailable"}`,
    `- Language model tool API: ${typeof lmApi?.registerTool === "function" ? "available" : "unavailable"}`,
    "",
    "If chat returns no visible response, open the Nano Agent output channel and check for the latest failure line.",
  ].join("\n");
}

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("nanoAgent.analyzeSelection", command("analyzeSelection", async () => {
      const result = analyzeText(getActiveText(), { maxInputTokens: getMaxInputTokens() });
      await openMarkdown("Nano Agent Budget Report", formatReport(result));
    })),
    vscode.commands.registerCommand("nanoAgent.compactSelection", command("compactSelection", async () => {
      const result = analyzeText(getActiveText(), { maxInputTokens: getMaxInputTokens() });
      await openJson(compactPacketJson(result));
    })),
    vscode.commands.registerCommand("nanoAgent.createFixture", command("createFixture", async () => {
      const maxInputTokens = getMaxInputTokens();
      const name = await vscode.window.showInputBox({
        prompt: "Fixture name",
        value: "prompt-budget",
      });
      if (!name) return;
      await openJson(createFixture(getActiveText(), maxInputTokens, name));
    })),
    vscode.commands.registerCommand("nanoAgent.addCiCheck", command("addCiCheck", async () => {
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
    })),
    vscode.commands.registerCommand("nanoAgent.showDiagnostics", command("showDiagnostics", async () => {
      await openMarkdown("Nano Agent Diagnostics", diagnosticsReport(context));
      showOutputChannel();
    })),
    vscode.commands.registerCommand("nanoAgent.showOutput", command("showOutput", async () => {
      showOutputChannel();
    })),
  );
}
