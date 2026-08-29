import * as UA from "ua-parser-js";
const UAParser = UA?.default || UA?.UAParser || UA;
import geoip from "geoip-lite";
import UserTracking from "../modules/userTracking/model/userTracking.model.js";

export const userTrackingMiddleware = async (
  req,
  res,
  next
) => {
  try {
    // Skip health checks and static files
    if (
      req.originalUrl.includes("/ping") ||
      req.originalUrl.includes("/favicon.ico") ||
      req.originalUrl.includes("/userTracking")
    ) {
      return next();
    }

    const userAgent =
      req.headers["user-agent"] || "";

    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Real client IP
    const ip =
      req.headers["x-forwarded-for"]
        ?.split(",")[0]
        ?.trim() ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress ||
      req.ip;

    // Geo lookup
    const geo = geoip.lookup(ip);

    const trackingData = {
      // If auth middleware adds req.user
      userId: req.user?._id || null,

      // Network
      ip,

      // Browser
      userAgent,
      browserName:
        result.browser.name || "",
      browserVersion:
        result.browser.version || "",

      // OS
      osName: result.os.name || "",
      osVersion: result.os.version || "",

      // Device
      deviceType:
        result.device.type || "desktop",
      deviceVendor:
        result.device.vendor || "",
      deviceModel:
        result.device.model || "",

      // Location
      country: geo?.country || "",
      city: geo?.city || "",

      // Language
      language:
        req.headers["accept-language"]
          ?.split(",")[0] || "",

      // Navigation
      currentUrl: `${req.protocol}://${req.get(
        "host"
      )}${req.originalUrl}`,

      referrer:
        req.headers["referer"] || "",

      // Event
      eventType: "page_view",
      eventName: req.originalUrl,

      metadata: {
        method: req.method,
      },
    };

    // Check latest visit from same IP to same URL
    const recent = await UserTracking.findOne({
    ip,
    currentUrl: trackingData.currentUrl,
    }).sort({ createdAt: -1 });

    // Skip if same page was visited recently
    if (recent) {
    const diffMs =
        Date.now() -
        new Date(recent.createdAt).getTime();

    const diffMinutes =
        diffMs / (1000 * 60);

    if (diffMinutes < 5) {
        req.tracking = trackingData;
        return next();
    }
    }

    // Save tracking
    UserTracking.create(trackingData).catch(
    (err) =>
        console.error(
        "UserTracking save error:",
        err.message
        )
    );

    req.tracking = trackingData;

    next();
  } catch (error) {
    console.error(
      "UserTracking middleware error:",
      error.message
    );

    next();
  }
};