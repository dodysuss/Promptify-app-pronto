import { PromptBlock } from '@/types/prompt';

export function replaceVariables(template: string, values: Record<string, string>): string {
  let result = template || '';
  Object.entries(values).forEach(([key, val]) => {
    if (val && val.trim()) {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      result = result.replace(regex, val);
    }
  });
  return result;
}

export function formatFullPromptWithBlocks(
  promptTemplate: string,
  extraBlocks?: PromptBlock[],
  variables: Record<string, string> = {}
): string {
  let fullText = replaceVariables(promptTemplate, variables);

  if (extraBlocks && extraBlocks.length > 0) {
    extraBlocks.forEach((block, index) => {
      const title = block.title?.trim() || `Bloco ${index + 1}`;
      const content = replaceVariables(block.content, variables);
      if (title || content) {
        fullText += `\n\n### [${title.toUpperCase()}]\n${content}`;
      }
    });
  }

  return fullText;
}
