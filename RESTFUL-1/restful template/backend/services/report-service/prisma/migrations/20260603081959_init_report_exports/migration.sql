-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DASHBOARD', 'INVENTORY', 'INSPECTIONS', 'COMPLIANCE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('PDF', 'CSV');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "report_exports" (
    "id" TEXT NOT NULL,
    "requested_by_user_id" TEXT NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "filters" JSONB,
    "status" "ExportStatus" NOT NULL,
    "file_name" TEXT,
    "file_path" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "report_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_exports_requested_by_user_id_created_at_idx" ON "report_exports"("requested_by_user_id", "created_at");

-- CreateIndex
CREATE INDEX "report_exports_report_type_format_idx" ON "report_exports"("report_type", "format");

-- CreateIndex
CREATE INDEX "report_exports_status_created_at_idx" ON "report_exports"("status", "created_at");
