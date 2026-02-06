import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalToast from "./components/GlobalToast";

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <GlobalToast />
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}
