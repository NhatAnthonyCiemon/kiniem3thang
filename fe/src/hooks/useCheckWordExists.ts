import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useCheckWordExists = (word: string) => {
    return useQuery({
        queryKey: ["checkWord", word],
        queryFn: async () => {
            if (!word.trim()) return null;
            const response = await axiosInstance.get(
                `/learn/words/check?word=${encodeURIComponent(word)}`,
            );
            return response.data.data;
        },
        enabled: word.trim().length > 0,
    });
};
