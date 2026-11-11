/**
 * Purpose: ssrf Safe Https Service business-logic service. Main declarations: isPrivateAddress, resolvePublicAddress, postJsonToPinnedHttpsUrl.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import https from "https";
// Load dns/promises so this module can use its exported dependencies.
import dns from "dns/promises";
// Load net so this module can use its exported dependencies.
import net from "net";

// Declare MAX_RESPONSE_BYTES for use by the surrounding module or function.
const MAX_RESPONSE_BYTES = 256 * 1024;

// Declare isPrivateAddress for use by the surrounding module or function.
const isPrivateAddress = (address) => {
  // Check the condition (net.isIPv4(address)) and run the matching branch.
  if (net.isIPv4(address)) {
    // Declare [a, b] for use by the surrounding module or function.
    const [a, b] = address.split(".").map(Number);
    // Return the expression shown below to the caller.
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168)) || (a === 198 && (b === 18 || b === 19));
  }
  // Check the condition (net.isIPv6(address)) and run the matching branch.
  if (net.isIPv6(address)) {
    // Declare value for use by the surrounding module or function.
    const value = address.toLowerCase();
    // Return the expression shown below to the caller.
    return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:") || value.startsWith("ff");
  }
  // Return the expression shown below to the caller.
  return true;
};

// Declare resolvePublicAddress for use by the surrounding module or function.
const resolvePublicAddress = async (hostname) => {
  // Declare records for use by the surrounding module or function.
  const records = net.isIP(hostname)
    ? [{ address: hostname, family: net.isIP(hostname) }]
    : await dns.lookup(hostname, { all: true, verbatim: true });
  // Check the condition (!records.length || records.some(({ address }) => isPrivateAddress(addr) and run the matching branch.
  if (!records.length || records.some(({ address }) => isPrivateAddress(address))) throw new Error("Webhook URL resolves to a private or local address.");
  // Return the expression shown below to the caller.
  return records[0];
};

// Define postJsonToPinnedHttpsUrl; its parameters and body implement this operation.
export async function postJsonToPinnedHttpsUrl(rawUrl, body, options = {}) {
  // Declare parsed for use by the surrounding module or function.
  const parsed = new URL(String(rawUrl || ""));
  // Check the condition (parsed.protocol !== "https:") and run the matching branch.
  if (parsed.protocol !== "https:") throw new Error("Webhook URL must use HTTPS.");
  // Declare hostname for use by the surrounding module or function.
  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  // Declare { address, family } for use by the surrounding module or function.
  const { address, family } = await resolvePublicAddress(hostname);
  // Declare timeoutMs for use by the surrounding module or function.
  const timeoutMs = Number(options.timeoutMs || 10000);
  // Declare headers for use by the surrounding module or function.
  const headers = { ...(options.headers || {}), "content-length": Buffer.byteLength(body, "utf8") };

  // Return a new Promise instance to the caller.
  return new Promise((resolve, reject) => {
    // Declare request for use by the surrounding module or function.
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
      // Declare chunks for use by the surrounding module or function.
      const chunks = [];
      // Declare size for use by the surrounding module or function.
      let size = 0;
      // Perform the side effect or state update expressed on the following line.
      response.on("data", (chunk) => {
        // Perform the side effect or state update expressed on the following line.
        size += chunk.length;
        // Check the condition (size <= MAX_RESPONSE_BYTES) and run the matching branch.
        if (size <= MAX_RESPONSE_BYTES) chunks.push(chunk);
        else request.destroy(new Error("Webhook response exceeds the maximum allowed size."));
      });
      // Perform the side effect or state update expressed on the following line.
      response.on("end", () => {
        // Declare responseText for use by the surrounding module or function.
        const responseText = Buffer.concat(chunks).toString("utf8");
        // Perform the side effect or state update expressed on the following line.
        resolve({ status: response.statusCode || 0, headers: response.headers, body: responseText });
      });
      // Perform the side effect or state update expressed on the following line.
      response.on("error", reject);
    });
    // Perform the side effect or state update expressed on the following line.
    request.on("timeout", () => request.destroy(new Error("Webhook request timed out.")));
    // Perform the side effect or state update expressed on the following line.
    request.on("error", reject);
    // Perform the side effect or state update expressed on the following line.
    request.write(body);
    // Perform the side effect or state update expressed on the following line.
    request.end();
  });
}
