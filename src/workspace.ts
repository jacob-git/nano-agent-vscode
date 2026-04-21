import * as vscode from "vscode";

export function getMaxInputTokens(): number {
  return vscode.workspace.getConfiguration("nanoAgent").get<number>("maxInputTokens", 1200);
}

export function getActiveText(): string {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error("Open a file or select prompt text first.");
  }

  const selection = editor.selection;
  if (!selection.isEmpty) {
    return editor.document.getText(selection);
  }

  return editor.document.getText();
}

export async function openMarkdown(title: string, content: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument({
    language: "markdown",
    content,
  });
  await vscode.window.showTextDocument(document, { preview: false });
  await vscode.commands.executeCommand("workbench.action.editor.changeLanguageMode", "markdown");
  void title;
}

export async function openJson(content: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument({
    language: "json",
    content,
  });
  await vscode.window.showTextDocument(document, { preview: false });
}

export async function writeWorkspaceFile(relativePath: string, content: string): Promise<vscode.Uri> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    throw new Error("Open a workspace folder first.");
  }

  const uri = vscode.Uri.joinPath(folder.uri, relativePath);
  const parentPath = relativePath.split("/").slice(0, -1).join("/");
  if (parentPath) {
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(folder.uri, parentPath));
  }
  await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
  return uri;
}
