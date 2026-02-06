import { useQuery } from "@tanstack/react-query";

interface Phonetic {
    text?: string;
    audio?: string;
    sourceUrl?: string;
}

interface DictionaryEntry {
    word: string;
    phonetic?: string;
    phonetics: Phonetic[];
}

export const usePhonetic = (word: string) => {
    return useQuery({
        queryKey: ["phonetic", word],
        queryFn: async () => {
            if (!word.trim()) return null;

            const res = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
            );

            if (!res.ok) {
                return null;
            }

            const data: DictionaryEntry[] = await res.json();

            if (data && data.length > 0) {
                const entry = data[0];

                // Ưu tiên 1: Lấy phonetic từ entry level
                if (entry.phonetic) {
                    return entry.phonetic;
                }

                // Ưu tiên 2: Tìm trong mảng phonetics bất kỳ item nào có text
                if (entry.phonetics && entry.phonetics.length > 0) {
                    for (const phonetic of entry.phonetics) {
                        if (phonetic.text) {
                            return phonetic.text;
                        }
                    }
                }

                return null;
            }

            return null;
        },
        enabled: !!word.trim(),
        retry: false, // Không retry nếu không tìm thấy
        staleTime: Infinity, // Cache vĩnh viễn vì phonetic không thay đổi
    });
};
