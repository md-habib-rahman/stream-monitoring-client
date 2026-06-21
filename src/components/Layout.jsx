import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <div className="navbar bg-neutral text-neutral-content shadow-sm">
        <div className="flex-1">
          <span className="text-xl font-semibold px-4">HLS Monitor</span>
        </div>

        <div className="flex gap-4 px-2">
          <Link to="/" className="btn btn-secondary">
            Dashboard
          </Link>
          <Link to="/channels" className="btn btn-secondary">
            Channels
          </Link>
          <Link to="/events" className="btn btn-secondary">
            Events
          </Link>
          <button
            className="btn btn-error"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-5">
        <Outlet />
      </div>
    </>
  );
}
