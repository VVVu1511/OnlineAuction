import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import LoadingProvider from "./context/LoadingContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ConfirmModalProvider } from "./context/ConfirmModalContext.jsx"
import { ResultModalProvider } from "./context/ResultModalContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <LoadingProvider>
            <AuthProvider>
                <ConfirmModalProvider>
                    <ResultModalProvider>
                        <RouterProvider router={router} />
                    </ResultModalProvider>
                </ConfirmModalProvider>
            </AuthProvider>
        </LoadingProvider>
    </StrictMode>
);