// Save as: src/pages/LoginPage.jsx
import { useState } from "react";
import { login } from "../services/authApi";
import { saveAuth } from "../utils/auth";
import { useNavigate, Navigate } from "react-router";

import { BRAND, PANEL } from "../config/brand";

import StatusLine from "../components/common/StatusLine";
import Logo from "../components/common/brand/Logo";
import { showError, showSuccess } from "../utils/notifications";

// Decorative sample only (not live data). Replace the names or delete the list.
const SAMPLE_CHANNELS = [
  { name: "News 24", status: "UP" },
  { name: "Sports 1", status: "UP" },
  { name: "Movies HD", status: "DEGRADED" },
  { name: "Kids", status: "FROZEN" },
  { name: "Music", status: "DOWN" },
];

function EyeIcon({ off }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {off ? (
        <>
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M1 1l22 22" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await login(username, password);

      saveAuth(result);

      showSuccess("Signed in successfully.");
      navigate("/");
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Sign in failed. Check your username and password, then try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Brand panel (desktop only) */}
      <aside
        className={`hidden flex-col justify-between p-12 lg:flex ${PANEL.surface}`}
      >
        <Logo onDark />

        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Every stream, one view.
          </h1>
          <p
            className={`mt-4 max-w-md text-base leading-relaxed ${PANEL.muted}`}
          >
            Live status for every HLS channel, with alerts the moment anything
            changes.
          </p>

          <ul aria-hidden="true" className={`mt-10 max-w-md ${PANEL.list}`}>
            {SAMPLE_CHANNELS.map((channel) => (
              <li key={channel.name} className="px-4 py-3">
                <StatusLine
                  name={channel.name}
                  status={channel.status}
                  nameClassName="text-sm text-[#E6EDF3]"
                  codeClassName={PANEL.muted}
                />
              </li>
            ))}
          </ul>
        </div>

        <p className={`text-sm ${PANEL.faint}`}>{BRAND.productName}</p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-base-100 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-base-content/70">
            Use your {BRAND.productName} account to view stream status.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input input-bordered w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="btn btn-ghost btn-sm btn-square absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm" />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
