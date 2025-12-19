import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import LoadingProvider from "./context/LoadingContext.jsx"

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <LoadingProvider>
            <RouterProvider router={router} />
        </LoadingProvider>
    </StrictMode>
);
