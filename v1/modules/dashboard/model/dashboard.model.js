import { prisma } from "../../../../config/db.js";

// ---------------- 6.1 Super Admin Dashboard ----------------
const getOverviewStats = async () => {
  const [
    totalUsers,
    totalVehicles,
    totalDrivers,
    totalManagers,
    pendingVehicles,
    pendingDriverAccounts,
    pendingRentalRequests,
    confirmedRentals,
    activeTrips,
    completedTrips,
    cancelledTrips,
    paidRevenue,
    todaysTrips,
    upcomingTrips,
    recentRequests,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "customer" } }),
    prisma.vehicle.count(),
    prisma.user.count({ where: { role: "driver" } }),
    prisma.user.count({ where: { role: "manager" } }),
    prisma.vehicle.count({ where: { availabilityStatus: "pending" } }),
    prisma.user.count({ where: { role: "driver", driverStatus: "pending" } }),
    prisma.rentalRequest.count({
      where: { status: { in: ["submitted", "under_review", "estimate_provided", "waiting_confirmation"] } },
    }),
    prisma.rentalRequest.count({ where: { status: "confirmed" } }),
    prisma.trip.count({
      where: {
        status: {
          in: [
            "confirmed",
            "vehicle_assigned",
            "driver_assigned",
            "driver_accepted",
            "driver_on_the_way",
            "customer_picked_up",
            "trip_started",
            "trip_in_progress",
            "destination_reached",
            "return_started",
          ],
        },
      },
    }),
    prisma.trip.count({ where: { status: "trip_completed" } }),
    prisma.trip.count({ where: { status: "cancelled" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    prisma.trip.count({ where: { pickupDate: { equals: new Date(new Date().toDateString()) } } }),
    prisma.trip.count({
      where: {
        pickupDate: { gt: new Date(new Date().toDateString()) },
        status: { notIn: ["trip_completed", "cancelled"] },
      },
    }),
    prisma.rentalRequest.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerId: true,
        tripType: true,
        status: true,
        estimatedRent: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalUsers,
    totalVehicles,
    totalDrivers,
    totalManagers,
    pendingVehicleRequests: pendingVehicles,
    pendingDriverRequests: pendingDriverAccounts,
    pendingRentalRequests,
    confirmedRentals,
    activeTrips,
    completedTrips,
    cancelledTrips,
    totalRevenue: paidRevenue._sum.amount ? paidRevenue._sum.amount.toNumber() : 0,
    todaysTrips,
    upcomingTrips,
    recentRequests,
  };
};

// ---------------- 28. Reports & Analytics ----------------
const getUserReport = async () => {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [total, active, newUsers] = await Promise.all([
    prisma.user.count({ where: { role: "customer" } }),
    prisma.user.count({ where: { role: "customer", centralStatus: "active" } }),
    prisma.user.count({ where: { role: "customer", createdAt: { gte: since30d } } }),
  ]);
  return { totalUsers: total, activeUsers: active, newUsersLast30Days: newUsers };
};

const getVehicleReport = async () => {
  const [total, available, rented, maintenance] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { availabilityStatus: "available" } }),
    prisma.vehicle.count({ where: { availabilityStatus: { in: ["assigned", "on_trip"] } } }),
    prisma.vehicle.count({ where: { availabilityStatus: "maintenance" } }),
  ]);

  const mostRented = await prisma.trip.groupBy({
    by: ["vehicleId"],
    where: { vehicleId: { not: null } },
    _count: { vehicleId: true },
    orderBy: { _count: { vehicleId: "desc" } },
    take: 5,
  });

  return {
    totalVehicles: total,
    availableVehicles: available,
    rentedVehicles: rented,
    maintenanceVehicles: maintenance,
    mostRentedVehicles: mostRented.map((v) => ({ vehicleId: v.vehicleId, tripCount: v._count.vehicleId })),
  };
};

const getDriverReport = async () => {
  const [total, active, available, assigned] = await Promise.all([
    prisma.user.count({ where: { role: "driver" } }),
    prisma.user.count({ where: { role: "driver", centralStatus: "active" } }),
    prisma.user.count({ where: { role: "driver", driverStatus: "available" } }),
    prisma.user.count({ where: { role: "driver", driverStatus: "assigned" } }),
  ]);

  const earningsByDriver = await prisma.trip.groupBy({
    by: ["driverId"],
    where: { driverId: { not: null }, status: "trip_completed" },
    _sum: { finalRent: true },
    _count: { driverId: true },
  });

  return {
    totalDrivers: total,
    activeDrivers: active,
    availableDrivers: available,
    assignedDrivers: assigned,
    driverEarnings: earningsByDriver.map((d) => ({
      driverId: d.driverId,
      completedTrips: d._count.driverId,
      totalEarnings: d._sum.finalRent ? d._sum.finalRent.toNumber() : 0,
    })),
  };
};

const getTripReport = async () => {
  const [total, single, round, down, completed, cancelled, pending] = await Promise.all([
    prisma.trip.count(),
    prisma.trip.count({ where: { tripType: "single" } }),
    prisma.trip.count({ where: { tripType: "round" } }),
    prisma.trip.count({ where: { tripType: "down" } }),
    prisma.trip.count({ where: { status: "trip_completed" } }),
    prisma.trip.count({ where: { status: "cancelled" } }),
    prisma.rentalRequest.count({ where: { status: { in: ["submitted", "under_review"] } } }),
  ]);
  return {
    totalTrips: total,
    singleTrips: single,
    roundTrips: round,
    downTrips: down,
    completedTrips: completed,
    cancelledTrips: cancelled,
    pendingTrips: pending,
  };
};

const getFinancialReport = async () => {
  const [totalPaid, refunded] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "refunded" } }),
  ]);

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since365d = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const [daily, monthly, yearly] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", paidAt: { gte: since24h } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", paidAt: { gte: since30d } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", paidAt: { gte: since365d } } }),
  ]);

  const toNum = (agg) => (agg._sum.amount ? agg._sum.amount.toNumber() : 0);

  return {
    totalRevenue: toNum(totalPaid),
    totalRefunded: toNum(refunded),
    dailyRevenue: toNum(daily),
    monthlyRevenue: toNum(monthly),
    yearlyRevenue: toNum(yearly),
  };
};

export default {
  getOverviewStats,
  getUserReport,
  getVehicleReport,
  getDriverReport,
  getTripReport,
  getFinancialReport,
};
