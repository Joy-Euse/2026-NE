-- Set default status to REQUESTED now that the enum value is committed
ALTER TABLE "inspections" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
