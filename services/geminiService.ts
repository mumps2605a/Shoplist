
import { AIResult } from "../types.ts";

/**
 * 根據使用者需求，目前不啟用 AI 影像分析。
 * 此函式保留作為預留位置。
 */
export const analyzeProductImage = async (_base64Image: string): Promise<AIResult | null> => {
  console.log("AI 分析功能目前已停用。");
  return null;
};
