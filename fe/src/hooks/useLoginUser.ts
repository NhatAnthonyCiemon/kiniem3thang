import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { returnData } from "../helper/return-data";

type LoginCredentials = {
    email: string;
    password: string;
};
type LoginResponse = {
    access_token: string;
    refresh_token: string;
};

export function useLoginUser() {
    return useMutation({
        mutationFn: async (data: LoginCredentials): Promise<LoginResponse> => {
            const res = await axiosInstance.post("/user/login", data);
            return returnData<LoginResponse>(res.data);
        },
    });
}
