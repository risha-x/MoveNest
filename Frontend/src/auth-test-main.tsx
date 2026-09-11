import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthTest } from "./AuthTest.tsx";

createRoot(document.getElementById("auth-test-root")!).render(
  <StrictMode>
    <AuthTest />
  </StrictMode>,
);
