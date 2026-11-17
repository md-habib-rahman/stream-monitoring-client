import { useEffect, useState } from "react";
import {
  addAlertRecipient,
  deleteAlertRecipient,
  getAlertRecipients,
} from "../services/alertRecipientApi";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../utils/notifications";

function getErrorMessage(error) {
  return error.response?.data?.error || "Alert recipient request failed.";
}

export default function AlertRecipientsPage() {
  const [recipients, setRecipients] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRecipients = async () => {
    try {
      setRecipients(await getAlertRecipients());
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getAlertRecipients()
      .then((data) => {
        if (active) setRecipients(data);
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

  const handleAdd = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await addAlertRecipient(email);
      setEmail("");
      showSuccess("Alert email recipient added.");
      await loadRecipients();
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recipient) => {
    const confirmed = await confirmAction({
      title: "Remove alert recipient?",
      text: `Remove ${recipient.email} from alert emails?`,
      confirmText: "Remove",
    });
    if (!confirmed) return;

    try {
      await deleteAlertRecipient(recipient.id);
      setRecipients((current) =>
        current.filter((item) => item.id !== recipient.id),
      );
      showSuccess("Alert email recipient removed.");
    } catch (requestError) {
      showError(getErrorMessage(requestError));
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Alert email recipients</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Every address listed here receives HLS monitoring alert emails.
        </p>
      </header>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-box bg-base-100 p-5 shadow-sm sm:flex-row"
      >
        <label className="form-control flex-1">
          <span className="label-text mb-1">Email address</span>
          <input
            type="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            placeholder="alerts@example.com"
            required
          />
        </label>
        <button className="btn btn-primary self-end" disabled={saving}>
          {saving && <span className="loading loading-spinner loading-sm" />}
          Add recipient
        </button>
      </form>

      <div className="overflow-x-auto rounded-box bg-base-100 shadow-sm">
        <table className="table">
          <thead>
            <tr>
              <th>Email address</th>
              <th>Added</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {recipients.map((recipient) => (
              <tr key={recipient.id}>
                <td className="font-medium">{recipient.email}</td>
                <td>
                  {recipient.created_at
                    ? new Date(recipient.created_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => handleDelete(recipient)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!loading && recipients.length === 0 && (
              <tr>
                <td colSpan="3" className="py-8 text-center opacity-60">
                  No alert email recipients configured.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan="3" className="py-8 text-center">
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
