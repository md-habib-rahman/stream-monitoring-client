export function defaultCheckConfig(checkType) {
  switch (checkType) {
    case "tcp":
      return { port: 443 };
    case "http":
      return { protocol: "https", path: "/" };
    case "dns":
      return { recordType: "A" };
    case "tls":
      return { port: 443 };
    default:
      return {};
  }
}
