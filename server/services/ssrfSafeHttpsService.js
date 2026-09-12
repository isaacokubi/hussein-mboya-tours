import https from "https";
import dns from "dns/promises";
import net from "net";

const MAX_RESPONSE_BYTES = 256 * 1024;

const isPrivateAddress = (address) => {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168)) || (a === 198 && (b === 18 || b === 19));
  }
  if (net.isIPv6(address)) {
    const value = address.toLowerCase();
    return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:") || value.startsWith("ff");
  }
  return true;
};

const resolvePublicAddress = async (hostname) => {
  const records = net.isIP(hostname)
    ? [{ address: hostname, family: net.isIP(hostname) }]
    : await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some(({ address }) => isPrivateAddress(address))) throw new Error("Webhook URL resolves to a private or local address.");
  return records[0];
};

export async function postJsonToPinnedHttpsUrl(rawUrl, body, options = {}) {
  const parsed = new URL(String(rawUrl || ""));
  if (parsed.protocol !== "https:") throw new Error("Webhook URL must use HTTPS.");
  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const { address, family } = await resolvePublicAddress(hostname);
  const timeoutMs = Number(options.timeoutMs || 10000);
  const headers = { ...(options.headers || {}), "content-length": Buffer.byteLength(body, "utf8") };

  return new Promise((resolve, reject) => {
    const request = https.request({
      protocol: "https:",
      hostname,
      port: parsed.port || 443,
      path: `${parsed.pathname || "/"}${parsed.search || ""}`,
      method: "POST",
      headers,
      servername: hostname,
      lookup: (_hostname, _options, callback) => callback(null, address, family),
      timeout: timeoutMs,
    }, (response) => {
      const chunks = [];
      let size = 0;
      response.on("data", (chunk) => {
        size += chunk.length;
        if (size <= MAX_RESPONSE_BYTES) chunks.push(chunk);
        else request.destroy(new Error("Webhook response exceeds the maximum allowed size."));
      });
      response.on("end", () => {
        const responseText = Buffer.concat(chunks).toString("utf8");
        resolve({ status: response.statusCode || 0, headers: response.headers, body: responseText });
      });
      response.on("error", reject);
    });
    request.on("timeout", () => request.destroy(new Error("Webhook request timed out.")));
    request.on("error", reject);
    request.write(body);
    request.end();
  });
}
