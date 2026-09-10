// import { Prisma } from "@prisma/client";
// import { prisma } from "../../../../config/db.js";

// // Prisma enum member names can't contain hyphens, so the "on-trip" value
// // (also used by driverStatus/rental workflows) is stored as availabilityStatus
// // "on_trip" with a @map() back to "on-trip" on disk. Keep the wire-facing API
// // on the original hyphenated spelling despite that.
// const AVAILABILITY_TO_ENUM = { "on-trip": "on_trip" };
// const AVAILABILITY_FROM_ENUM = { on_trip: "on-trip" };
// const toAvailabilityEnum = (v) => (v ? AVAILABILITY_TO_ENUM[v] || v : v);
// const fromAvailabilityEnum = (v) => (v ? AVAILABILITY_FROM_ENUM[v] || v : v);

// const mapVehicle = (row) => {
//   if (!row) return null;
//   const { createdById, updatedById, ...rest } = row;
//   return {
//     ...rest,
//     availabilityStatus: fromAvailabilityEnum(row.availabilityStatus),
//     ...(createdById !== undefined ? { createdBy: createdById } : {}),
//     ...(updatedById !== undefined ? { updatedBy: updatedById } : {}),
//   };
// };

// const SELECT = {
//   id: true,
//   vehicleName: true,
//   brand: true,
//   vehicleModel: true,
//   categoryId: true,
//   vehicleType: true,
//   images: true,
//   registrationNumber: true,
//   modelYear: true,
//   seatingCapacity: true,
//   fuelType: true,
//   transmission: true,
//   isAC: true,
//   features: true,
//   color: true,
//   condition: true,
//   location: true,
//   estimatedRentalRate: true,
//   availabilityStatus: true,
//   driverRequired: true,
//   ownerInfo: true,
//   documents: true,
//   assignedDriverId: true,
//   ownerDriverId: true,
//   createdById: true,
//   updatedById: true,
//   createdAt: true,
//   updatedAt: true,
// };

// // Browsing only shows vehicles that are actually rentable/visible to the public
// const PUBLICLY_VISIBLE_STATUSES = ["available", "assigned", "on_trip"];

// const search = async ({
//   search: searchTerm,
//   brand,
//   categoryId,
//   location,
//   vehicleType,
//   seatingCapacity,
//   minPrice,
//   maxPrice,
//   isAC,
//   transmission,
//   fuelType,
//   availability,
//   condition,
//   page,
//   limit,
//   sortBy,
//   sortOrder,
// }) => {
//   const where = {
//     availabilityStatus: availability
//       ? toAvailabilityEnum(availability)
//       : { in: PUBLICLY_VISIBLE_STATUSES },
//   };

//   if (condition) where.condition = condition;

//   if (searchTerm) {
//     where.OR = [
//       { vehicleName: { contains: searchTerm, mode: "insensitive" } },
//       { brand: { contains: searchTerm, mode: "insensitive" } },
//     ];
//   }
//   if (brand) where.brand = { equals: brand, mode: "insensitive" };
//   if (categoryId) where.categoryId = categoryId;
//   if (vehicleType) where.vehicleType = vehicleType;
//   if (seatingCapacity) where.seatingCapacity = { gte: seatingCapacity };
//   if (typeof isAC === "boolean") where.isAC = isAC;
//   if (transmission) where.transmission = transmission;
//   if (fuelType) {
//     where.fuelType = {
//       hasSome: Array.isArray(fuelType) ? fuelType : [fuelType],
//     };
//   }

//   if (location) {
//     // `string_contains` only matches when the STORED field contains the
//     // query — backwards when the query is a full autocomplete address like
//     // "Gulshan 1, Dhaka, Bangladesh" against a short stored city="Dhaka"
//     // (which can never contain the longer string). Splitting the query
//     // into its comma-separated parts and matching each part separately
//     // catches the common case: the "Dhaka" part on its own does match a
//     // stored city of "Dhaka".
//     const locationTokens = [
//       ...new Set(
//         location
//           .split(",")
//           .map((part) => part.trim())
//           .filter(Boolean),
//       ),
//     ];

