import './index.css'
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
