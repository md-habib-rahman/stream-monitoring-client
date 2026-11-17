import { useEffect, useState } from "react";
import {
  MdClose,
  MdDelete,
  MdEdit,
  MdLockOutline,
  MdRouter,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import {
  createTbsDevice,
  deleteTbsDevice,
  getTbsDevices,
  updateTbsDevice,
} from "../../services/tbsApi";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../../utils/notifications";

const EMPTY_FORM = {
  id: "",
  name: "",
  host: "",
  username: "",
  password: "",
  isActive: true,
};

function getErrorMessage(error) {
  return error.response?.data?.error || "TBS device request failed.";
}

export default function TbsDeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadDevices = async () => {
    try {
      setDevices(await getTbsDevices());
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getTbsDevices()
      .then((result) => {
        if (active) setDevices(result);
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

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openEdit = (device) => {
    setEditingId(device.id);
    setForm({
      ...EMPTY_FORM,
      id: device.id,
      name: device.name,
      host: device.host,
      isActive: device.isActive,
    });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = { ...form };
    if (editingId) {
      delete payload.id;
      if (!payload.username && !payload.password) {
        delete payload.username;
        delete payload.password;
      }
    }

    try {
      if (editingId) {
        await updateTbsDevice(editingId, payload);
      } else {
        await createTbsDevice(payload);
      }
      setDialogOpen(false);
      showSuccess(editingId ? "TBS device updated." : "TBS device added.");
      await loadDevices();
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (device) => {
    const confirmed = await confirmAction({
      title: "Delete TBS device?",
      text: `Delete "${device.name}"?`,
      confirmText: "Delete",
    });
    if (!confirmed) return;
    try {
      await deleteTbsDevice(device.id);
      showSuccess("TBS device deleted.");
      await loadDevices();
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    }
  };

  return (
    <section className="mb-6 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">TBS8510 Devices</h3>
          <p className="text-sm text-base-content/60">
            Credentials are encrypted before they are stored.
          </p>
        </div>
        <button type="button" className="btn btn-sm btn-primary" onClick={openNew}>
          Add TBS Device
        </button>
      </div>

      {loading ? (
        <div className="py-4 text-sm text-base-content/60">Loading devices…</div>
      ) : devices.length === 0 ? (
        <div className="py-4 text-sm text-base-content/60">
          No TBS devices configured.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Device ID</th>
                <th>Host</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td>{device.name}</td>
                  <td className="font-mono text-xs">{device.id}</td>
                  <td className="font-mono text-xs">{device.host}</td>
                  <td>{device.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square"
                        title={`Edit ${device.name}`}
                        aria-label={`Edit ${device.name}`}
                        onClick={() => openEdit(device)}
                      >
                        <MdEdit />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square text-error"
                        title={`Delete ${device.name}`}
                        aria-label={`Delete ${device.name}`}
                        onClick={() => handleDelete(device)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen && (
        <dialog
          className="modal modal-open"
          aria-modal="true"
          aria-labelledby="tbs-device-dialog-title"
        >
          <div className="modal-box max-h-[90vh] max-w-xl overflow-hidden p-0">
            <header className="flex items-start justify-between gap-4 border-b border-base-200 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MdRouter className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3
                    id="tbs-device-dialog-title"
                    className="text-lg font-bold"
                  >
                    {editingId ? "Update TBS device" : "Add a TBS device"}
                  </h3>
                  <p className="mt-0.5 text-sm text-base-content/60">
                    Configure the portal connection used for stream telemetry
                    and restarts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
                aria-label="Close dialog"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={handleSave}>
              <div className="max-h-[calc(90vh-10rem)] space-y-4 overflow-y-auto px-5 py-4">
                <section className="space-y-3 rounded-xl border border-base-300 p-4">
                  <div>
                    <h4 className="text-sm font-semibold">Device details</h4>
                    <p className="text-xs text-base-content/60">
                      Choose a recognizable label and the device’s base URL.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="form-control">
                      <span className="label-text mb-1 text-xs font-medium">
                        Device ID
                      </span>
                      <input
                        className="input input-sm input-bordered"
                        value={form.id}
                        disabled={Boolean(editingId)}
                        required
                        placeholder="tbs-01"
                        autoComplete="off"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            id: event.target.value,
                          }))
                        }
                      />
                      <span className="mt-1 text-[11px] text-base-content/50">
                        Stable identifier; cannot be changed later.
                      </span>
                    </label>
                    <label className="form-control">
                      <span className="label-text mb-1 text-xs font-medium">
                        Display name
                      </span>
                      <input
                        className="input input-sm input-bordered"
                        value={form.name}
                        required
                        placeholder="Main transmitter"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="form-control sm:col-span-2">
                      <span className="label-text mb-1 text-xs font-medium">
                        Device base URL
                      </span>
                      <input
                        type="url"
                        className="input input-sm input-bordered font-mono"
                        value={form.host}
                        placeholder="https://192.0.2.10"
                        required
                        autoComplete="url"
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            host: event.target.value,
                          }))
                        }
                      />
                      <span className="mt-1 text-[11px] text-base-content/50">
                        Include http:// or https:// only; no path or login
                        details.
                      </span>
                    </label>
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border border-base-300 p-4">
                  <div className="flex items-start gap-2">
                    <MdLockOutline
                      className="mt-0.5 h-4 w-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <div>
                      <h4 className="text-sm font-semibold">Portal credentials</h4>
                      <p className="text-xs text-base-content/60">
                        Encrypted before storage and never shown after saving.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="form-control">
                      <span className="label-text mb-1 text-xs font-medium">
                        Username
                      </span>
                      <input
                        className="input input-sm input-bordered"
                        value={form.username}
                        required={!editingId}
                        autoComplete="off"
                        placeholder={editingId ? "Unchanged" : "Portal username"}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            username: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="form-control">
                      <span className="label-text mb-1 text-xs font-medium">
                        Password
                      </span>
                      <div className="join w-full">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="input input-sm input-bordered join-item min-w-0 flex-1"
                          value={form.password}
                          required={!editingId}
                          autoComplete="new-password"
                          placeholder={editingId ? "Unchanged" : "Portal password"}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline join-item"
                          onClick={() =>
                            setShowPassword((current) => !current)
                          }
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          aria-pressed={showPassword}
                        >
                          {showPassword ? (
                            <MdVisibilityOff aria-hidden="true" />
                          ) : (
                            <MdVisibility aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </label>
                  </div>
                  {editingId && (
                    <p className="text-xs text-base-content/60">
                      Leave both credential fields blank to keep the current
                      login. Enter both to replace it.
                    </p>
                  )}
                </section>

                <label className="flex cursor-pointer items-center justify-between rounded-xl bg-base-200/60 px-4 py-3">
                  <span>
                    <span className="block text-sm font-medium">
                      Device is active
                    </span>
                    <span className="block text-xs text-base-content/60">
                      Inactive devices are excluded from telemetry and restart
                      requests.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                </label>

              </div>

              <footer className="flex justify-end gap-2 border-t border-base-200 bg-base-100/50 px-5 py-3">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary min-w-28"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      Saving…
                    </>
                  ) : editingId ? (
                    "Save changes"
                  ) : (
                    "Add device"
                  )}
                </button>
              </footer>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setDialogOpen(false)}>
              close
            </button>
          </form>
        </dialog>
      )}
    </section>
  );
}
