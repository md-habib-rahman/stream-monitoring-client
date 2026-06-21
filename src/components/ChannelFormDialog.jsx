import { useState, useEffect, useRef } from "react";
import { MdCloudUpload, MdImage } from "react-icons/md";
import { uploadLogo } from "../services/uploadApi";

export default function ChannelFormDialog({ open, onClose, onSave, channel }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    if (channel) {
      setForm(channel);
    } else {
      setForm({
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
      });
    }
  }, [channel, open]);

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
    } catch (err) {
      console.error(err);
      alert("Logo upload failed");
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
      {/* Expanded max-width to accommodate the grid layout */}
      <div className="modal-box max-w-3xl p-0 overflow-hidden">
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-base-200 bg-base-100/50">
          <h3 className="font-bold text-2xl text-base-content">
            {channel ? "Edit Channel Configuration" : "New Channel Setup"}
          </h3>
          <p className="text-sm text-base-content/60 mt-1">
            Configure the streaming parameters and identity for this channel.
          </p>
        </div>

        {/* Form Body Section */}
        <div className="px-8 py-6 bg-base-100">
          {/* Logo Upload UI */}
          <div className="mb-8 p-5 rounded-2xl border border-base-200 bg-base-200/30 flex items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-xl bg-base-100 border border-base-300 shadow-sm flex items-center justify-center overflow-hidden">
                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <MdImage className="w-8 h-8 text-base-content/20" />
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-base-100/80 flex items-center justify-center rounded-xl">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">Channel Branding</h4>
              <p className="text-xs text-base-content/60 mb-3">
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
                className="btn btn-sm btn-outline btn-primary shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <MdCloudUpload className="w-4 h-4 mr-1" />
                {form.logo_url ? "Replace Image" : "Upload Image"}
              </button>
            </div>
          </div>

          {/* Input Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Full Width Row */}
            <label className="form-control w-full md:col-span-2">
              <div className="label pb-1">
                <span className="label-text font-semibold text-base-content/80">
                  Channel Name
                </span>
              </div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-colors"
                placeholder="e.g., Main Broadcast Feed"
              />
            </label>

            {/* URL Pair Row */}
            <label className="form-control w-full">
              <div className="label pb-1">
                <span className="label-text font-semibold text-base-content/80">
                  Stream URL (HLS/RTMP)
                </span>
              </div>
              <input
                type="text"
                name="url"
                value={form.url}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-colors font-mono text-sm"
                placeholder="rtmp://..."
              />
            </label>

            <label className="form-control w-full">
              <div className="label pb-1">
                <span className="label-text font-semibold text-base-content/80">
                  Preview URL (Optional)
                </span>
              </div>
              <input
                type="text"
                name="preview_url"
                value={form.preview_url}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-colors font-mono text-sm"
                placeholder="https://..."
              />
            </label>

            {/* Metadata Rows */}
            <label className="form-control w-full">
              <div className="label pb-1">
                <span className="label-text font-semibold text-base-content/80">
                  Category
                </span>
              </div>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-colors"
                placeholder="e.g., Sports, News"
              />
            </label>

            <label className="form-control w-full">
              <div className="label pb-1">
                <span className="label-text font-semibold text-base-content/80">
                  Broadcaster
                </span>
              </div>
              <input
                type="text"
                name="broadcaster"
                value={form.broadcaster}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-colors"
                placeholder="Enter broadcaster"
              />
            </label>

            <label className="form-control w-full">
              <div className="label pb-1">
                <span className="label-text font-semibold text-base-content/80">
                  Location
                </span>
              </div>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary transition-colors"
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
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-base-200 bg-base-100/50 flex justify-end gap-3">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary min-w-[120px]"
            onClick={() => onSave(form)}
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
