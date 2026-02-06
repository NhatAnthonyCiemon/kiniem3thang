// src/components/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../contexts/useAuthContext";

const PublicRoute: React.FC = () => {
    const { isAuthenticated, loading } = useAuthContext();

    if (loading) return null;

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
