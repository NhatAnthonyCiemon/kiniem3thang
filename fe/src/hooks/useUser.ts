import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { returnData } from "../helper/return-data";

type User = {
    id: string;
    email: string;
    username: string;
};
export function useUser() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async (): Promise<User> => {
            const res = await axiosInstance.get("/user/me"); // hoặc "/me" tuỳ API của bạn
            return returnData<User>(res.data);
        },
    });
}
