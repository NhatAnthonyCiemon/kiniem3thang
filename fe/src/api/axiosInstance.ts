import axios from "axios";
import { getAuthContext } from "../contexts/useAuthContext";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});
axiosInstance.interceptors.request.use((config) => {
    const auth = getAuthContext();
    if (auth?.accessToken) {
        config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const auth = getAuthContext();
        console.log("Axios error:", error.response || error.message);
        if (error.response?.status === 401 && !original._retry && auth) {
            original._retry = true;
            await auth.refreshAccessToken();

            if (auth.accessToken) {
                original.headers.Authorization = `Bearer ${auth.accessToken}`;
                return axiosInstance(original);
            } else {
                auth.logout();
            }
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;
