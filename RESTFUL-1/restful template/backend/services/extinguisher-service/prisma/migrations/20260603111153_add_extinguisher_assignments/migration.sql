-- CreateEnum
CREATE TYPE "ExtinguisherType" AS ENUM ('WATER', 'CO2', 'FOAM', 'DRY_CHEMICAL');

-- CreateEnum
CREATE TYPE "ExtinguisherSize" AS ENUM ('1.5 lb', '5 lb', '9 lb', '12 lb');

-- CreateEnum
CREATE TYPE "ExtinguisherStatus" AS ENUM ('ACTIVE', 'DUE_FOR_INSPECTION', 'UNDER_MAINTENANCE', 'EXPIRED', 'RETIRED');

-- CreateTable
CREATE TABLE "fire_extinguishers" (
    "id" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "floor" TEXT,
    "zone" TEXT,
    "type" "ExtinguisherType" NOT NULL,
    "size" "ExtinguisherSize" NOT NULL,
    "installation_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "status" "ExtinguisherStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fire_extinguishers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extinguisher_assignments" (
    "id" TEXT NOT NULL,
    "extinguisher_id" TEXT NOT NULL,
    "assigned_user_id" TEXT NOT NULL,
    "assigned_by_admin_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "extinguisher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extinguisher_status_history" (
    "id" TEXT NOT NULL,
    "extinguisher_id" TEXT NOT NULL,
    "old_status" "ExtinguisherStatus",
    "new_status" "ExtinguisherStatus" NOT NULL,
    "reason" TEXT,
    "changed_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extinguisher_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fire_extinguishers_serial_number_key" ON "fire_extinguishers"("serial_number");

-- CreateIndex
CREATE INDEX "fire_extinguishers_serial_number_idx" ON "fire_extinguishers"("serial_number");

-- CreateIndex
CREATE INDEX "fire_extinguishers_status_idx" ON "fire_extinguishers"("status");

-- CreateIndex
CREATE INDEX "fire_extinguishers_type_idx" ON "fire_extinguishers"("type");

-- CreateIndex
CREATE INDEX "fire_extinguishers_expiry_date_idx" ON "fire_extinguishers"("expiry_date");

-- CreateIndex
CREATE INDEX "fire_extinguishers_building_floor_zone_idx" ON "fire_extinguishers"("building", "floor", "zone");

-- CreateIndex
CREATE UNIQUE INDEX "extinguisher_assignments_extinguisher_id_key" ON "extinguisher_assignments"("extinguisher_id");

-- CreateIndex
CREATE INDEX "extinguisher_assignments_assigned_user_id_idx" ON "extinguisher_assignments"("assigned_user_id");

-- CreateIndex
CREATE INDEX "extinguisher_status_history_extinguisher_id_created_at_idx" ON "extinguisher_status_history"("extinguisher_id", "created_at");

-- CreateIndex
CREATE INDEX "extinguisher_status_history_new_status_idx" ON "extinguisher_status_history"("new_status");

-- AddForeignKey
ALTER TABLE "extinguisher_assignments" ADD CONSTRAINT "extinguisher_assignments_extinguisher_id_fkey" FOREIGN KEY ("extinguisher_id") REFERENCES "fire_extinguishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extinguisher_status_history" ADD CONSTRAINT "extinguisher_status_history_extinguisher_id_fkey" FOREIGN KEY ("extinguisher_id") REFERENCES "fire_extinguishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
