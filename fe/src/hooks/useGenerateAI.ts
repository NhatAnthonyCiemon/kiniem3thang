import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useGenerateAI = () => {
    return useMutation({
        mutationFn: async (word: string) => {
            const response = await axiosInstance.get(
                `/learn/ai-content?word=${encodeURIComponent(word)}`,
            );
            return response.data;
        },
    });
};
