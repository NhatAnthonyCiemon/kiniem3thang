import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import LoadingAuth from "../components/loadingAuth";
import axiosInstance from "../api/axiosInstance";

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: (showToast?: boolean) => void;
    refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
let authContextRef: AuthContextType | null = null;

// ✅ Cho axiosInstance truy cập token hiện tại
export const getAuthContext = (): AuthContextType | null => authContextRef;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(
        localStorage.getItem("refreshToken")
    );
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const login = (newAccessToken: string, newRefreshToken: string) => {
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem("refreshToken", newRefreshToken);
    };

    const logout = (showToast = false) => {
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("refreshToken");

        if (showToast) {
            toast.error("Session expired, please log in again.", {
                duration: 3000,
                position: "top-center",
            });
        }

        navigate("/login", { replace: true });
    };

    const refreshAccessToken = async () => {
        if (!refreshToken) {
            logout(true);
            return;
        }

        try {
            const res = await axiosInstance.post(`/user/refresh`, {
                refreshToken,
            });
            const { access_token } = res.data.data;
            setAccessToken(access_token);
        } catch {
            logout(true);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (refreshToken) {
                await refreshAccessToken();
            }
            setLoading(false);
        };
        initialize();
    }, []);

    // ✅ Cập nhật reference cho axiosInstance
    authContextRef = {
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        loading,
        login,
        logout,
        refreshAccessToken,
    };

    if (loading) {
        return <LoadingAuth />;
    }

    return (
        <AuthContext.Provider value={authContextRef}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return ctx;
};
