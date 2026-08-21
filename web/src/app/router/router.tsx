import { createBrowserRouter } from "react-router-dom";
import { NotFoundPage } from "@/components/common/NotFoundPage";
import { AppShell } from "@/components/layout/AppShell";
import { FoundationPage } from "@/components/common/FoundationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <FoundationPage />
      },
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
]);
