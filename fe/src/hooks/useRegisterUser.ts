import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { returnData } from "../helper/return-data";

export interface RegisterUserRequest {
    email: string;
    password: string;
    username: string;
}

export interface RegisterUserResponse {
    message: string;
}

const registerUser = async (
    data: RegisterUserRequest
): Promise<RegisterUserResponse> => {
    const res = await axiosInstance.post("/user/register", data);
    return returnData<RegisterUserResponse>(res.data);
};

export const useRegisterUser = () => {
    return useMutation<RegisterUserResponse, unknown, RegisterUserRequest>({
        mutationFn: registerUser,
    });
};
