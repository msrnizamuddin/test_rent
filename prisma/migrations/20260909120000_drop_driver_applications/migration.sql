-- Driver self-registration no longer goes through a separate review table
-- (see the auth module's new POST /driver endpoint) — a driver now signs up
-- directly as a User with central_status 'inactive', and an admin activates
-- them from the existing Drivers list instead of a separate approve/reject step.

-- DropForeignKey
ALTER TABLE "driver_applications" DROP CONSTRAINT "driver_applications_reviewed_by_fkey";

-- DropTable
DROP TABLE "driver_applications";

-- DropEnum
DROP TYPE "driver_application_status";
