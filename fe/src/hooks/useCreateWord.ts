import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

interface CreateWordData {
    word: string;
    description: string;
    note: string;
    ai_content: string;
}

export const useCreateWord = () => {
    return useMutation({
        mutationFn: async (data: CreateWordData) => {
            const response = await axiosInstance.post("/learn/words", data);
            return response.data;
        },
    });
};
