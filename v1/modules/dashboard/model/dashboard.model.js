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

export default { getOverviewStats };
