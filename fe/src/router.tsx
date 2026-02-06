import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import CreateWord from "./pages/CreateWord";
import WordList from "./pages/WordList";
import Quiz from "./pages/Quiz";
import LoveMessage from "./pages/LoveMessage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/useAuthContext";

function AppLayout() {
    return (
        <div className="bg-black backdrop-blur">
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        </div>
    );
}

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                element: <PublicRoute />,
                children: [
                    { path: "/", element: <Home /> },
                    { path: "/login", element: <Login /> },
                    { path: "/signup", element: <SignUp /> },
                ],
            },

            {
                element: <ProtectedRoute />,
                children: [
                    { path: "/dashboard", element: <Dashboard /> },
                    { path: "/create-word", element: <CreateWord /> },
                    { path: "/words", element: <WordList /> },
                    { path: "/quiz", element: <Quiz /> },
                    { path: "/love-message", element: <LoveMessage /> },
                ],
            },
            {
                path: "*",
                element: <div>404 Not Found</div>,
            },
        ],
    },
]);
