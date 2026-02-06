import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../contexts/useAuthContext";
import LoadingAuth from "./loadingAuth";

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuthContext();

    if (loading) return <LoadingAuth />;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
