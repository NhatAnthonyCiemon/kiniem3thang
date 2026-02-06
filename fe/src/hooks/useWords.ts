import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useWords = (page: number = 1, limit: number = 20) => {
    return useQuery({
        queryKey: ["words", page, limit],
        queryFn: async () => {
            const response = await axiosInstance.get(
                `/learn/words?page=${page}&limit=${limit}`,
            );
            return response.data.data;
        },
    });
};