//     where.OR = (where.OR || []).concat(
//       locationTokens.flatMap((token) => [
//         {
//           location: {
//             path: ["city"],
//             string_contains: token,
//             mode: "insensitive",
//           },
//         },
//         {
//           location: {
//             path: ["district"],
//             string_contains: token,
//             mode: "insensitive",
//           },
//         },
//         {
//           location: {
//             path: ["address"],
//             string_contains: token,
//             mode: "insensitive",
//           },
//         },
//       ]),
//       // location is optional on a vehicle — a listing that never filled it
//       // in isn't a "no match", it's "unknown", so it stays visible instead
//       // of silently vanishing from every location-scoped search.
//       [
//         { location: { equals: Prisma.DbNull } },
//         { location: { equals: Prisma.JsonNull } },
//       ],
//     );
//   }

//   if (minPrice !== undefined || maxPrice !== undefined) {
//     where.AND = [
//       ...(minPrice !== undefined
//         ? [{ estimatedRentalRate: { path: ["perDay"], gte: minPrice } }]
//         : []),
//       ...(maxPrice !== undefined
//         ? [{ estimatedRentalRate: { path: ["perDay"], lte: maxPrice } }]
//         : []),
//     ];
//   }

//   // Prisma can't order by a path inside a Json column, so a price sort
//   // falls back to the newest-first default rather than reaching for raw SQL.
//   const orderBy =
//     sortBy === "modelYear"
//       ? { modelYear: sortOrder === "asc" ? "asc" : "desc" }
//       : { createdAt: sortOrder === "asc" ? "asc" : "desc" };

//   const [vehicles, total] = await Promise.all([
//     prisma.vehicle.findMany({
//       where,
//       select: SELECT,
//       orderBy,
//       skip: (page - 1) * limit,
//       take: limit,
//     }),
//     prisma.vehicle.count({ where }),
//   ]);

//   return { vehicles: vehicles.map(mapVehicle), total };
// };

// // Safe "get everything" — no where clause, every vehicle regardless of status.
// const getAll = async () => {
//   const vehicles = await prisma.vehicle.findMany({
//     select: SELECT,
//     orderBy: { createdAt: "desc" },
//   });
//   return vehicles.map(mapVehicle);
// };

// const findPubliclyVisibleById = async (id) => {
//   const vehicle = await prisma.vehicle.findFirst({
//     where: { id, availabilityStatus: { in: PUBLICLY_VISIBLE_STATUSES } },
//     select: SELECT,
//   });
//   return mapVehicle(vehicle);
// };

// const findById = async (id) => {
//   const vehicle = await prisma.vehicle.findUnique({
//     where: { id },
//     select: SELECT,
//   });
//   return mapVehicle(vehicle);
// };

// const findByRegistrationNumber = async (registrationNumber, excludeId) =>
//   prisma.vehicle.findFirst({
//     where: {
//       registrationNumber,
//       ...(excludeId ? { id: { not: excludeId } } : {}),
//     },
//     select: { id: true },
//   });

// const create = async (payload, userId) => {
//   const vehicle = await prisma.vehicle.create({
//     data: {
//       vehicleName: payload.vehicleName,
//       brand: payload.brand,
//       vehicleModel: payload.vehicleModel,
//       categoryId: payload.categoryId || null,
//       vehicleType: payload.vehicleType,
//       images: payload.images || [],
//       registrationNumber: payload.registrationNumber,
//       modelYear: payload.modelYear,
//       seatingCapacity: payload.seatingCapacity,
//       fuelType: payload.fuelType,
//       transmission: payload.transmission,
//       isAC: payload.isAC ?? true,
//       features: payload.features || [],
//       color: payload.color || null,
//       condition: payload.condition || "new",
//       location: payload.location ?? null,
//       estimatedRentalRate: payload.estimatedRentalRate ?? null,
//       availabilityStatus:
//         toAvailabilityEnum(payload.availabilityStatus) || "pending",
//       driverRequired: payload.driverRequired ?? false,
//       ownerInfo: payload.ownerInfo ?? null,
//       documents: payload.documents || [],
//       assignedDriverId: payload.assignedDriverId ?? null,
//       ownerDriverId: payload.ownerDriverId ?? null,
//       createdById: userId,
//     },
//     select: SELECT,
//   });

//   return mapVehicle(vehicle);
// };

