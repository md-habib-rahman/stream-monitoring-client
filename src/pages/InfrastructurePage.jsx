import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { MdAdd, MdDelete, MdEdit, MdRouter } from "react-icons/md";

import StatusDot from "../components/common/StatusDot";
import {
  createInfrastructureTarget,
  deleteInfrastructureTarget,
  getInfrastructureTargets,
  updateInfrastructureTarget,
} from "../services/infrastructureApi";
import { canManageFeatures } from "../utils/auth";
import { MonitoredItemFields } from "../components/infrastructure/CheckConfigurationFields";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../utils/notifications";

const EMPTY_TARGET = {
  name: "",
  target_type: "router",
  address: "",
  vendor: "",
  group_name: "",
  parent_target_id: null,
  enabled: true,
};
const EMPTY_ITEM = {
  name: "ICMP availability",
  check_type: "icmp",
  check_config: {},
  interval_seconds: 30,
  failure_threshold: 3,
  success_threshold: 2,
  thresholds: {},
  enabled: true,
};

function getErrorMessage(error) {
  return (
    error.response?.data?.error ||
    error.response?.data?.message ||
    "The infrastructure request failed."
  );
}

export default function InfrastructurePage() {
  const canManage = canManageFeatures();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [targetForm, setTargetForm] = useState(EMPTY_TARGET);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const refreshError = useRef("");

  const loadTargets = useCallback(async () => {
    try {
      setTargets(await getInfrastructureTargets());
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const data = await getInfrastructureTargets();
        if (active) {
          setTargets(data);
          refreshError.current = "";
        }
      } catch (requestError) {
        if (active) {
          const message = getErrorMessage(requestError);
          if (refreshError.current !== message) showError(message);
          refreshError.current = message;
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const allItems = targets
    .filter((target) => target.enabled)
    .flatMap((target) =>
      (target.monitored_items || []).filter((item) => item.enabled),
    );
  const counts = {
    UP: allItems.filter((item) => item.state === "UP").length,
    DOWN: allItems.filter((item) => item.state === "DOWN").length,
    UNKNOWN: allItems.filter((item) => item.state === "UNKNOWN").length,
  };

  const openCreateForm = () => {
    setEditing(null);
    setTargetForm(EMPTY_TARGET);
    setItemForm(EMPTY_ITEM);
    setFormOpen(true);
  };

  const openEditForm = (target) => {
    setEditing(target);
    setTargetForm({
      name: target.name,
      target_type: target.target_type,
      address: target.address,
      vendor: target.vendor || "",
      group_name: target.group_name || "",
      parent_target_id: target.parent_target_id,
      enabled: target.enabled,
    });
    setFormOpen(true);
  };

  const saveTarget = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateInfrastructureTarget(editing.id, targetForm);
      } else {
        await createInfrastructureTarget({
          ...targetForm,
          item: itemForm,
        });
      }
      setFormOpen(false);
      showSuccess(
        editing ? "Infrastructure target updated." : "Infrastructure target created.",
      );
      await loadTargets();
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const removeTarget = async (target) => {
    const confirmed = await confirmAction({
      title: "Delete infrastructure target?",
      text: `Delete ${target.name} and its monitoring checks?`,
      confirmText: "Delete",
    });
    if (!confirmed) return;
    try {
      await deleteInfrastructureTarget(target.id);
      showSuccess("Infrastructure target deleted.");
      await loadTargets();
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Infrastructure
          </h1>
          <p className="mt-1 text-sm text-base-content/70">
            Availability checks for devices and services.
          </p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openCreateForm}>
            <MdAdd size={20} />
            Add target
          </button>
        )}
      </header>

      <section
        aria-label="Infrastructure status summary"
        className="grid gap-3 sm:grid-cols-3"
      >
        {[
          ["UP", counts.UP],
          ["DOWN", counts.DOWN],
          ["UNKNOWN", counts.UNKNOWN],
        ].map(([status, count]) => (
          <div
            key={status}
            className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4"
          >
            <StatusDot status={status} />
            <span className="font-medium">{status}</span>
            <span className="ml-auto text-2xl font-semibold tabular-nums">
              {count}
            </span>
          </div>
        ))}
      </section>

      {formOpen && (
        <form
          className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-5"
          onSubmit={saveTarget}
        >
          <h2 className="text-lg font-semibold">
            {editing ? "Edit target" : "Add infrastructure target"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="form-control">
              <span className="label-text">Name</span>
              <input
                required
                maxLength="160"
                className="input input-bordered"
                value={targetForm.name}
                onChange={(event) =>
                  setTargetForm({ ...targetForm, name: event.target.value })
                }
              />
            </label>
            <label className="form-control">
              <span className="label-text">Type</span>
              <select
                className="select select-bordered"
                value={targetForm.target_type}
                onChange={(event) =>
                  setTargetForm({
                    ...targetForm,
                    target_type: event.target.value,
                  })
                }
              >
                <option value="router">Router</option>
                <option value="switch">Switch</option>
                <option value="server">Server</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="form-control">
              <span className="label-text">IP address or hostname</span>
              <input
                required
                maxLength="253"
                className="input input-bordered"
                value={targetForm.address}
                onChange={(event) =>
                  setTargetForm({ ...targetForm, address: event.target.value })
                }
              />
            </label>
            <label className="form-control">
              <span className="label-text">Vendor</span>
              <input
                className="input input-bordered"
                value={targetForm.vendor}
                onChange={(event) =>
                  setTargetForm({ ...targetForm, vendor: event.target.value })
                }
              />
            </label>
            <label className="form-control">
              <span className="label-text">Group</span>
              <input
                className="input input-bordered"
                value={targetForm.group_name}
                onChange={(event) =>
                  setTargetForm({
                    ...targetForm,
                    group_name: event.target.value,
                  })
                }
              />
            </label>
            <label className="form-control">
              <span className="label-text">Parent target (optional)</span>
              <select
                className="select select-bordered"
                value={targetForm.parent_target_id || ""}
                onChange={(event) =>
                  setTargetForm({
                    ...targetForm,
                    parent_target_id: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
              >
                <option value="">No parent</option>
                {targets
                  .filter((target) => target.id !== editing?.id)
                  .map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={targetForm.enabled}
                onChange={(event) =>
                  setTargetForm({
                    ...targetForm,
                    enabled: event.target.checked,
                  })
                }
              />
              <span className="label-text">Target enabled</span>
            </label>
          </div>

          {!editing && (
            <section className="space-y-3 rounded-lg bg-base-200 p-4">
              <h3 className="font-medium">Initial monitoring check</h3>
              <MonitoredItemFields
                item={itemForm}
                onChange={setItemForm}
              />
            </section>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create target"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : targets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300 py-12 text-center text-base-content/70">
          No infrastructure targets have been configured.
        </div>
      ) : (
        <section
          aria-label="Infrastructure targets"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {targets.map((target) => (
            <article
              key={target.id}
              className="rounded-xl border border-base-300 bg-base-100 p-5"
            >
              <header className="flex items-start gap-3">
                <MdRouter className="mt-1 shrink-0 text-2xl text-primary" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/infrastructure/targets/${target.id}`}
                    className="font-semibold hover:underline"
                  >
                    {target.name}
                  </Link>
                  <p className="truncate text-sm text-base-content/70">
                    {target.address}
                  </p>
                  <p className="mt-1 text-xs uppercase text-base-content/60">
                    {target.target_type}
                    {target.vendor ? ` · ${target.vendor}` : ""}
                    {target.group_name ? ` · ${target.group_name}` : ""}
                    {!target.enabled ? " · disabled" : ""}
                  </p>
                </div>
                {canManage && (
                  <div className="flex">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square"
                      aria-label={`Edit ${target.name}`}
                      onClick={() => openEditForm(target)}
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square text-error"
                      aria-label={`Delete ${target.name}`}
                      onClick={() => removeTarget(target)}
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                )}
              </header>
              <div className="mt-4 space-y-2 border-t border-base-200 pt-3">
                {(target.monitored_items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <StatusDot status={item.state} size="sm" />
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <span className="text-xs text-base-content/60">
                      {item.check_type.toUpperCase()}
                    </span>
                    {!item.enabled && (
                      <span className="text-xs text-base-content/50">
                        disabled
                      </span>
                    )}
                    <span className="w-16 text-right text-xs">
                      {item.latency_ms == null ? "—" : `${item.latency_ms} ms`}
                    </span>
                  </div>
                ))}
                {target.monitored_items?.length === 0 && (
                  <p className="text-sm text-base-content/60">
                    No checks configured.
                  </p>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
