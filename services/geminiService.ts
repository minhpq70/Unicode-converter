import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const summarizeDocument = async (text: string): Promise<string> => {
  try {
    // Truncate text if it's too long to avoid token limits (rudimentary check)
    // Roughly 30k chars is safe for Flash model context window
    const safeText = text.length > 50000 ? text.substring(0, 50000) + "...[cắt bớt]" : text;

    const ai = getAiClient();
    const model = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: model,
      contents: `Hãy tóm tắt ngắn gọn nội dung của văn bản sau đây bằng tiếng Việt (khoảng 200 từ). Bỏ qua các ký tự rác nếu có do lỗi định dạng:\n\n${safeText}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster summary
      }
    });

    return response.text || "Không thể tạo tóm tắt.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Có lỗi khi kết nối với Gemini AI.");
  }
};