// // Only whitelisted camelCase keys are ever written — everything here already
// // matches the Prisma field name 1:1 except `updatedBy` -> `updatedById`.
// const FIELD_MAP = {
//   vehicleName: "vehicleName",
//   brand: "brand",
//   vehicleModel: "vehicleModel",
//   categoryId: "categoryId",
//   vehicleType: "vehicleType",
//   images: "images",
//   registrationNumber: "registrationNumber",
//   modelYear: "modelYear",
//   seatingCapacity: "seatingCapacity",
//   fuelType: "fuelType",
//   transmission: "transmission",
//   isAC: "isAC",
//   features: "features",
//   color: "color",
//   condition: "condition",
//   location: "location",
//   estimatedRentalRate: "estimatedRentalRate",
//   availabilityStatus: "availabilityStatus",
//   driverRequired: "driverRequired",
//   ownerInfo: "ownerInfo",
//   documents: "documents",
//   assignedDriverId: "assignedDriverId",
//   ownerDriverId: "ownerDriverId",
//   updatedBy: "updatedById",
// };

// const updateById = async (id, payload) => {
//   const data = {};
//   for (const [key, value] of Object.entries(payload)) {
//     if (FIELD_MAP[key] === undefined) continue;
//     data[FIELD_MAP[key]] =
//       key === "availabilityStatus" ? toAvailabilityEnum(value) : value;
//   }
//   if (!Object.keys(data).length) return findById(id);

//   try {
//     const vehicle = await prisma.vehicle.update({
//       where: { id },
//       data,
//       select: SELECT,
//     });
//     return mapVehicle(vehicle);
//   } catch (error) {
//     if (error.code === "P2025") return null; // record not found
//     throw error;
//   }
// };

// const findDriverById = async (id) =>
//   prisma.user.findFirst({
//     where: { id, role: "driver" },
//     select: { id: true },
//   });

// // The other vehicle (if any) this driver is already the assignedDriver of —
// // a driver can only be actively assigned to one vehicle at a time.
// const findActiveAssignmentForDriver = async (driverId, excludeVehicleId) =>
//   prisma.vehicle.findFirst({
//     where: {
//       assignedDriverId: driverId,
//       ...(excludeVehicleId ? { id: { not: excludeVehicleId } } : {}),
//     },
//     select: { id: true, vehicleName: true, registrationNumber: true },
//   });

// const deleteById = async (id) => {
//   try {
//     return await prisma.vehicle.delete({ where: { id }, select: { id: true } });
//   } catch (error) {
//     if (error.code === "P2025") return null; // record not found
//     throw error;
//   }
// };

// export default {
//   search,
//   getAll,
//   findPubliclyVisibleById,
//   findById,
//   findByRegistrationNumber,
//   findDriverById,
//   findActiveAssignmentForDriver,
//   create,
//   updateById,
//   deleteById,
// };
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/db.js";

// Prisma enum member names can't contain hyphens, so the "on-trip" value
// (also used by driverStatus/rental workflows) is stored as availabilityStatus
// "on_trip" with a @map() back to "on-trip" on disk. Keep the wire-facing API
// on the original hyphenated spelling despite that.
const AVAILABILITY_TO_ENUM = { "on-trip": "on_trip" };
const AVAILABILITY_FROM_ENUM = { on_trip: "on-trip" };
const toAvailabilityEnum = (v) => (v ? AVAILABILITY_TO_ENUM[v] || v : v);
const fromAvailabilityEnum = (v) => (v ? AVAILABILITY_FROM_ENUM[v] || v : v);

const mapVehicle = (row) => {
  if (!row) return null;
  const { createdById, updatedById, ...rest } = row;
  return {
    ...rest,
    availabilityStatus: fromAvailabilityEnum(row.availabilityStatus),
    ...(createdById !== undefined ? { createdBy: createdById } : {}),
    ...(updatedById !== undefined ? { updatedBy: updatedById } : {}),
  };
};

const SELECT = {
  id: true,
  vehicleName: true,
  brand: true,
  vehicleModel: true,
  categoryId: true,
  vehicleType: true,
  images: true,
  registrationNumber: true,
  modelYear: true,
  seatingCapacity: true,
  fuelType: true,
  transmission: true,
  isAC: true,
  features: true,
  color: true,
  condition: true,
  location: true,
  estimatedRentalRate: true,
  availabilityStatus: true,
  driverRequired: true,
  ownerInfo: true,
  documents: true,
  assignedDriverId: true,
  ownerDriverId: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
};

