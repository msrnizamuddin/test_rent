// Thin server-side proxy over the LocationIQ REST APIs.
//
// The API key never reaches the browser — every call from the frontend's
// location search bar goes through our backend, which attaches the key and
// forwards the response.

const BASE_URL = "https://us1.locationiq.com/v1";
const COUNTRY = "bd"; // restrict results to Bangladesh; remove if not needed

// --- Simple token-bucket limiter: LocationIQ free tier allows 2 req/sec ---
const MAX_REQUESTS_PER_WINDOW = 2;
const WINDOW_MS = 1100; // slight buffer over 1s
let queue = Promise.resolve();
let windowStart = Date.now();
let windowCount = 0;

const throttle = () => {
  queue = queue.then(async () => {
    const now = Date.now();
    if (now - windowStart >= WINDOW_MS) {
      windowStart = now;
      windowCount = 0;
    }
    if (windowCount >= MAX_REQUESTS_PER_WINDOW) {
      const wait = WINDOW_MS - (now - windowStart);
      await new Promise((r) => setTimeout(r, wait));
      windowStart = Date.now();
      windowCount = 0;
    }
    windowCount += 1;
  });
  return queue;
};
// ---------------------------------------------------------------------

const buildError = (message, statusCode = 502) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getApiKey = () => {
  const key = process.env.LOCATIONIQ_API_KEY;
  if (!key) {
    throw buildError(
      "LocationIQ is not configured on the server (missing LOCATIONIQ_API_KEY)",
      500,
    );
  }
  return key;
};

const callLocationIQ = async (
  path,
  params,
  { silentOnRateLimit = false } = {},
) => {
  await throttle(); // wait for a free slot before calling LocationIQ

  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  }

  const response = await fetch(url).catch(() => null);
  if (!response) throw buildError("Failed to reach LocationIQ");

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // LocationIQ returns 404 with {error: "Unable to geocode"} for zero results
    if (response.status === 404) return null;

    if (response.status === 429) {
      // Rate limited — the search bar calls this rapidly while typing, so a
      // transient 429 should look like "no suggestions yet", not a hard error.
      if (silentOnRateLimit) return null;
      throw buildError("LocationIQ rate limit hit, try again shortly", 429);
    }

    throw buildError(
      body?.error || `LocationIQ error: ${response.status}`,
      502,
    );
  }

  return body;
};

// Used as the user types into the location search bar — returns place
// suggestions. LocationIQ already includes lat/lon, so no separate
// "place details" round trip is required, but placeId is kept for
// interface compatibility with the frontend.
const autocomplete = async (input) => {
  const body = await callLocationIQ(
    "autocomplete",
    { q: input, countrycodes: COUNTRY, limit: 8 },
    { silentOnRateLimit: true }, // typing-triggered — fail quietly, never a 502 to the UI
  );

  return (body || []).map((p) => ({
    placeId: `${p.osm_type}:${p.osm_id}`,
    description: p.display_name,
    mainText: p.display_place || p.display_name?.split(",")[0],
    secondaryText: p.display_address,
    latitude: Number(p.lat),
    longitude: Number(p.lon),
  }));
};

// Resolves a placeId (osm_type:osm_id, from autocomplete) back to full
// details. If the frontend already stored lat/lng from the autocomplete
// call, this step can be skipped entirely.
const placeDetails = async (placeId) => {
  const [osmType, osmId] = String(placeId).split(":");
  if (!osmType || !osmId) throw buildError("Invalid placeId", 400);

  const typeMap = { node: "N", way: "W", relation: "R" };
  const body = await callLocationIQ("lookup", {
    osm_ids: `${typeMap[osmType] || osmType}${osmId}`,
  });

  const result = body?.[0];
  if (!result) throw buildError("Place not found", 404);

  return {
    placeId,
    name: result.display_place || result.display_name?.split(",")[0],
    formattedAddress: result.display_name,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
};

// Free-text address -> coordinates, for locations typed without using
// autocomplete (e.g. imported data, manual entry).
const geocode = async (address) => {
  const body = await callLocationIQ("search", { q: address, limit: 1 });
  const result = body?.[0];
  if (!result) throw buildError("Address not found", 404);

  return {
    formattedAddress: result.display_name,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
};

// Pickup -> destination distance/duration estimate for the rental estimate
// module. LocationIQ's Matrix API needs coordinates, so plain addresses are
// geocoded first.
const toLatLng = async (value) => {
  const parts = String(value)
    .split(",")
    .map((v) => v.trim());
  if (parts.length === 2 && parts.every((v) => !isNaN(Number(v)))) {
    return { lat: Number(parts[0]), lon: Number(parts[1]) };
  }
  const geo = await geocode(value);
  return { lat: geo.latitude, lon: geo.longitude };
};

const distance = async (origin, destination) => {
  const from = await toLatLng(origin);
  const to = await toLatLng(destination);

  const body = await callLocationIQ(
    `matrix/driving/${from.lon},${from.lat};${to.lon},${to.lat}`,
    { annotations: "distance,duration" },
  );

  const distanceMeters = body?.distances?.[0]?.[1];
  const durationSeconds = body?.durations?.[0]?.[1];

  if (distanceMeters == null) {
    throw buildError(
      "Could not calculate distance for the given locations",
      404,
    );
  }

  const km = distanceMeters / 1000;
  const minutes = Math.round(durationSeconds / 60);

  return {
    distanceKm: km,
    distanceText: `${km.toFixed(1)} km`,
    durationText:
      minutes >= 60
        ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
        : `${minutes} min`,
    durationSeconds,
  };
};

export default { autocomplete, placeDetails, geocode, distance };
