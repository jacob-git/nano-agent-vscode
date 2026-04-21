import { buildNanoContext, estimateTokens, type NanoContextInput } from "@pallattu/nano-agent";

export type AnalyzeOptions = {
  maxInputTokens: number;
};

export type AnalyzeResult = ReturnType<typeof buildNanoContext>;

export function analyzeText(text: string, options: AnalyzeOptions): AnalyzeResult {
  return buildNanoContext(toContextInput(text), {
    budget: { maxInputTokens: options.maxInputTokens },
    maxRecentMessages: 6,
  });
}

export function toContextInput(text: string): NanoContextInput {
  const sections = splitSections(text);
  return {
    goal: inferGoal(text),
    instructions: "Keep only the smallest useful context for the current task.",
    context: Object.fromEntries(sections.map((section, index) => [
      section.label || `section-${index + 1}`,
      section.content,
    ])),
  };
}

export function formatReport(result: AnalyzeResult): string {
  return [
    "# Nano Agent Budget Report",
    "",
    `Goal: ${result.goal}`,
    "",
    `- Naive context: ${result.originalTokens.toLocaleString()} tokens`,
    `- Nano context: ${result.inputTokens.toLocaleString()} tokens`,
    `- Saved: ${result.savedTokens.toLocaleString()} tokens (${(result.savedRatio * 100).toFixed(1)}%)`,
    `- Kept: ${result.kept.length}`,
    `- Dropped: ${result.dropped.length}`,
    "",
    "## Kept",
    result.kept.map((item) => `- ${item}`).join("\n") || "- nothing",
    "",
    "## Dropped",
    result.dropped.map((item) => `- ${item}`).join("\n") || "- nothing",
  ].join("\n");
}

export function createFixture(text: string, maxInputTokens: number, name = "prompt-budget"): string {
  return JSON.stringify({
    name,
    budget: maxInputTokens,
    input: toContextInput(text),
  }, null, 2);
}

export function compactPacketJson(result: AnalyzeResult): string {
  return JSON.stringify({
    goal: result.goal,
    inputTokens: result.inputTokens,
    originalTokens: result.originalTokens,
    savedTokens: result.savedTokens,
    savedPercent: Number((result.savedRatio * 100).toFixed(1)),
    kept: result.kept,
    dropped: result.dropped,
    messages: result.messages,
  }, null, 2);
}

export function tokenSummary(text: string): string {
  return `${estimateTokens(text).toLocaleString()} estimated tokens`;
}

function inferGoal(text: string): string {
  const firstUsefulLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("#"));
  return firstUsefulLine?.slice(0, 160) || "Analyze the selected AI prompt context.";
}

function splitSections(text: string): Array<{ label: string; content: string }> {
  const chunks = text
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length === 0 && text.trim()) {
    return [{ label: "selection", content: text.trim() }];
  }

  return chunks.map((chunk, index) => {
    const [firstLine, ...rest] = chunk.split(/\r?\n/);
    const label = firstLine.replace(/[:#]+$/g, "").trim();
    return {
      label: label.length > 0 && label.length <= 48 ? label : `section-${index + 1}`,
      content: rest.length > 0 ? rest.join("\n").trim() : chunk,
    };
  });
}
