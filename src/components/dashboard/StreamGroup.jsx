import StreamCard from "./StreamCard";

export default function StreamGroup({ title, streams, onChannelClick }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>

        <div className="badge badge-primary">{streams.length} Channels</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {streams.map((stream) => (
          <div key={stream.id}>
            <StreamCard stream={stream} onClick={onChannelClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
