import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

interface Word {
    id: number;
    word: string;
    description: string;
    note: string;
    ai_content: string;
}

export const useWordByOrder = (order: number) => {
    return useQuery<Word>({
        queryKey: ["wordByOrder", order],
        queryFn: async () => {
            const { data } = await axiosInstance.get(
                `/learn/words/order/${order}`,
            );
            return data.data;
        },
        enabled: order > 0,
        retry: false,
    });
};
