import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useWordSuggestions = (keyword: string) => {
    return useQuery({
        queryKey: ["suggestions", keyword],
        queryFn: async () => {
            if (!keyword.trim()) return [];
            const response = await axiosInstance.get(
                `/learn/suggestions?keyword=${encodeURIComponent(keyword)}`,
            );
            return response.data.data;
        },
        enabled: keyword.trim().length > 0, // Auto-fetch when keyword has value
    });
};
