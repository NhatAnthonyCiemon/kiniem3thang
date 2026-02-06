import { type ApiResponse } from "../types/api-response";

export function returnData<T>(response: ApiResponse<T>): T {
    return response.data;
}