// Browsing only shows vehicles that are actually rentable/visible to the
// public. "approved" is included alongside the operational statuses because
// an admin approving a vehicle is exactly what's supposed to make it
// visible — without it, every freshly-approved vehicle stayed invisible
// until something else moved it to "available".
const PUBLICLY_VISIBLE_STATUSES = [
  "approved",
  "available",
  "assigned",
  "on_trip",
];

// The admin "Vehicle photos" upload UI never writes to vehicle.images — it
// saves each photo as its own Document row (ownerType: "vehicle",
// category: "vehicle_photo"), which is why vehicle.images always stayed an
// empty array. This pulls those Document rows in and overlays their
// fileUrls onto each vehicle's `images`, so every existing consumer
// (mapVehicleToProduct, detail pages, etc.) keeps reading from `images`
// without needing to know Documents exist. Rejected photos are excluded;
// pending ones are still shown (a photo awaiting review is still a real
// photo of the car). Falls back to the vehicle's own `images` column
// (currently always empty, but kept in case that's ever populated
// directly) when there are no photo Documents at all.
const attachVehiclePhotos = async (vehicleOrVehicles) => {
  const isArray = Array.isArray(vehicleOrVehicles);
  const list = (isArray ? vehicleOrVehicles : [vehicleOrVehicles]).filter(
    Boolean,
  );
  const ids = list.map((v) => v.id);
  if (!ids.length) return vehicleOrVehicles;

  const photoDocs = await prisma.document.findMany({
    where: {
      ownerType: "vehicle",
      ownerId: { in: ids },
      category: "vehicle_photo",
      status: { not: "rejected" },
    },
    select: { ownerId: true, fileUrl: true },
    orderBy: { createdAt: "asc" },
  });

  const photosByVehicleId = photoDocs.reduce((acc, doc) => {
    (acc[doc.ownerId] ||= []).push(doc.fileUrl);
    return acc;
  }, {});

  const withPhotos = (v) =>
    v && photosByVehicleId[v.id]?.length
      ? { ...v, images: photosByVehicleId[v.id] }
      : v;

  return isArray ? list.map(withPhotos) : withPhotos(list[0]);
};

// NOTE: `location`, `minPrice`/`maxPrice`, and `distanceKm` are intentionally
// NOT applied as `where` filters here. Vehicle browsing is category-based
// only (categoryId/vehicleType + the mechanical filters below). location and
// distanceKm still get passed straight through into vehicle.service.js's
// searchVehicles(), where they're used purely to calculate each vehicle's
// price via the matching PricingRule — they never remove a vehicle from the
// result set.
const search = async ({
  search: searchTerm,
  brand,
  categoryId,
  vehicleType,
  seatingCapacity,
  isAC,
  transmission,
  fuelType,
  availability,
  condition,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  const where = {
    availabilityStatus: availability
      ? toAvailabilityEnum(availability)
      : { in: PUBLICLY_VISIBLE_STATUSES },
  };

  if (condition) where.condition = condition;

  if (searchTerm) {
    where.OR = [
      { vehicleName: { contains: searchTerm, mode: "insensitive" } },
      { brand: { contains: searchTerm, mode: "insensitive" } },
    ];
  }
  if (brand) where.brand = { equals: brand, mode: "insensitive" };
  if (categoryId) where.categoryId = categoryId;
  if (vehicleType) where.vehicleType = vehicleType;
  if (seatingCapacity) where.seatingCapacity = { gte: seatingCapacity };
  if (typeof isAC === "boolean") where.isAC = isAC;
  if (transmission) where.transmission = transmission;
  if (fuelType) {
    where.fuelType = {
      hasSome: Array.isArray(fuelType) ? fuelType : [fuelType],
    };
  }

  // Prisma can't order by a path inside a Json column, so a price sort
  // falls back to the newest-first default rather than reaching for raw SQL.
  const orderBy =
    sortBy === "modelYear"
      ? { modelYear: sortOrder === "asc" ? "asc" : "desc" }
      : { createdAt: sortOrder === "asc" ? "asc" : "desc" };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      select: SELECT,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  const vehiclesWithPhotos = await attachVehiclePhotos(
    vehicles.map(mapVehicle),
  );

  return { vehicles: vehiclesWithPhotos, total };
};

// Safe "get everything" — no where clause, every vehicle regardless of status.
const getAll = async () => {
  const vehicles = await prisma.vehicle.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return vehicles.map(mapVehicle);
};

const findPubliclyVisibleById = async (id) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, availabilityStatus: { in: PUBLICLY_VISIBLE_STATUSES } },
    select: SELECT,
  });
  return attachVehiclePhotos(mapVehicle(vehicle));
};

