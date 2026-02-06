import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

interface DeleteWordResponse {
    success: boolean;
    message: string;
}

export const useDeleteWord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (wordId: number) => {
            const response = await axiosInstance.delete<DeleteWordResponse>(
                `/learn/words/${wordId}`,
            );
            return response.data;
        },
        onSuccess: () => {
            // Invalidate và refetch danh sách từ vựng
            queryClient.invalidateQueries({ queryKey: ["words"] });
            queryClient.invalidateQueries({ queryKey: ["searchWords"] });
        },
    });
};
