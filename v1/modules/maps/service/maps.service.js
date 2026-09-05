// Thin server-side proxy over the Google Maps Platform REST APIs.
//
// The API key never reaches the browser — every call from the frontend's
// location search bar goes through our backend, which attaches the key and
// forwards the response. This keeps GOOGLE_MAPS_API_KEY out of client
// bundles/devtools entirely (unlike a NEXT_PUBLIC_* key).

const BASE_URL = "https://maps.googleapis.com/maps/api";

const buildError = (message, statusCode = 502) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getApiKey = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw buildError(
      "Google Maps is not configured on the server (missing GOOGLE_MAPS_API_KEY)",
      500,
    );
  }
  return key;
};

const callGoogle = async (path, params) => {
  const url = new URL(`${BASE_URL}/${path}/json`);
  url.searchParams.set("key", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  }

  const response = await fetch(url).catch(() => null);
  if (!response || !response.ok) {
    throw buildError("Failed to reach Google Maps");
  }

  const body = await response.json();
  if (body.status && !["OK", "ZERO_RESULTS"].includes(body.status)) {
    throw buildError(body.error_message || `Google Maps error: ${body.status}`, 502);
  }

  return body;
};

// Used as the user types into the location search bar — returns place
// suggestions (description + place_id), no lat/lng yet.
const autocomplete = async (input, sessionToken) => {
  const body = await callGoogle("place/autocomplete", {
    input,
    sessiontoken: sessionToken,
    components: "country:bd",
  });

  return (body.predictions || []).map((p) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting?.main_text,
    secondaryText: p.structured_formatting?.secondary_text,
  }));
};

// Called once the user picks a suggestion — resolves it to a real address +
// coordinates for storing on the rental request / vehicle location.
const placeDetails = async (placeId, sessionToken) => {
  const body = await callGoogle("place/details", {
    place_id: placeId,
    sessiontoken: sessionToken,
    fields: "formatted_address,geometry,name",
  });

  const result = body.result;
  if (!result) throw buildError("Place not found", 404);

  return {
    placeId,
    name: result.name,
    formattedAddress: result.formatted_address,
    latitude: result.geometry?.location?.lat ?? null,
    longitude: result.geometry?.location?.lng ?? null,
  };
};

// Free-text address -> coordinates, for locations typed without using
// autocomplete (e.g. imported data, manual entry).
const geocode = async (address) => {
  const body = await callGoogle("geocode", { address });
  const result = body.results?.[0];
  if (!result) throw buildError("Address not found", 404);

  return {
    formattedAddress: result.formatted_address,
    latitude: result.geometry?.location?.lat ?? null,
    longitude: result.geometry?.location?.lng ?? null,
  };
};

// Pickup -> destination distance/duration estimate for the rental estimate
// module (spec section 5: Estimated Distance / Estimated Rent).
const distance = async (origin, destination) => {
  const body = await callGoogle("distancematrix", {
    origins: origin,
    destinations: destination,
    units: "metric",
  });

  const element = body.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") {
    throw buildError("Could not calculate distance for the given locations", 404);
  }

  return {
    distanceKm: element.distance?.value ? element.distance.value / 1000 : null,
    distanceText: element.distance?.text,
    durationText: element.duration?.text,
    durationSeconds: element.duration?.value ?? null,
  };
};

export default { autocomplete, placeDetails, geocode, distance };
