import { useEffect, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";

import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} from "../../services/channelApi";
import ChannelFormDialog from "../ChannelFormDialog";

export default function ChannelManagement() {
  const [channels, setChannels] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);

  const loadChannels = async () => {
    try {
      const data = await getChannels();
      setChannels(data);
    } catch (err) {
      console.error(err);
    }
  };

  console.log(channels);

  useEffect(() => {
    loadChannels();
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
    const confirmed = window.confirm("Delete this channel?");
    if (!confirmed) return;

    await deleteChannel(id);
    await loadChannels();
  };

  const handleSave = async (form) => {
    console.log(form);
    if (editingChannel) {
      await updateChannel(editingChannel.id, form);
    } else {
      await createChannel(form);
    }

    setDialogOpen(false);
    setEditingChannel(null);
    await loadChannels();
  };

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-4 mt-6">
        <h2 className="text-2xl font-semibold">Channel Management</h2>

        <button className="btn btn-primary" onClick={handleAdd}>
          Add Channel
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 rounded-box shadow">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Broadcaster</th>
              <th>Location</th>
              <th>Min Bitrate</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {channels.map((channel) => (
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
              </tr>
            ))}

            {/* Optional: Clean empty state if the channels array is empty */}
            {channels.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-neutral-content"
                >
                  No channels found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ChannelFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        channel={editingChannel}
      />
    </>
  );
}
