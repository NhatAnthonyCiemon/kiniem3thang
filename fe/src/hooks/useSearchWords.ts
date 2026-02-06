import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

interface SearchWordsResponse {
    success: boolean;
    data: any[];
}

export const useSearchWords = (keyword: string) => {
    return useQuery<any[]>({
        queryKey: ["searchWords", keyword],
        queryFn: async () => {
            const response = await axiosInstance.get<SearchWordsResponse>(
                `/learn/words/search`,
                {
                    params: { keyword },
                },
            );
            return response.data.data;
        },
        enabled: keyword.trim().length > 0,
        staleTime: 30000, // Cache for 30 seconds
    });
};
