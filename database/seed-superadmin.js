import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../config/db.js";
import User from "../v1/modules/auth/model/auth.model.js";

const seedSuperAdmin = async () => {
  await connectDB();

  const existing = await User.findOneSuperadmin();
  if (existing) {
    const user = await User.findById(existing.id);
    console.log("⚠️  A superadmin already exists:", user.mobileNumber);
    return process.exit(0);
  }

  const superadmin = await User.create({
    role: "superadmin",
    fullName: "Super Admin",
    mobileNumber: "01700000000",
    email: "superadmin@racar.com",
    password: "SuperAdmin@123", // change after first login
    isVerified: true,
    isActivated: true,
    centralStatus: "active",
  });

  console.log("✅ Superadmin created:");
  console.log("   mobileNumber:", superadmin.mobileNumber);
  console.log("   password: SuperAdmin@123  (change this immediately)");

  process.exit(0);
};

seedSuperAdmin().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
