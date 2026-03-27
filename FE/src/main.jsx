import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App.jsx";
import { setupToastBrowserPopups } from "./utils/toastPopupBridge";
import "./index.css";

setupToastBrowserPopups();

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <App />
            <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
    </StrictMode>
);
