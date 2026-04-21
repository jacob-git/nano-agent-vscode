import * as vscode from "vscode";
import { registerChat } from "./chat.js";
import { registerCommands } from "./commands.js";
import { getOutputChannel, logInfo } from "./log.js";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(getOutputChannel());
  logInfo(`Activated Nano Agent ${context.extension.packageJSON.version} on VS Code ${vscode.version}.`);
  registerCommands(context);
  registerChat(context);
}

export function deactivate(): void {
  // No background resources.
}
