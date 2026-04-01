import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import SmartHeal from "./smartheal.js";

SmartHeal.init({
  endpoint: "http://localhost:3001/jobs",
  projectId: "proj_todo_app",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
