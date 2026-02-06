import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function generateScript(word) {
    const prompt = `
You are an English learning assistant.

Given an English word from the user, explain it clearly in Vietnamese.
You MUST respond using EXACTLY the following structure and numbering.
Do NOT add extra sections, comments, introductions, or conclusions.

Format requirements:
- Use Vietnamese only for explanations
- Keep the section titles in English exactly as written
- Use simple, clear, learner-friendly Vietnamese
- Always use numbering: 1. 2. 3. 4.
- If information is not available, write: Không có

Response format:

1. Meaning  
Giải thích ý nghĩa của từ bằng tiếng Việt, ngắn gọn và dễ hiểu.

2. Synonyms  
Liệt kê các từ đồng nghĩa phổ biến.
Nếu từ đồng nghĩa có sắc thái hoặc cách dùng khác, hãy ghi chú ngắn gọn.
Nếu không có từ đồng nghĩa phù hợp, ghi: Không có.

3. Usage  
Giải thích cách dùng của từ.
Đưa ra 1–2 câu ví dụ ngắn bằng tiếng Anh.

4. Word Forms & Part of Speech  
Nêu rõ từ loại của từ đã cho (noun, verb, adjective, etc.).
Liệt kê các dạng từ liên quan khác (nếu có) và nêu rõ từ loại của từng dạng.
Nếu không có, ghi: Không có.

The word is: ${word}
`;

    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile", // mạnh, free tier
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Lỗi:", error.message);
    }
}
