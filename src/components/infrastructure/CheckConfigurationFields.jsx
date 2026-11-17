import { defaultCheckConfig } from "./checkDefaults";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT"];

export default function CheckConfigurationFields({
  checkType,
  config,
  onChange,
}) {
  const update = (key, value) => onChange({ ...config, [key]: value });

  if (checkType === "icmp") {
    return (
      <p className="text-sm opacity-70">
        Sends one ICMP echo request to the target address.
      </p>
    );
  }

  if (checkType === "tcp" || checkType === "tls") {
    return (
      <label className="form-control">
        <span className="label-text">Port</span>
        <input
          required
          type="number"
          min="1"
          max="65535"
          className="input input-bordered"
          value={config.port || ""}
          onChange={(event) => update("port", Number(event.target.value))}
        />
      </label>
    );
  }

  if (checkType === "http") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="form-control">
          <span className="label-text">Protocol</span>
          <select
            className="select select-bordered"
            value={config.protocol || "https"}
            onChange={(event) => update("protocol", event.target.value)}
          >
            <option value="https">HTTPS</option>
            <option value="http">HTTP</option>
          </select>
        </label>
        <label className="form-control">
          <span className="label-text">Path</span>
          <input
            required
            className="input input-bordered"
            value={config.path || "/"}
            onChange={(event) => update("path", event.target.value)}
          />
        </label>
      </div>
    );
  }

  if (checkType === "dns") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="form-control">
          <span className="label-text">Record type</span>
          <select
            className="select select-bordered"
            value={config.recordType || "A"}
            onChange={(event) => update("recordType", event.target.value)}
          >
            {RECORD_TYPES.map((recordType) => (
              <option key={recordType} value={recordType}>
                {recordType}
              </option>
            ))}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text">Hostname (optional)</span>
          <input
            className="input input-bordered"
            value={config.hostname || ""}
            onChange={(event) => update("hostname", event.target.value)}
            placeholder="Uses target address by default"
          />
        </label>
      </div>
    );
  }

  return null;
}

export function MonitoredItemFields({ item, onChange }) {
  const change = (key, value) => onChange({ ...item, [key]: value });
  const changeType = (checkType) =>
    onChange({
      ...item,
      check_type: checkType,
      name: `${checkType.toUpperCase()} availability`,
      interval_seconds: checkType === "icmp" ? 30 : 60,
      check_config: defaultCheckConfig(checkType),
    });

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="form-control">
          <span className="label-text">Check name</span>
          <input
            required
            maxLength="160"
            className="input input-bordered"
            value={item.name}
            onChange={(event) => change("name", event.target.value)}
          />
        </label>
        <label className="form-control">
          <span className="label-text">Check type</span>
          <select
            className="select select-bordered"
            value={item.check_type}
            onChange={(event) => changeType(event.target.value)}
          >
            <option value="icmp">ICMP ping</option>
            <option value="tcp">TCP port</option>
            <option value="http">HTTP(S)</option>
            <option value="dns">DNS</option>
            <option value="tls">TLS certificate</option>
          </select>
        </label>
      </div>

      <CheckConfigurationFields
        checkType={item.check_type}
        config={item.check_config}
        onChange={(check_config) => change("check_config", check_config)}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="form-control">
          <span className="label-text">Interval (seconds)</span>
          <input
            required
            type="number"
            min={item.check_type === "icmp" ? "20" : "10"}
            max={item.check_type === "icmp" ? "30" : "86400"}
            className="input input-bordered"
            value={item.interval_seconds}
            onChange={(event) =>
              change("interval_seconds", Number(event.target.value))
            }
          />
        </label>
        <label className="form-control">
          <span className="label-text">Failures to go down</span>
          <input
            required
            type="number"
            min="1"
            max="20"
            className="input input-bordered"
            value={item.failure_threshold}
            onChange={(event) =>
              change("failure_threshold", Number(event.target.value))
            }
          />
        </label>
        <label className="form-control">
          <span className="label-text">Successes to recover</span>
          <input
            required
            type="number"
            min="1"
            max="20"
            className="input input-bordered"
            value={item.success_threshold}
            onChange={(event) =>
              change("success_threshold", Number(event.target.value))
            }
          />
        </label>
      </div>
      <label className="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          className="checkbox checkbox-primary"
          checked={item.enabled}
          onChange={(event) => change("enabled", event.target.checked)}
        />
        <span className="label-text">Monitoring enabled</span>
      </label>
    </>
  );
}
