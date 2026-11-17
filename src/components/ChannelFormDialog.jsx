import { useState, useEffect, useRef } from "react";
import { MdCloudUpload, MdImage } from "react-icons/md";
import { uploadLogo } from "../services/uploadApi";
import { getTbsDevices, getTbsStreams } from "../services/tbsApi";
import { showError, showSuccess } from "../utils/notifications";

function getInitialForm(channel) {
  return {
    name: "",
    url: "",
    broadcaster: "",
    location: "",
    min_bitrate: 1500,
    category: "",
    priority: "normal",
    owner_team: "",
    logo_url: "",
    preview_url: "",
    ...channel,
    tbs_mappings: (channel?.tbs_mappings || []).map((mapping) => ({
      ...mapping,
      _key: String(mapping.id),
    })),
  };
}

function TbsMappingRow({ mapping, devices, onChange, onRemove }) {
  const [streams, setStreams] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mapping.tbs_device_id) return undefined;

    const controller = new AbortController();
    let active = true;
    getTbsStreams(mapping.tbs_device_id, mapping.tbs_mod || "cdn", {
      signal: controller.signal,
    })
      .then((data) => {
        if (active) {
          setStreams(data.streams);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active && requestError.name !== "CanceledError") {
          setStreams([]);
          const message =
            requestError.response?.data?.error || "Failed to load TBS streams.";
          setError(message);
          showError(message);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [mapping.tbs_device_id, mapping.tbs_mod]);

  return (
    <div className="rounded-lg bg-base-200/50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-base-content/70">
          Rendition mapping
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-xs text-error"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="form-control">
          <span className="label-text mb-1 text-[11px]">Label</span>
          <input
            className="input input-sm input-bordered"
            value={mapping.label}
            required
            maxLength={120}
            placeholder="e.g. 720p Main"
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </label>
        <label className="form-control">
          <span className="label-text mb-1 text-[11px]">TBS device</span>
          <select
            className="select select-sm select-bordered"
            value={mapping.tbs_device_id || ""}
            required
            onChange={(event) =>
              onChange({
                tbs_device_id: event.target.value,
                tbs_mid: "",
              })
            }
          >
            <option value="">Select device</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id} disabled={!device.isActive}>
                {device.name}
                {!device.isActive ? " (inactive)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text mb-1 text-[11px]">Module</span>
          <select
            className="select select-sm select-bordered"
            value={mapping.tbs_mod || "cdn"}
            disabled={!mapping.tbs_device_id}
            onChange={(event) =>
              onChange({
                tbs_mod: event.target.value,
                tbs_mid: "",
              })
            }
          >
            {["cdn", "mpi", "srt", "tus", "pus", "out"].map((mod) => (
              <option key={mod} value={mod}>
                {mod.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text mb-1 text-[11px]">TBS stream</span>
          <select
            className="select select-sm select-bordered"
            value={mapping.tbs_mid || ""}
            disabled={!mapping.tbs_device_id || streams === null || Boolean(error)}
            required
            onChange={(event) => onChange({ tbs_mid: event.target.value })}
          >
            <option value="">
              {!mapping.tbs_device_id
                ? "Choose a device"
                : streams === null
                  ? "Loading streams…"
                  : error
                    ? "Unable to load"
                      : streams.length === 0
                        ? "No streams found"
                        : "Select stream"}
            </option>
            {mapping.tbs_mid &&
              !streams?.some((stream) => stream.mid === mapping.tbs_mid) && (
                <option value={mapping.tbs_mid}>
                  Current stream ({mapping.tbs_mid})
                </option>
              )}
            {(streams || []).map((stream) => (
              <option key={stream.mid} value={stream.mid}>
                {stream.name} ({stream.mid})
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export default function ChannelFormDialog({
  open,
  onClose,
  onSave,
  channel,
  canManageTbs = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [tbsDevices, setTbsDevices] = useState([]);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(() => getInitialForm(channel));

  useEffect(() => {
    if (!open || !canManageTbs) return undefined;
    let active = true;
    getTbsDevices()
      .then((devices) => {
        if (active) setTbsDevices(devices);
      })
      .catch((error) => {
        if (active) {
          showError(
            error.response?.data?.error || "Failed to load TBS devices.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [open, canManageTbs]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadLogo(file);
      setForm((prev) => ({
        ...prev,
        logo_url: result.url,
      }));
      showSuccess("Logo uploaded.");
    } catch (err) {
      showError(err.response?.data?.error || "Logo upload failed.");
    } finally {
      setUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  if (!open) return null;

  return (
    <dialog className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box max-h-[90vh] max-w-2xl overflow-hidden p-0">
        {/* Header Section */}
        <div className="border-b border-base-200 bg-base-100/50 px-5 py-3">
          <h3 className="text-lg font-bold text-base-content">
            {channel ? "Edit Channel Configuration" : "New Channel Setup"}
          </h3>
          <p className="mt-0.5 text-xs text-base-content/60">
            Configure the streaming parameters and identity for this channel.
          </p>
        </div>

        {/* Form Body Section */}
        <div className="max-h-[calc(90vh-7.5rem)] overflow-y-auto bg-base-100 px-5 py-4">
          {/* Logo Upload UI */}
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-base-200 bg-base-200/30 p-3">
            <div className="relative group shrink-0">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <MdImage className="h-6 w-6 text-base-content/20" />
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-base-100/80">
                  <span className="loading loading-spinner loading-sm text-primary" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="mb-0.5 text-sm font-semibold">Channel Branding</h4>
              <p className="mb-2 text-[11px] text-base-content/60">
                Upload a square, high-resolution logo (PNG or SVG recommended).
              </p>

              {/* Hidden file input, triggered by custom button */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleLogoUpload}
              />
              <button
                className="btn btn-xs btn-outline btn-primary shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <MdCloudUpload className="mr-1 h-3.5 w-3.5" />
                {form.logo_url ? "Replace Image" : "Upload Image"}
              </button>
            </div>
          </div>

          {/* Input Grid Layout */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 md:grid-cols-2">
            {/* Full Width Row */}
            <label className="form-control w-full md:col-span-2">
              <div className="label py-0.5">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Channel Name
                </span>
              </div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input input-sm input-bordered w-full transition-colors focus:input-primary"
                placeholder="e.g., Main Broadcast Feed"
              />
            </label>

            {/* URL Pair Row */}
            <label className="form-control w-full">
              <div className="label py-0.5">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Stream URL (HLS/RTMP)
                </span>
              </div>
              <input
                type="text"
                name="url"
                value={form.url}
                onChange={handleChange}
                className="input input-sm input-bordered w-full font-mono text-xs transition-colors focus:input-primary"
                placeholder="rtmp://..."
              />
            </label>

            <label className="form-control w-full">
              <div className="label py-0.5">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Preview URL (Optional)
                </span>
              </div>
              <input
                type="text"
                name="preview_url"
                value={form.preview_url}
                onChange={handleChange}
                className="input input-sm input-bordered w-full font-mono text-xs transition-colors focus:input-primary"
                placeholder="https://..."
              />
            </label>

            {/* Metadata Rows */}
            <label className="form-control w-full">
              <div className="label py-0.5">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Category
                </span>
              </div>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input input-sm input-bordered w-full transition-colors focus:input-primary"
                placeholder="e.g., Sports, News"
              />
            </label>

            <label className="form-control w-full">
              <div className="label py-0.5">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Broadcaster
                </span>
              </div>
              <input
                type="text"
                name="broadcaster"
                value={form.broadcaster}
                onChange={handleChange}
                className="input input-sm input-bordered w-full transition-colors focus:input-primary"
                placeholder="Enter broadcaster"
              />
            </label>

            <label className="form-control w-full">
              <div className="label py-0.5">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Location
                </span>
              </div>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input input-sm input-bordered w-full transition-colors focus:input-primary"
                placeholder="Server region or city"
              />
            </label>

            <label className="form-control w-full">
              <div className="label pb-1">
                <span className="label-text font-semibold text-base-content/80">
                  Minimum Bitrate (Kbps)
                </span>
              </div>
              <input
                type="number"
                name="min_bitrate"
                value={form.min_bitrate}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-colors"
              />
            </label>

            {canManageTbs && (
              <section className="rounded-xl border border-base-300 p-3 md:col-span-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold">TBS renditions</h4>
                    <p className="text-[11px] text-base-content/60">
                      Map each rendition to the device and stream that provides
                      it.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        tbs_mappings: [
                          ...current.tbs_mappings,
                          {
                            _key: `new-${Date.now()}-${Math.random()}`,
                            label: "",
                            tbs_device_id: "",
                            tbs_mid: "",
                            tbs_mod: "cdn",
                          },
                        ],
                      }))
                    }
                  >
                    Add rendition
                  </button>
                </div>
                {form.tbs_mappings.length === 0 ? (
                  <p className="rounded-lg bg-base-200/50 px-3 py-4 text-center text-xs text-base-content/60">
                    No TBS renditions mapped. Add one for each device stream
                    used by this channel.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.tbs_mappings.map((mapping) => (
                      <TbsMappingRow
                        key={`${mapping._key}-${mapping.tbs_device_id}-${mapping.tbs_mod}`}
                        mapping={mapping}
                        devices={tbsDevices}
                        onChange={(changes) =>
                          setForm((current) => ({
                            ...current,
                            tbs_mappings: current.tbs_mappings.map((item) =>
                              item._key === mapping._key
                                ? { ...item, ...changes }
                                : item,
                            ),
                          }))
                        }
                        onRemove={() =>
                          setForm((current) => ({
                            ...current,
                            tbs_mappings: current.tbs_mappings.filter(
                              (item) => item._key !== mapping._key,
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                )}

              </section>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 border-t border-base-200 bg-base-100/50 px-5 py-3">
          <button className="btn btn-sm btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-sm btn-primary min-w-[120px]"
            onClick={() =>
              onSave({
                ...form,
                tbs_mappings: form.tbs_mappings.map((mapping) => {
                  const savedMapping = { ...mapping };
                  delete savedMapping.id;
                  delete savedMapping._key;
                  return savedMapping;
                }),
              })
            }
          >
            Save Configuration
          </button>
        </div>
      </div>

      <form
        method="dialog"
        className="modal-backdrop bg-neutral/40 transition-opacity"
      >
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
