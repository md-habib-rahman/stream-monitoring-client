import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  MdDashboard,
  MdEventNote,
  MdLogout,
  MdMenu,
  MdTv,
  MdPeople,
  MdEmail,
  MdRouter,
} from "react-icons/md";
import Logo from "./common/brand/Logo";
import { getUser } from "../utils/auth";

const baseNavigation = [
  { label: "Dashboard", to: "/", icon: MdDashboard, end: true },
  { label: "Channels", to: "/channels", icon: MdTv },
  { label: "Events", to: "/events", icon: MdEventNote },
];

function NavigationLink({ item, mobile = false }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          mobile ? "w-full" : "",
          isActive
            ? "bg-white/10 text-white shadow-sm"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
        ].join(" ")
      }
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const user = getUser() || {};
  const navigation =
    user.role === "SUPER_ADMIN"
      ? [
          ...baseNavigation,
          { label: "Infrastructure", to: "/infrastructure", icon: MdRouter },
          { label: "Users", to: "/users", icon: MdPeople },
          { label: "Alert Emails", to: "/alert-recipients", icon: MdEmail },
        ]
      : baseNavigation;

  return (
    <div className="min-h-screen bg-base-200">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#12263A]/95 text-white shadow-lg shadow-black/10 backdrop-blur-md">
        <div className="navbar mx-auto min-h-16 max-w-screen-2xl px-3 sm:px-6">
          <div className="navbar-start w-auto flex-1 gap-2 lg:flex-none">
            <div className="dropdown lg:hidden">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-ghost btn-square text-slate-200 hover:bg-white/10"
                aria-label="Open navigation menu"
              >
                <MdMenu className="h-6 w-6" aria-hidden="true" />
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-10 mt-3 w-56 gap-1 rounded-xl border border-white/10 bg-[#12263A] p-2 text-white shadow-xl"
              >
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavigationLink item={item} mobile />
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-1 py-1"
              aria-label="HLS Monitor home"
            >
              <Logo onDark />
              <span className="hidden border-l border-white/15 pl-3 text-sm font-semibold tracking-wide text-white sm:inline">
                HLS Monitor
              </span>
            </Link>
          </div>

          <nav
            className="navbar-center hidden flex-1 justify-center lg:flex"
            aria-label="Main navigation"
          >
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/10 p-1">
              {navigation.map((item) => (
                <NavigationLink key={item.to} item={item} />
              ))}
            </div>
          </nav>

          <div className="navbar-end w-auto flex-1 gap-2 sm:gap-4 lg:flex-none">
            {user.username && (
              <div className="hidden max-w-40 flex-col items-end sm:flex">
                <span className="max-w-40 truncate text-sm font-medium text-slate-200">
                  {user.username}
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400">
                  {user.role?.replace("_", " ")}
                </span>
              </div>
            )}
            <button
              type="button"
              className="btn btn-sm border-white/15 bg-white/5 text-slate-100 hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-200 sm:btn-md"
              onClick={logout}
            >
              <MdLogout className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
