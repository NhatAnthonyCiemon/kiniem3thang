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
- In section 3, you MUST provide at least 5 example sentences

Response format:

1. Meaning  
Giải thích ý nghĩa của từ bằng tiếng Việt, ngắn gọn và dễ hiểu.

2. Synonyms  
Liệt kê các từ đồng nghĩa phổ biến.
Ghi rõ từ loại của từng từ (ví dụ: (n), (v), (adj), (adv)...).
Nêu rõ sự khác biệt trong các dùng nếu có
Nếu không có từ đồng nghĩa phù hợp, ghi: Không có.

3. Usage  
Giải thích cách dùng của từ. Sau khi giải thích xong thì
Đưa ra tối thiểu 5 câu ví dụ bằng tiếng Anh.
Sau mỗi câu ví dụ, giải thích rõ nghĩa của câu đó bằng tiếng Việt.

4. Word Forms & Part of Speech  
Nêu rõ từ loại của từ đã cho (noun, verb, adjective, etc.).
Liệt kê các dạng từ liên quan khác (nếu có).
Với mỗi dạng từ, ghi rõ:
- Từ loại
- Nghĩa tiếng Việt của dạng từ đó
Nếu không có, ghi: Không có.

The word is: ${word}
`;

    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 800, // tăng token vì giờ nội dung dài hơn
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Lỗi:", error.message);
    }
}