const findById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: SELECT,
  });
  return attachVehiclePhotos(mapVehicle(vehicle));
};

const findByRegistrationNumber = async (registrationNumber, excludeId) =>
  prisma.vehicle.findFirst({
    where: {
      registrationNumber,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

const create = async (payload, userId) => {
  const vehicle = await prisma.vehicle.create({
    data: {
      vehicleName: payload.vehicleName,
      brand: payload.brand,
      vehicleModel: payload.vehicleModel,
      categoryId: payload.categoryId || null,
      vehicleType: payload.vehicleType,
      images: payload.images || [],
      registrationNumber: payload.registrationNumber,
      modelYear: payload.modelYear,
      seatingCapacity: payload.seatingCapacity,
      fuelType: payload.fuelType,
      transmission: payload.transmission,
      isAC: payload.isAC ?? true,
      features: payload.features || [],
      color: payload.color || null,
      condition: payload.condition || "new",
      location: payload.location ?? null,
      estimatedRentalRate: payload.estimatedRentalRate ?? null,
      availabilityStatus:
        toAvailabilityEnum(payload.availabilityStatus) || "pending",
      driverRequired: payload.driverRequired ?? false,
      ownerInfo: payload.ownerInfo ?? null,
      documents: payload.documents || [],
      assignedDriverId: payload.assignedDriverId ?? null,
      ownerDriverId: payload.ownerDriverId ?? null,
      createdById: userId,
    },
    select: SELECT,
  });

  return mapVehicle(vehicle);
};

// Only whitelisted camelCase keys are ever written — everything here already
// matches the Prisma field name 1:1 except `updatedBy` -> `updatedById`.
const FIELD_MAP = {
  vehicleName: "vehicleName",
  brand: "brand",
  vehicleModel: "vehicleModel",
  categoryId: "categoryId",
  vehicleType: "vehicleType",
  images: "images",
  registrationNumber: "registrationNumber",
  modelYear: "modelYear",
  seatingCapacity: "seatingCapacity",
  fuelType: "fuelType",
  transmission: "transmission",
  isAC: "isAC",
  features: "features",
  color: "color",
  condition: "condition",
  location: "location",
  estimatedRentalRate: "estimatedRentalRate",
  availabilityStatus: "availabilityStatus",
  driverRequired: "driverRequired",
  ownerInfo: "ownerInfo",
  documents: "documents",
  assignedDriverId: "assignedDriverId",
  ownerDriverId: "ownerDriverId",
  updatedBy: "updatedById",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] =
      key === "availabilityStatus" ? toAvailabilityEnum(value) : value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
      select: SELECT,
    });
    return mapVehicle(vehicle);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const findDriverById = async (id) =>
  prisma.user.findFirst({
    where: { id, role: "driver" },
    select: { id: true },
  });

// The other vehicle (if any) this driver is already the assignedDriver of —
// a driver can only be actively assigned to one vehicle at a time.
const findActiveAssignmentForDriver = async (driverId, excludeVehicleId) =>
  prisma.vehicle.findFirst({
    where: {
      assignedDriverId: driverId,
      ...(excludeVehicleId ? { id: { not: excludeVehicleId } } : {}),
    },
    select: { id: true, vehicleName: true, registrationNumber: true },
  });

const deleteById = async (id) => {
  try {
    return await prisma.vehicle.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

export default {
  search,
  getAll,
  findPubliclyVisibleById,
  findById,
  findByRegistrationNumber,
  findDriverById,
  findActiveAssignmentForDriver,
  create,
  updateById,
  deleteById,
};
