import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";

import StatusDot from "../components/common/StatusDot";
import { MonitoredItemFields } from "../components/infrastructure/CheckConfigurationFields";
import {
  createMonitoredItem,
  deleteMonitoredItem,
  getInfrastructureTarget,
  updateMonitoredItem,
} from "../services/infrastructureApi";
import { canManageFeatures } from "../utils/auth";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../utils/notifications";

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

function formatTime(value) {
  if (!value) return "Not checked";
  return new Date(value).toLocaleString();
}

export default function InfrastructureTargetPage() {
  const { id } = useParams();
  const canManage = canManageFeatures();
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [thresholdText, setThresholdText] = useState("{}");
  const [saving, setSaving] = useState(false);
  const refreshError = useRef("");

  const loadTarget = useCallback(async () => {
    try {
      setTarget(await getInfrastructureTarget(id));
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const data = await getInfrastructureTarget(id);
        if (active) {
          setTarget(data);
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
  }, [id]);

  const openNewItem = () => {
    setEditingItem(null);
    setItemForm(EMPTY_ITEM);
    setThresholdText("{}");
    setFormOpen(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      check_type: item.check_type,
      check_config: item.check_config || {},
      interval_seconds: item.interval_seconds,
      failure_threshold: item.failure_threshold,
      success_threshold: item.success_threshold,
      thresholds: item.thresholds || {},
      enabled: item.enabled,
    });
    setThresholdText(JSON.stringify(item.thresholds || {}, null, 2));
    setFormOpen(true);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      let thresholds;
      try {
        thresholds = JSON.parse(thresholdText);
      } catch {
        showError("Thresholds must be valid JSON.");
        setSaving(false);
        return;
      }
      if (!thresholds || typeof thresholds !== "object" || Array.isArray(thresholds)) {
        showError("Thresholds must be a JSON object.");
        setSaving(false);
        return;
      }
      const itemToSave = { ...itemForm, thresholds };
      if (editingItem) {
        await updateMonitoredItem(editingItem.id, itemToSave);
      } else {
        await createMonitoredItem(id, itemToSave);
      }
      setFormOpen(false);
      showSuccess(
        editingItem ? "Monitoring check updated." : "Monitoring check created.",
      );
      await loadTarget();
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (item) => {
    const confirmed = await confirmAction({
      title: "Delete monitoring check?",
      text: `Delete the "${item.name}" check?`,
      confirmText: "Delete",
    });
    if (!confirmed) return;
    try {
      await deleteMonitoredItem(item.id);
      showSuccess("Monitoring check deleted.");
      await loadTarget();
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    }
  };

  const itemsById = new Map(
    (target?.monitored_items || []).map((item) => [String(item.id), item]),
  );

  return (
    <div className="space-y-6">
      <Link to="/infrastructure" className="link link-hover text-sm">
        ← Infrastructure overview
      </Link>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : !target ? (
        <p className="text-sm text-base-content/70">
          The target could not be loaded. Return to the infrastructure overview
          and try again.
        </p>
      ) : (
        <>
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase text-base-content/60">
                {target.target_type}
                {target.vendor ? ` · ${target.vendor}` : ""}
                {target.group_name ? ` · ${target.group_name}` : ""}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                {target.name}
              </h1>
              <p className="mt-1 text-sm text-base-content/70">
                {target.address}
              </p>
            </div>
            {canManage && (
              <button className="btn btn-primary" onClick={openNewItem}>
                <MdAdd size={20} />
                Add check
              </button>
            )}
          </header>

          {formOpen && canManage && (
            <form
              className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-5"
              onSubmit={saveItem}
            >
              <h2 className="text-lg font-semibold">
                {editingItem ? "Edit check" : "Add monitored check"}
              </h2>
              <MonitoredItemFields item={itemForm} onChange={setItemForm} />
              <label className="form-control">
                <span className="label-text">Thresholds (JSON)</span>
                <textarea
                  className="textarea textarea-bordered font-mono"
                  rows="2"
                  value={thresholdText}
                  onChange={(event) => setThresholdText(event.target.value)}
                  aria-describedby="threshold-help"
                />
                <span id="threshold-help" className="label-text-alt">
                  Stored for threshold alert policies; threshold alerts are not
                  part of Phase 1.
                </span>
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={saving}
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save check"}
                </button>
              </div>
            </form>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Current checks</h2>
            {target.monitored_items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-base-300 py-8 text-center text-base-content/70">
                No checks are configured for this target.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {target.monitored_items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-base-300 bg-base-100 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <StatusDot status={item.state} />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-base-content/70">
                          {item.check_type.toUpperCase()} · every{" "}
                          {item.interval_seconds}s
                          {!item.enabled ? " · disabled" : ""}
                        </div>
                        <div className="mt-2 text-xs text-base-content/60">
                          {item.state} · {item.latency_ms ?? "—"} ms · last
                          checked {formatTime(item.last_checked_at)}
                        </div>
                        {item.last_error && (
                          <div className="mt-1 break-words text-xs text-error">
                            {item.last_error}
                          </div>
                        )}
                      </div>
                      {canManage && (
                        <div className="flex">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => openEditItem(item)}
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square text-error"
                            aria-label={`Delete ${item.name}`}
                            onClick={() => removeItem(item)}
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Hourly history · last 24h</h2>
            {target.history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-base-300 py-8 text-center text-base-content/70">
                No check results have been recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Hour</th>
                      <th>Check</th>
                      <th>Checks</th>
                      <th>Successes</th>
                      <th>Failures</th>
                      <th>Avg latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {target.history.map((result) => (
                      <tr key={`${result.item_id}-${result.bucket_at}`}>
                        <td>{formatTime(result.bucket_at)}</td>
                        <td>{itemsById.get(String(result.item_id))?.name || "Check"}</td>
                        <td>{result.checks}</td>
                        <td className="text-success">{result.successes}</td>
                        <td className="text-error">{result.failures}</td>
                        <td>{result.average_latency_ms ?? "—"} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Recent checks</h2>
            {target.recent_results.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Checked</th>
                      <th>Check</th>
                      <th>Result</th>
                      <th>Latency</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {target.recent_results.map((result) => (
                      <tr key={result.id}>
                        <td>{formatTime(result.checked_at)}</td>
                        <td>{itemsById.get(String(result.item_id))?.name || "Check"}</td>
                        <td>
                          <span className={result.succeeded ? "text-success" : "text-error"}>
                            {result.succeeded ? "Success" : "Failure"}
                          </span>
                        </td>
                        <td>{result.latency_ms ?? "—"} ms</td>
                        <td className="max-w-sm truncate">
                          {result.error ||
                            JSON.stringify(result.observed_value || {})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {target.recent_results.length === 0 && (
              <div className="rounded-xl border border-dashed border-base-300 py-8 text-center text-base-content/70">
                No recent checks.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
