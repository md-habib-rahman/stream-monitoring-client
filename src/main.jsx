import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

// Import your global CSS file containing the Tailwind directives
import "./index.css";

import DashboardPage from "./pages/DashboardPage";
import ChannelsPage from "./pages/ChannelsPage";
import Layout from "./components/Layout";
import EventsPage from "./pages/EventsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import UserManagementPage from "./pages/UserManagementPage";
import { RoleProtectedRoute } from "./components/auth/ProtectedRoute";
import AlertRecipientsPage from "./pages/AlertRecipientsPage";
import InfrastructurePage from "./pages/InfrastructurePage";
import InfrastructureTargetPage from "./pages/InfrastructureTargetPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <DashboardPage />,
      },

      {
        path: "channels",
        element: <ChannelsPage />,
      },

      {
        path: "events",
        element: <EventsPage />,
      },
      {
        path: "infrastructure",
        element: (
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <InfrastructurePage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "infrastructure/targets/:id",
        element: (
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <InfrastructureTargetPage />
          </RoleProtectedRoute>
        ),
      },

      {
        path: "users",
        element: (
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <UserManagementPage />
          </RoleProtectedRoute>
        ),
      },

      {
        path: "alert-recipients",
        element: (
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <AlertRecipientsPage />
          </RoleProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
