import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUserEnabled,
  updateUserPassword,
  updateUserRole,
} from "../services/userApi";
import { getUser } from "../utils/auth";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../utils/notifications";

const roles = ["SUPER_ADMIN", "ADMIN", "USER"];

function getErrorMessage(error) {
  return error.response?.data?.error || "User management request failed.";
}

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [passwords, setPasswords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const currentUserId = getUser()?.id;

  const loadUsers = async () => {
    try {
      setUsers(await getUsers());
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((requestError) => {
        if (active) showError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await createUser({ username, password, role });
      setUsername("");
      setPassword("");
      setRole("USER");
      showSuccess("User created.");
      await loadUsers();
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (user, nextRole) => {
    try {
      const updated = await updateUserRole(user.id, nextRole);
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? updated : item)),
      );
      showSuccess(`Updated ${user.username}'s role.`);
      if (user.id === currentUserId) {
        const currentUser = getUser();
        localStorage.setItem(
          "user",
          JSON.stringify({ ...currentUser, role: updated.role }),
        );
        navigate("/", { replace: true });
      }
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    }
  };

  const handleEnabledChange = async (user, enabled) => {
    try {
      const updated = await updateUserEnabled(user.id, enabled);
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? updated : item)),
      );
      showSuccess(`${user.username} ${enabled ? "enabled" : "disabled"}.`);
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    }
  };

  const handlePasswordChange = async (user) => {
    const nextPassword = passwords[user.id] || "";
    try {
      await updateUserPassword(user.id, nextPassword);
      setPasswords((current) => ({ ...current, [user.id]: "" }));
      showSuccess(`Password changed for ${user.username}.`);
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    }
  };

  const handleDelete = async (user) => {
    const confirmed = await confirmAction({
      title: "Delete user?",
      text: `Delete "${user.username}"?`,
      confirmText: "Delete",
    });
    if (!confirmed) return;
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      showSuccess(`Deleted ${user.username}.`);
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">User management</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Create accounts and manage roles, passwords, and access.
        </p>
      </header>

      <form
        onSubmit={handleCreate}
        className="card bg-base-100 shadow-sm"
      >
        <div className="card-body">
          <h2 className="card-title text-lg">Add user</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px_auto]">
            <label className="form-control">
              <span className="label-text mb-1">Username</span>
              <input
                className="input input-bordered"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={100}
                autoComplete="off"
                required
              />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">Temporary password</span>
              <input
                className="input input-bordered"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            <label className="form-control">
              <span className="label-text mb-1">Role</span>
              <select
                className="select select-bordered"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary self-end" disabled={saving}>
              {saving && <span className="loading loading-spinner loading-sm" />}
              Create user
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto rounded-box bg-base-100 shadow-sm">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Access</th>
              <th>Change password</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="font-medium">{user.username}</td>
                <td>
                  <select
                    className="select select-bordered select-sm"
                    value={user.role}
                    onChange={(event) =>
                      handleRoleChange(user, event.target.value)
                    }
                    aria-label={`Role for ${user.username}`}
                  >
                    {roles.map((item) => (
                      <option key={item} value={item}>
                        {item.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={user.enabled}
                    disabled={user.id === currentUserId}
                    onChange={(event) =>
                      handleEnabledChange(user, event.target.checked)
                    }
                    aria-label={`${user.enabled ? "Disable" : "Enable"} ${user.username}`}
                    title={
                      user.id === currentUserId
                        ? "You cannot disable your own account"
                        : undefined
                    }
                  />
                </td>
                <td>
                  <div className="flex min-w-56 gap-2">
                    <input
                      type="password"
                      className="input input-bordered input-sm w-full"
                      value={passwords[user.id] || ""}
                      onChange={(event) =>
                        setPasswords((current) => ({
                          ...current,
                          [user.id]: event.target.value,
                        }))
                      }
                      minLength={8}
                      placeholder="New password"
                      aria-label={`New password for ${user.username}`}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={(passwords[user.id] || "").length < 8}
                      onClick={() => handlePasswordChange(user)}
                    >
                      Set
                    </button>
                  </div>
                </td>
                <td>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => handleDelete(user)}
                    disabled={user.id === currentUserId}
                    title={
                      user.id === currentUserId
                        ? "You cannot delete your own account"
                        : "Delete user"
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center opacity-60">
                  No users found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan="6" className="py-8 text-center">
                  <span className="loading loading-spinner loading-md" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
