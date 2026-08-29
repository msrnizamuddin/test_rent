import { createRequire } from "module";
const require = createRequire(import.meta.url);
const geoip = require("geoip-lite");

const fakeReq = {
  headers: {
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "accept-language": "en-US,en;q=0.9",
    referer: "http://localhost/",
    "x-forwarded-for": "203.0.113.5",
  },
  method: "GET",
  originalUrl: "/api/v1/userTracking/ping",
  protocol: "http",
  get: (header) => {
    if (header === "host") return "localhost:8000";
    return undefined;
  },
  socket: { remoteAddress: "203.0.113.5" },
  ip: "203.0.113.5",
};

const parserResult = {
  browser: { name: "Chrome", version: "115" },
  os: { name: "Linux", version: "" },
  device: { type: "desktop", vendor: "", model: "" },
};

const ip =
  fakeReq.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  fakeReq.headers["x-real-ip"] ||
  fakeReq.socket.remoteAddress ||
  fakeReq.ip;

const geo = geoip.lookup(ip);

const trackingData = {
  userId: null,
  ip,
  userAgent: fakeReq.headers["user-agent"],
  browserName: parserResult.browser.name,
  browserVersion: parserResult.browser.version,
  osName: parserResult.os.name,
  osVersion: parserResult.os.version,
  deviceType: parserResult.device.type,
  deviceVendor: parserResult.device.vendor,
  deviceModel: parserResult.device.model,
  country: geo?.country || "",
  city: geo?.city || "",
  language: fakeReq.headers["accept-language"]?.split(",")[0] || "",
  timezone: "",
  currentUrl: `${fakeReq.protocol}://${fakeReq.get("host")}${fakeReq.originalUrl}`,
  referrer: fakeReq.headers["referer"] || "",
  eventType: "page_view",
  eventName: fakeReq.originalUrl,
  metadata: { method: fakeReq.method },
};

fakeReq.tracking = trackingData;

console.log("REQ.TRACKING:", JSON.stringify(fakeReq.tracking, null, 2));

