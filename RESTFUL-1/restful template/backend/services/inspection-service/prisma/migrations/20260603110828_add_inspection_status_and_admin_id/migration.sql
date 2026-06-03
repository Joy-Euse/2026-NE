-- AlterEnum: Add REQUESTED and ASSIGNED to InspectionStatus
-- PostgreSQL requires enum values to be committed before they can be used
-- as column defaults. We add the values here without changing the default.
ALTER TYPE "InspectionStatus" ADD VALUE IF NOT EXISTS 'REQUESTED';
ALTER TYPE "InspectionStatus" ADD VALUE IF NOT EXISTS 'ASSIGNED';

-- AlterTable: Add assigned_by_admin_id column only (default change is in next migration)
ALTER TABLE "inspections" ADD COLUMN IF NOT EXISTS "assigned_by_admin_id" TEXT;
