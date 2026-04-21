import * as vscode from "vscode";

let output: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  output ??= vscode.window.createOutputChannel("Nano Agent");
  return output;
}

export function logInfo(message: string): void {
  getOutputChannel().appendLine(`[${new Date().toISOString()}] ${message}`);
}

export function logError(scope: string, error: unknown): void {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  getOutputChannel().appendLine(`[${new Date().toISOString()}] ${scope} failed`);
  getOutputChannel().appendLine(message);
}

export function showOutputChannel(): void {
  getOutputChannel().show(true);
}
