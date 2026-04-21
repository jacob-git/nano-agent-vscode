import * as vscode from "vscode";
import { registerChat } from "./chat.js";
import { registerCommands } from "./commands.js";
import { registerTools } from "./tools.js";

export function activate(context: vscode.ExtensionContext): void {
  registerCommands(context);
  registerChat(context);
  registerTools(context);
}

export function deactivate(): void {
  // No background resources.
}
