import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

interface UpdateWordData {
    id: number;
    word?: string;
    description?: string;
    note?: string;
    ai_content?: string;
}

export const useUpdateWord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateWordData) => {
            const { id, ...updateData } = data;
            const response = await axiosInstance.patch(
                `/learn/words/${id}`,
                updateData,
            );
            return response.data;
        },
        onSuccess: () => {
            // Invalidate words query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["words"] });
        },
    });
};
