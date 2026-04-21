import * as vscode from "vscode";
import { analyzeText, compactPacketJson } from "./nano.js";
import { getActiveText, getMaxInputTokens } from "./workspace.js";

type ToolInvocation = {
  input?: {
    maxInputTokens?: number;
  };
};

export function registerTools(context: vscode.ExtensionContext): void {
  if (!vscode.lm?.registerTool) {
    return;
  }

  const disposable = vscode.lm.registerTool("nanoAgentAnalyzeSelection", {
    async invoke(invocation: ToolInvocation, token: vscode.CancellationToken) {
      if (token.isCancellationRequested) {
        return new vscode.LanguageModelToolResult([]);
      }
      const maxInputTokens = invocation.input?.maxInputTokens ?? getMaxInputTokens();
      const result = analyzeText(getActiveText(), { maxInputTokens });
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(compactPacketJson(result)),
      ]);
    },
  });

  context.subscriptions.push(disposable);
}
