-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PASS', 'FAIL', 'NEEDS_MAINTENANCE', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "extinguisher_id" TEXT NOT NULL,
    "scheduled_by_user_id" TEXT NOT NULL,
    "assigned_inspector_id" TEXT,
    "inspection_date" DATE NOT NULL,
    "inspection_time" TEXT NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "result" "InspectionResult",
    "result_notes" TEXT,
    "cancel_reason" TEXT,
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" TEXT NOT NULL,
    "extinguisher_id" TEXT NOT NULL,
    "inspection_id" TEXT,
    "inspector_id" TEXT NOT NULL,
    "action_taken" TEXT NOT NULL,
    "maintenance_date" DATE NOT NULL,
    "issues_identified" TEXT,
    "notes" TEXT,
    "recommendations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspections_extinguisher_id_inspection_date_idx" ON "inspections"("extinguisher_id", "inspection_date");

-- CreateIndex
CREATE INDEX "inspections_assigned_inspector_id_status_idx" ON "inspections"("assigned_inspector_id", "status");

-- CreateIndex
CREATE INDEX "inspections_status_inspection_date_idx" ON "inspections"("status", "inspection_date");

-- CreateIndex
CREATE INDEX "maintenance_logs_extinguisher_id_maintenance_date_idx" ON "maintenance_logs"("extinguisher_id", "maintenance_date");

-- CreateIndex
CREATE INDEX "maintenance_logs_inspection_id_idx" ON "maintenance_logs"("inspection_id");

-- CreateIndex
CREATE INDEX "maintenance_logs_inspector_id_maintenance_date_idx" ON "maintenance_logs"("inspector_id", "maintenance_date");

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
