import { useEffect, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";

import {
  getChannels,
  createChannel,
  updateChannel,
  setChannelEnabled,
  deleteChannel,
} from "../../services/channelApi";
import { canManageFeatures, getUserRole } from "../../utils/auth";
import {
  confirmAction,
  showError,
  showSuccess,
} from "../../utils/notifications";
import ChannelFormDialog from "../ChannelFormDialog";
import TbsDeviceManagement from "./TbsDeviceManagement";

export default function ChannelManagement() {
  const canManage = canManageFeatures();
  const canManageTbs = getUserRole() === "SUPER_ADMIN";
  const [channels, setChannels] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingChannels, setUpdatingChannels] = useState(() => new Set());

  const loadChannels = async () => {
    try {
      const data = await getChannels();
      setChannels(data);
    } catch (err) {
      showError(err.response?.data?.error || "Failed to load channels.");
    }
  };

  //   console.log(channels);

  useEffect(() => {
    let active = true;
    getChannels()
      .then((data) => {
        if (active) setChannels(data);
      })
      .catch((err) => {
        if (active) showError(err.response?.data?.error || "Failed to load channels.");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAdd = () => {
    setEditingChannel(null);
    setDialogOpen(true);
  };

  const handleEdit = (channel) => {
    setEditingChannel(channel);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "Delete channel?",
      text: "This channel will be permanently deleted.",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteChannel(id);
      showSuccess("Channel deleted.");
      await loadChannels();
    } catch (error) {
      showError(error.response?.data?.error || "Failed to delete channel.");
    }
  };

  const handleMonitoringToggle = async (channel, enabled) => {
    setUpdatingChannels((current) => new Set(current).add(channel.id));

    try {
      const updatedChannel = await setChannelEnabled(channel.id, enabled);
      setChannels((current) =>
        current.map((item) =>
          item.id === channel.id ? updatedChannel : item,
        ),
      );
      showSuccess(`Monitoring ${enabled ? "enabled" : "disabled"} for ${channel.name}.`);
    } catch (err) {
      showError(
        err.response?.data?.error || "Failed to update monitoring status.",
      );
    } finally {
      setUpdatingChannels((current) => {
        const next = new Set(current);
        next.delete(channel.id);
        return next;
      });
    }
  };

  const handleSave = async (form) => {
    const channelData = { ...form };
    if (!canManageTbs) {
      delete channelData.tbs_mappings;
    }

    try {
      if (editingChannel) {
        await updateChannel(editingChannel.id, channelData);
      } else {
        await createChannel(channelData);
      }

      setDialogOpen(false);
      setEditingChannel(null);
      showSuccess(editingChannel ? "Channel updated." : "Channel created.");
      await loadChannels();
    } catch (error) {
      showError(
        error.response?.data?.error || "Failed to save channel configuration.",
      );
    }
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 mt-6">
        <h2 className="text-2xl font-semibold">Channel Management</h2>

        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search channel..."
            className="input input-bordered w-full md:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {canManage && (
            <button className="btn btn-primary" onClick={handleAdd}>
              Add Channel
            </button>
          )}
        </div>
      </div>

      {canManageTbs && <TbsDeviceManagement />}

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Broadcaster</th>
              <th>Location</th>
              <th>Min Bitrate</th>
              <th>Category</th>
              <th>Monitoring</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filteredChannels.map((channel) => (
              <tr key={channel.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img src={channel.logo_url} alt={channel.name} />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{channel.name}</div>
                      <div className="text-sm opacity-50">
                        {channel.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{channel.broadcaster}</td>
                <td>{channel.location}</td>
                <td>{channel.min_bitrate}</td>
                <td>{channel.category}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {canManage && (
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={channel.enabled === true}
                        disabled={updatingChannels.has(channel.id)}
                        onChange={(event) =>
                          handleMonitoringToggle(channel, event.target.checked)
                        }
                        aria-label={`${channel.enabled ? "Disable" : "Enable"} monitoring for ${channel.name}`}
                      />
                    )}
                    <span>{channel.enabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </td>
                {canManage && (
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-ghost btn-sm btn-square text-info"
                        onClick={() => handleEdit(channel)}
                        title="Edit"
                      >
                        <MdEdit size={20} />
                      </button>

                      <button
                        className="btn btn-ghost btn-sm btn-square text-error"
                        onClick={() => handleDelete(channel.id)}
                        title="Delete"
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {/* Optional: Clean empty state if the channels array is empty */}
            {filteredChannels.length === 0 && (
              <tr>
                <td
                  colSpan={canManage ? 7 : 6}
                  className="text-center py-8 text-neutral-content"
                >
                  No channels found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {canManage && dialogOpen && (
        <ChannelFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          channel={editingChannel}
          canManageTbs={canManageTbs}
        />
      )}
    </>
  );
}
