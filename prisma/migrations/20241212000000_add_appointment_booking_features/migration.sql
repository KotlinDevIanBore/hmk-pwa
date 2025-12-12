-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "locationType" "AppointmentLocationType" NOT NULL DEFAULT 'RESOURCE_CENTER',
ADD COLUMN "outreachLocationId" TEXT,
ADD COLUMN "serviceFee" DOUBLE PRECISION,
ADD COLUMN "ageGroup" TEXT;

-- AlterTable
ALTER TABLE "OutreachLocation" ADD COLUMN IF NOT EXISTS "appointments_appointmentId" TEXT;

-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "AppointmentLocationType" AS ENUM('RESOURCE_CENTER', 'OUTREACH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AppointmentConfig" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "locationType" "AppointmentLocationType" NOT NULL,
    "slotsAvailable" INTEGER,
    "slotsUnder15" INTEGER,
    "slotsOver15" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AppointmentConfig_date_key" ON "AppointmentConfig"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AppointmentConfig_date_locationType_idx" ON "AppointmentConfig"("date", "locationType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_locationType_idx" ON "Appointment"("locationType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_appointmentDate_appointmentTime_locationType_idx" ON "Appointment"("appointmentDate", "appointmentTime", "locationType");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_outreachLocationId_fkey" FOREIGN KEY ("outreachLocationId") REFERENCES "OutreachLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

