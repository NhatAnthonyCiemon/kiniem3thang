import { Toaster } from "react-hot-toast";

const GlobalToast = () => {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 3000,
                style: {
                    background: "#1e293b",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
                success: {
                    style: {
                        background: "#10b981",
                    },
                    iconTheme: {
                        primary: "#fff",
                        secondary: "#10b981",
                    },
                },
                error: {
                    style: {
                        background: "#ef4444",
                    },
                    iconTheme: {
                        primary: "#fff",
                        secondary: "#ef4444",
                    },
                },
            }}
        />
    );
};

export default GlobalToast;
