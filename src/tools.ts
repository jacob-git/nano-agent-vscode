import * as vscode from "vscode";
import { logError, logInfo } from "./log.js";
import { analyzeText, compactPacketJson } from "./nano.js";
import { getActiveText, getMaxInputTokens } from "./workspace.js";

type ToolInvocation = {
  input?: {
    maxInputTokens?: number;
  };
};

export function registerTools(context: vscode.ExtensionContext): void {
  if (!vscode.lm?.registerTool) {
    logInfo("Language model tool API is unavailable in this VS Code build.");
    return;
  }

  const disposable = vscode.lm.registerTool("nanoAgentAnalyzeSelection", {
    async invoke(invocation: ToolInvocation, token: vscode.CancellationToken) {
      if (token.isCancellationRequested) {
        return new vscode.LanguageModelToolResult([]);
      }
      try {
        logInfo("Language model tool invoked.");
        const maxInputTokens = invocation.input?.maxInputTokens ?? getMaxInputTokens();
        const result = analyzeText(getActiveText(), { maxInputTokens });
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(compactPacketJson(result)),
        ]);
      } catch (error) {
        logError("Language model tool", error);
        const message = error instanceof Error ? error.message : String(error);
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(`Nano Agent failed: ${message}`),
        ]);
      }
    },
  });

  context.subscriptions.push(disposable);
}
