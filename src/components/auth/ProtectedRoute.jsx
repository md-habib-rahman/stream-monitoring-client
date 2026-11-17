import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getCurrentUser } from "../../services/authApi";
import { getUser, getUserRole } from "../../utils/auth";
import { showError } from "../../utils/notifications";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(getUser);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(true);
        showError(
          requestError.response?.data?.error ||
            requestError.response?.data?.message ||
            "Unable to load your account. Check your connection and retry.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <main className="mx-auto mt-12 max-w-lg p-6">
        <div className="flex items-center justify-between gap-4 rounded-box border border-base-300 bg-base-100 p-4">
          <span>Unable to load your account. Check your connection and retry.</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RoleProtectedRoute({ children, allowedRoles }) {
  if (!allowedRoles.includes(getUserRole())) {
    return <Navigate to="/" replace />;
  }

  return children;
}
