import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useQuiz = (startId: number, endId: number) => {
    return useQuery({
        queryKey: ["quiz", startId, endId],
        queryFn: async () => {
            if (!startId || !endId) return [];
            const response = await axiosInstance.get(
                `/learn/quiz?startId=${startId}&endId=${endId}`,
            );
            return response.data.data;
        },
        enabled: false, // Don't auto-fetch, will call refetch manually
    });
};
