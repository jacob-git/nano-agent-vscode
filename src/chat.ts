import * as vscode from "vscode";
import { analyzeText, compactPacketJson, createFixture, formatReport } from "./nano.js";
import { getActiveText, getMaxInputTokens } from "./workspace.js";

type ChatRequest = vscode.ChatRequest & {
  command?: string;
};

export function registerChat(context: vscode.ExtensionContext): void {
  if (!vscode.chat?.createChatParticipant) {
    return;
  }

  const participant = vscode.chat.createChatParticipant("nano-agent", async (
    request: ChatRequest,
    chatContext: vscode.ChatContext,
    response: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ) => {
    void chatContext;
    if (token.isCancellationRequested) return;

    try {
      const text = getActiveText();
      const result = analyzeText(text, { maxInputTokens: getMaxInputTokens() });

      if (request.command === "compact" || request.prompt.toLowerCase().includes("compact")) {
        response.markdown(`\`\`\`json\n${compactPacketJson(result)}\n\`\`\``);
        return;
      }

      if (request.command === "fixture" || request.prompt.toLowerCase().includes("fixture")) {
        response.markdown(`\`\`\`json\n${createFixture(text, getMaxInputTokens())}\n\`\`\``);
        return;
      }

      response.markdown(formatReport(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      response.markdown([
        "Nano Agent could not inspect a prompt yet.",
        "",
        message,
        "",
        "Open a prompt/context file in the editor, or select the prompt text, then run `@nano-agent inspect this prompt` again.",
      ].join("\n"));
    }
  });

  context.subscriptions.push(participant);
}
